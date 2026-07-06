import { describe, expect, it } from 'vitest';
import { ReportsService } from '../../src/modules/reports/application/reports.service';
import {
  CashierReportRow,
  CustomerStatementReport,
  LoyaltyReport,
  PaymentMethodReportRow,
  PosReportFilter,
  PosReportsRepository,
  ReceivableRow,
  ReturnsReportRow,
  ReturnsWindowReport,
  ShiftHistoryRow,
  ShiftSalesReportRow,
  VoucherSummaryReport,
} from '../../src/modules/reports/domain/ports/pos-reports-repository.port';
import { ReportsRepository } from '../../src/modules/reports/domain/ports/reports-repository.port';

const legacy = {} as unknown as ReportsRepository;

class FakePos implements PosReportsRepository {
  lastFilter?: PosReportFilter;
  byCashier(f: PosReportFilter): Promise<CashierReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        cashierNo: 12,
        billCount: 6,
        grossAmt: 48100,
        discountAmt: 0,
        vatAmt: 0,
        netAmt: 48100,
        cashCollected: 47960,
        cardCollected: 0,
        creditCollected: 0,
      },
    ]);
  }
  paymentMethods(f: PosReportFilter): Promise<PaymentMethodReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      { method: 'CASH', currency: 'YER', txnCount: 7, amount: 48160, amountInBill: 48160 },
      { method: 'CARD', currency: 'YER', txnCount: 3, amount: 160, amountInBill: 160 },
    ]);
  }
  returns(f: PosReportFilter): Promise<ReturnsReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      { day: '2026-07-01', returnCount: 5, grossAmt: 610, vatAmt: 0, netAmt: 610, refundAmt: 610 },
    ]);
  }
  cashierPaymentSummary(
    f: PosReportFilter & { cashierNo?: number },
  ): Promise<import('../../src/modules/reports/domain/ports/pos-reports-repository.port').CashierPaymentSummaryRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        cashierNo: 91,
        billCount: 1,
        netAmt: 15600,
        methods: [{ method: 'CASH', txnCount: 1, amountInBill: 15600 }],
        cashTotal: 15600,
        cardTotal: 0,
        creditTotal: 0,
        returnCount: 1,
        refundTotal: 7800,
      },
    ]);
  }
  byShift(
    f: PosReportFilter & { cashierNo?: number },
  ): Promise<ShiftSalesReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        shiftId: 's1',
        shiftNo: 90,
        cashierNo: 12,
        machineNo: 2,
        status: 'CLOSED',
        openedAt: '2026-07-04T08:00:00.000Z',
        closedAt: '2026-07-04T16:00:00.000Z',
        billCount: 4,
        grossAmt: 5000,
        discountAmt: 0,
        vatAmt: 0,
        netAmt: 5000,
        cashCollected: 4500,
        cardCollected: 500,
        creditCollected: 0,
        cashDifference: -50,
      },
    ]);
  }
  shiftsHistory(
    f: PosReportFilter & { status?: string },
  ): Promise<ShiftHistoryRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        shiftId: 's1',
        shiftNo: 90,
        shiftCode: null,
        cashierNo: 12,
        machineNo: 2,
        currency: 'YER',
        status: 'SETTLED',
        openedAt: '2026-07-04T08:00:00.000Z',
        closedAt: '2026-07-04T16:00:00.000Z',
        openingBalance: 1000,
        closingBalance: 5450,
        expectedCash: 5500,
        cashDifference: -50,
        countedCash: 5450,
        settleDifference: -50,
        settledAt: '2026-07-04T16:10:00.000Z',
        cashReceipts: 250,
        cashExpenses: 250,
      },
    ]);
  }
  customerStatement(
    f: PosReportFilter & { customerCode: string },
  ): Promise<CustomerStatementReport> {
    this.lastFilter = f;
    return Promise.resolve({
      customerCode: f.customerCode,
      customerName: 'محمد العباسي',
      from: f.from ?? null,
      to: f.to ?? null,
      bills: [],
      returns: [],
      points: [],
      collections: [],
      totals: {
        billCount: 3,
        salesTotal: 700,
        returnCount: 1,
        returnsTotal: 50,
        pointsEarned: 234,
        pointsRedeemed: 20,
        creditTotal: 200,
        collectedTotal: 120,
        outstanding: 80,
      },
    });
  }
  receivables(): Promise<ReceivableRow[]> {
    return Promise.resolve([
      {
        customerCode: '1',
        customerName: 'محمد العباسي',
        creditBillCount: 2,
        creditTotal: 200,
        collectedTotal: 120,
        outstanding: 80,
        lastCreditAt: '2026-07-01T00:00:00.000Z',
        lastCollectionAt: '2026-07-02T00:00:00.000Z',
      },
    ]);
  }
  vouchersSummary(f: PosReportFilter): Promise<VoucherSummaryReport> {
    this.lastFilter = f;
    return Promise.resolve({
      rows: [
        {
          machineNo: 2,
          voucherType: 'RECEIPT',
          paymentMethod: 'CASH',
          currency: 'YER',
          voucherCount: 2,
          amount: 750,
          amountInShift: 750,
        },
        {
          machineNo: 2,
          voucherType: 'EXPENSE',
          paymentMethod: 'CASH',
          currency: 'YER',
          voucherCount: 1,
          amount: 120,
          amountInShift: 120,
        },
      ],
      totals: {
        receiptCount: 2,
        receiptsTotal: 750,
        expenseCount: 1,
        expensesTotal: 120,
        netCashEffect: 630,
      },
    });
  }
  loyaltyReport(
    f: PosReportFilter & { customerCode?: string },
  ): Promise<LoyaltyReport> {
    this.lastFilter = f;
    return Promise.resolve({
      from: f.from ?? null,
      to: f.to ?? null,
      byType: [
        { trnsType: 1, trnsTypeName: 'EARN', txnCount: 3, points: 617, pointAmt: 617, docAmt: 61700 },
        { trnsType: 2, trnsTypeName: 'REDEEM', txnCount: 2, points: -120, pointAmt: -120, docAmt: 0 },
      ],
      byCustomer: [
        { customerCode: '1', customerName: 'محمد العباسي', earned: 234, redeemed: 20, expired: 0, adjusted: 0, net: 214 },
      ],
      totals: { earned: 617, redeemed: 120, expired: 0, net: 497 },
    });
  }
  returnsWindow(f: PosReportFilter): Promise<ReturnsWindowReport> {
    this.lastFilter = f;
    return Promise.resolve({
      windowHours: null,
      rows: [
        {
          rtBillNo: 'R260700100000001',
          originalBillNo: '26201300078',
          customerName: null,
          cashierNo: 12,
          issuedAt: '2026-07-03T10:00:00.000Z',
          originalBillDay: '2026-07-01',
          originalBillTime: '09:30:00',
          netAmt: 100,
          refundAmt: 100,
          delayHours: 48.5,
          withinWindow: null,
        },
      ],
    });
  }
}

describe('ReportsService — MOTECH_POS reports', () => {
  it('byCashier passes the filter through and returns cashier rows', async () => {
    const pos = new FakePos();
    const svc = new ReportsService(legacy, pos);
    const rows = await svc.byCashier({ shiftId: 's1', from: '2026-07-01' });
    expect(pos.lastFilter).toEqual({ shiftId: 's1', from: '2026-07-01' });
    expect(rows[0].cashierNo).toBe(12);
    expect(rows[0].cashCollected).toBe(47960);
  });

  it('paymentMethods returns per-method-per-currency rows', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const rows = await svc.paymentMethods({});
    expect(rows).toHaveLength(2);
    expect(rows[0].method).toBe('CASH');
  });

  it('cashierPaymentSummary (POST012) returns per-cashier methods + refunds', async () => {
    const pos = new FakePos();
    const svc = new ReportsService(legacy, pos);
    const rows = await svc.cashierPaymentSummary({ cashierNo: 91 });
    expect(pos.lastFilter).toEqual({ cashierNo: 91 });
    expect(rows[0].cashierNo).toBe(91);
    expect(rows[0].methods[0].method).toBe('CASH');
    expect(rows[0].refundTotal).toBe(7800);
  });

  it('returnsReport returns per-day aggregation', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const rows = await svc.returnsReport({ from: '2026-07-01', to: '2026-07-01' });
    expect(rows[0].refundAmt).toBe(610);
    expect(rows[0].returnCount).toBe(5);
  });

  //==========================================================================
  // Wave F — POSR completions
  //==========================================================================

  it('byShift (POSR004) passes cashier filter and returns per-shift rows with over/short', async () => {
    const pos = new FakePos();
    const svc = new ReportsService(legacy, pos);
    const rows = await svc.byShift({ from: '2026-07-04', cashierNo: 12 });
    expect(pos.lastFilter).toEqual({ from: '2026-07-04', cashierNo: 12 });
    expect(rows[0].shiftNo).toBe(90);
    expect(rows[0].cashDifference).toBe(-50);
    expect(rows[0].cashCollected + rows[0].cardCollected).toBe(5000);
  });

  it('shiftsHistory (POSR014) exposes reconciliation + voucher figures per shift', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const rows = await svc.shiftsHistory({ status: 'SETTLED' });
    const s = rows[0];
    expect(s.status).toBe('SETTLED');
    // expected = opening + cashSales + receipts - expenses must be consistent
    // with the frozen expectedCash on the row.
    expect(s.expectedCash).toBe(5500);
    expect(s.countedCash).toBe(5450);
    expect(s.settleDifference).toBe(-50);
  });

  it('customerStatement (POSR002) computes outstanding = credit - collected', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const st = await svc.customerStatement({ customerCode: '1' });
    expect(st.customerName).toBe('محمد العباسي');
    expect(st.totals.outstanding).toBe(
      st.totals.creditTotal - st.totals.collectedTotal,
    );
  });

  it('vouchersSummary (POSR009/016) totals: net = receipts - expenses', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const rep = await svc.vouchersSummary({});
    expect(rep.totals.netCashEffect).toBe(
      rep.totals.receiptsTotal - rep.totals.expensesTotal,
    );
  });

  it('loyaltyReport (POSR010) totals: net = earned - redeemed - expired', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const rep = await svc.loyaltyReport({ from: '2026-07-01' });
    expect(rep.totals.net).toBe(
      rep.totals.earned - rep.totals.redeemed - rep.totals.expired,
    );
    expect(rep.byCustomer[0].net).toBe(214);
  });

  it('returnsWindow (POSR011) reports null withinWindow when PRD_BACK_HOUR is unset', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const rep = await svc.returnsWindow({});
    expect(rep.windowHours).toBeNull();
    expect(rep.rows[0].withinWindow).toBeNull();
    expect(rep.rows[0].delayHours).toBe(48.5);
  });
});
