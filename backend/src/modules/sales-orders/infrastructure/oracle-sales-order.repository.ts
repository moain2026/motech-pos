import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../../../infrastructure/oracle/oracle.service';
import { OracleWriteService } from '../../../infrastructure/oracle/oracle-write.service';
import { uuidv7 } from '../../../shared/domain/uuid';
import {
  CreateSalesOrderInput,
  ListSalesOrdersFilter,
  MarkConvertedInput,
  OrderItemSnapshot,
  SalesOrderDetail,
  SalesOrderHeader,
  SalesOrderLine,
  SalesOrderRepository,
  SalesOrderStatus,
} from '../domain/ports/sales-order.port';

interface HeadRow {
  ID: string;
  ORDER_NO: number;
  STATUS: string;
  CUSTOMER_CODE: string | null;
  CUSTOMER_NAME: string | null;
  CURRENCY: string;
  REF_NO: string | null;
  NOTE: string | null;
  EXPIRE_DATE: Date | null;
  CREATED_BY: string;
  CREATED_AT: Date;
  CONVERTED_BILL_ID: string | null;
  CONVERTED_BILL_NO: string | null;
  CONVERTED_BY: string | null;
  CONVERTED_AT: Date | null;
  CANCELLED_BY: string | null;
  CANCELLED_AT: Date | null;
  LINE_CNT: number;
}

interface LineRow {
  ID: string;
  ITEM_CODE: string;
  ITEM_NAME: string | null;
  QTY: number;
  UNIT_PRICE: number | null;
  DISC_DTL: number;
  NOTE: string | null;
}

/**
 * OracleSalesOrderRepository — POST024 persistence. Orders live ONLY in
 * MOTECH_POS (SALES_ORDERS + SALES_ORDER_LINES, V021); item/customer
 * snapshots come read-only from the ERP master (IAS202623) with the local
 * overlay honoured (same precedence as the bill price authority). Header +
 * lines are one transaction; ORDER_NO comes from SEQ_SALES_ORDER_NO.
 */
@Injectable()
export class OracleSalesOrderRepository implements SalesOrderRepository {
  constructor(
    private readonly read: OracleService,
    private readonly write: OracleWriteService,
  ) {}

  private get schema(): string {
    return this.write.schema();
  }

  async create(input: CreateSalesOrderInput): Promise<SalesOrderDetail> {
    const id = uuidv7();
    await this.write.withTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO ${this.schema}.SALES_ORDERS
           (ID, ORDER_NO, CUSTOMER_CODE, CUSTOMER_NAME, CURRENCY, REF_NO,
            NOTE, EXPIRE_DATE, CREATED_BY)
         VALUES
           (:id, ${this.schema}.SEQ_SALES_ORDER_NO.NEXTVAL, :customerCode,
            :customerName, :currency, :refNo, :note,
            CASE WHEN :expireDate IS NULL THEN NULL
                 ELSE TO_DATE(:expireDate2, 'YYYY-MM-DD') END,
            :createdBy)`,
        {
          id,
          customerCode: input.customerCode,
          customerName: input.customerName,
          currency: input.currency,
          refNo: input.refNo,
          note: input.note,
          expireDate: input.expireDate,
          expireDate2: input.expireDate,
          createdBy: input.createdBy,
        },
      );
      for (const line of input.lines) {
        await conn.execute(
          `INSERT INTO ${this.schema}.SALES_ORDER_LINES
             (ID, ORDER_ID, ITEM_CODE, ITEM_NAME, QTY, UNIT_PRICE, DISC_DTL, NOTE)
           VALUES
             (:id, :orderId, :itemCode, :itemName, :qty, :unitPrice, :discDtl, :note)`,
          {
            id: uuidv7(),
            orderId: id,
            itemCode: line.itemCode,
            itemName: line.itemName,
            qty: line.qty,
            unitPrice: line.unitPrice,
            discDtl: line.discDtl,
            note: line.note,
          },
        );
      }
    });
    const created = await this.findById(id);
    if (!created) throw new Error('create: sales order vanished after insert');
    return created;
  }

  async findById(id: string): Promise<SalesOrderDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE o.ID = :k`,
      { k: id },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(id) };
  }

  async findByConvertKey(key: string): Promise<SalesOrderDetail | null> {
    const row = await this.write.queryOne<HeadRow>(
      `${this.headSelect()} WHERE o.CONVERT_IDEMPOTENCY_KEY = :k`,
      { k: key },
    );
    if (!row) return null;
    return { ...this.toHeader(row), lines: await this.linesOf(row.ID) };
  }

  async list(filter: ListSalesOrdersFilter): Promise<SalesOrderHeader[]> {
    const binds: Record<string, unknown> = { lim: filter.limit };
    const where: string[] = [];
    if (filter.status) {
      where.push('o.STATUS = :st');
      binds.st = filter.status;
    }
    if (filter.customerCode) {
      where.push('o.CUSTOMER_CODE = :cc');
      binds.cc = filter.customerCode;
    }
    const rows = await this.write.query<HeadRow>(
      `SELECT * FROM (
         ${this.headSelect()}
         ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
         ORDER BY o.CREATED_AT DESC
       ) WHERE ROWNUM <= :lim`,
      binds as BindParameters,
    );
    return rows.map((r) => this.toHeader(r));
  }

  async markConverted(
    input: MarkConvertedInput,
  ): Promise<SalesOrderDetail | null> {
    const res = await this.write.execute(
      `UPDATE ${this.schema}.SALES_ORDERS
       SET STATUS = 'CONVERTED', CONVERTED_BILL_ID = :billId,
           CONVERTED_BILL_NO = :billNo, CONVERTED_BY = :convertedBy,
           CONVERTED_AT = SYSTIMESTAMP, CONVERT_IDEMPOTENCY_KEY = :key
       WHERE ID = :id AND STATUS = 'OPEN'`,
      {
        billId: input.billId,
        billNo: input.billNo,
        convertedBy: input.convertedBy,
        key: input.idempotencyKey,
        id: input.orderId,
      },
    );
    if ((res.rowsAffected ?? 0) === 0) return null;
    return this.findById(input.orderId);
  }

  async cancel(
    id: string,
    cancelledBy: string,
  ): Promise<SalesOrderDetail | null> {
    const res = await this.write.execute(
      `UPDATE ${this.schema}.SALES_ORDERS
       SET STATUS = 'CANCELLED', CANCELLED_BY = :cancelledBy,
           CANCELLED_AT = SYSTIMESTAMP
       WHERE ID = :id AND STATUS = 'OPEN'`,
      { cancelledBy, id },
    );
    if ((res.rowsAffected ?? 0) === 0) return null;
    return this.findById(id);
  }

  async itemExists(itemCode: string): Promise<boolean> {
    const erp = await this.read.queryOne<{ ONE: number }>(
      `SELECT 1 AS ONE FROM ${this.read.masterSchema()}.IAS_ITM_MST
       WHERE I_CODE = :i`,
      { i: itemCode },
    );
    if (erp) return true;
    const overlay = await this.write.queryOne<{ ONE: number }>(
      `SELECT 1 AS ONE FROM ${this.schema}.ITEMS_OVERLAY
       WHERE CODE = :i AND NVL(INACTIVE, 0) = 0`,
      { i: itemCode },
    );
    return overlay != null;
  }

  async itemSnapshot(itemCode: string): Promise<OrderItemSnapshot> {
    const master = this.read.masterSchema();
    const name = await this.read.queryOne<{ I_NAME: string | null }>(
      `SELECT I_NAME FROM ${master}.IAS_ITM_MST WHERE I_CODE = :i`,
      { i: itemCode },
    );
    // Display price: local overlay first (bill authority order), else retail
    // level 1 (base unit). The conversion reprices server-side anyway.
    const overlay = await this.write.queryOne<{ PRICE: number | null; NAME: string | null }>(
      `SELECT PRICE, NAME FROM ${this.schema}.ITEMS_OVERLAY
       WHERE CODE = :i AND NVL(INACTIVE, 0) = 0`,
      { i: itemCode },
    );
    let price: number | null =
      overlay?.PRICE == null ? null : Number(overlay.PRICE);
    if (price == null) {
      const list = await this.read.queryOne<{ I_PRICE: number }>(
        `SELECT I_PRICE FROM (
           SELECT pr.I_PRICE,
                  ROW_NUMBER() OVER (ORDER BY pr.P_SIZE ASC, pr.ITM_UNT) AS RN
           FROM ${master}.IAS_ITEM_PRICE pr
           WHERE pr.I_CODE = :i AND pr.LEV_NO = 1
         ) WHERE RN = 1`,
        { i: itemCode },
      );
      price = list ? Number(list.I_PRICE) : null;
    }
    return {
      itemName: name?.I_NAME ?? overlay?.NAME ?? null,
      unitPrice: price,
    };
  }

  async customerName(customerCode: string): Promise<string | null> {
    const row = await this.read.queryOne<{
      C_A_NAME: string | null;
      C_E_NAME: string | null;
    }>(
      `SELECT C_A_NAME, C_E_NAME FROM ${this.read.masterSchema()}.CUSTOMER
       WHERE C_CODE = :c`,
      { c: customerCode },
    );
    if (row) return row.C_A_NAME ?? row.C_E_NAME ?? null;
    const overlay = await this.write.queryOne<{
      AR_NAME: string | null;
      EN_NAME: string | null;
    }>(
      `SELECT AR_NAME, EN_NAME FROM ${this.schema}.CUSTOMERS_OVERLAY
       WHERE CODE = :c`,
      { c: customerCode },
    );
    return overlay ? (overlay.AR_NAME ?? overlay.EN_NAME ?? null) : null;
  }

  // ---- helpers ----

  private headSelect(): string {
    return `
      SELECT o.ID, o.ORDER_NO, o.STATUS, o.CUSTOMER_CODE, o.CUSTOMER_NAME,
             o.CURRENCY, o.REF_NO, o.NOTE, o.EXPIRE_DATE, o.CREATED_BY,
             o.CREATED_AT, o.CONVERTED_BILL_ID, o.CONVERTED_BILL_NO,
             o.CONVERTED_BY, o.CONVERTED_AT, o.CANCELLED_BY, o.CANCELLED_AT,
             NVL(l.LINE_CNT, 0) AS LINE_CNT
      FROM ${this.schema}.SALES_ORDERS o
      LEFT JOIN (
        SELECT ORDER_ID, COUNT(*) AS LINE_CNT
        FROM ${this.schema}.SALES_ORDER_LINES GROUP BY ORDER_ID
      ) l ON l.ORDER_ID = o.ID`;
  }

  private async linesOf(orderId: string): Promise<SalesOrderLine[]> {
    const rows = await this.write.query<LineRow>(
      `SELECT ID, ITEM_CODE, ITEM_NAME, QTY, UNIT_PRICE, DISC_DTL, NOTE
       FROM ${this.schema}.SALES_ORDER_LINES
       WHERE ORDER_ID = :o
       ORDER BY ITEM_CODE`,
      { o: orderId },
    );
    return rows.map((r) => ({
      lineId: r.ID,
      itemCode: r.ITEM_CODE,
      itemName: r.ITEM_NAME,
      qty: Number(r.QTY),
      unitPrice: r.UNIT_PRICE == null ? null : Number(r.UNIT_PRICE),
      discDtl: Number(r.DISC_DTL),
      note: r.NOTE,
    }));
  }

  private toHeader(r: HeadRow): SalesOrderHeader {
    return {
      id: r.ID,
      orderNo: Number(r.ORDER_NO),
      status: r.STATUS as SalesOrderStatus,
      customerCode: r.CUSTOMER_CODE,
      customerName: r.CUSTOMER_NAME,
      currency: r.CURRENCY,
      refNo: r.REF_NO,
      note: r.NOTE,
      expireDate: r.EXPIRE_DATE ? r.EXPIRE_DATE.toISOString().slice(0, 10) : null,
      createdBy: r.CREATED_BY,
      createdAt: r.CREATED_AT.toISOString(),
      convertedBillId: r.CONVERTED_BILL_ID,
      convertedBillNo: r.CONVERTED_BILL_NO,
      convertedBy: r.CONVERTED_BY,
      convertedAt: r.CONVERTED_AT ? r.CONVERTED_AT.toISOString() : null,
      cancelledBy: r.CANCELLED_BY,
      cancelledAt: r.CANCELLED_AT ? r.CANCELLED_AT.toISOString() : null,
      lineCount: Number(r.LINE_CNT),
    };
  }
}
