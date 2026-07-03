import { beforeEach, describe, expect, it } from 'vitest';
import { CreditCollectionsService } from '../../src/modules/customers/application/credit-collections.service';
import {
  CollectionRow,
  CreditBillRow,
  CreditCollectionsRepository,
  InsertCollectionInput,
} from '../../src/modules/customers/domain/ports/credit-collections.port';
import {
  CollectionExceedsDebtError,
  CreditBillNotFoundError,
  InvalidCollectionError,
} from '../../src/shared/errors/domain-error';

interface FakeBill {
  billId: string;
  billNo: string;
  customerCode: string;
  currency: string;
  netAmt: number;
  creditAmt: number;
}

class FakeRepo implements CreditCollectionsRepository {
  bills: FakeBill[] = [];
  collections: CollectionRow[] = [];

  private view(b: FakeBill): CreditBillRow {
    const collected = this.collections
      .filter((c) => c.billId === b.billId)
      .reduce((s, c) => s + c.amountInBill, 0);
    const outstanding = Math.max(0, b.creditAmt - collected);
    return {
      billId: b.billId,
      billNo: b.billNo,
      issuedAt: new Date().toISOString(),
      currency: b.currency,
      netAmt: b.netAmt,
      creditAmt: b.creditAmt,
      collectedAmt: collected,
      outstanding,
      status: outstanding > 0 ? 'OPEN' : 'SETTLED',
    };
  }

  creditBills(customerCode: string, openOnly: boolean): Promise<CreditBillRow[]> {
    const mine = this.bills
      .filter((b) => b.customerCode === customerCode)
      .map((b) => this.view(b));
    return Promise.resolve(openOnly ? mine.filter((b) => b.outstanding > 0) : mine);
  }

  creditBill(customerCode: string, billId: string): Promise<CreditBillRow | null> {
    const b = this.bills.find(
      (x) => x.customerCode === customerCode && x.billId === billId,
    );
    return Promise.resolve(b ? this.view(b) : null);
  }

  findByIdempotencyKey(key: string): Promise<CollectionRow | null> {
    return Promise.resolve(
      this.collections.find((c) => c.idempotencyKey === key) ?? null,
    );
  }

  insertCollection(input: InsertCollectionInput): Promise<CollectionRow> {
    const row: CollectionRow = {
      id: `cc${this.collections.length + 1}`,
      billId: input.billId,
      customerCode: input.customerCode,
      method: input.method,
      currency: input.currency,
      amount: input.amount,
      rate: input.rate,
      amountInBill: input.amountInBill,
      cashierNo: input.cashierNo,
      note: input.note,
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date().toISOString(),
    };
    this.collections.push(row);
    return Promise.resolve(row);
  }
}

describe('CreditCollectionsService (POST010/011 تحصيل الآجل)', () => {
  let repo: FakeRepo;
  let svc: CreditCollectionsService;

  beforeEach(() => {
    repo = new FakeRepo();
    svc = new CreditCollectionsService(repo);
    repo.bills.push({
      billId: 'bill-1',
      billNo: '2607001X',
      customerCode: 'C001',
      currency: 'YER',
      netAmt: 100,
      creditAmt: 80,
    });
  });

  it('lists open credit bills with the debtor balance', async () => {
    const view = await svc.creditBills('C001', true);
    expect(view.bills).toHaveLength(1);
    expect(view.bills[0].outstanding).toBe(80);
    expect(view.bills[0].status).toBe('OPEN');
    expect(view.totalOutstanding).toBe(80);
  });

  it('records a partial collection and updates the outstanding debt', async () => {
    const r = await svc.collect({
      customerCode: 'C001',
      billId: 'bill-1',
      amount: 30,
      idempotencyKey: 'k1',
    });
    expect(r.replayed).toBe(false);
    expect(r.collection.amountInBill).toBe(30);
    expect(r.bill.collectedAmt).toBe(30);
    expect(r.bill.outstanding).toBe(50);
    expect(r.bill.status).toBe('OPEN');
  });

  it('settles the bill when the full debt is collected (and hides it from open list)', async () => {
    await svc.collect({ customerCode: 'C001', billId: 'bill-1', amount: 80, idempotencyKey: 'k1' });
    const open = await svc.creditBills('C001', true);
    expect(open.bills).toHaveLength(0);
    const all = await svc.creditBills('C001', false);
    expect(all.bills[0].status).toBe('SETTLED');
    expect(all.totalOutstanding).toBe(0);
  });

  it('rejects a collection exceeding the outstanding debt (422)', async () => {
    await svc.collect({ customerCode: 'C001', billId: 'bill-1', amount: 70, idempotencyKey: 'k1' });
    await expect(
      svc.collect({ customerCode: 'C001', billId: 'bill-1', amount: 20, idempotencyKey: 'k2' }),
    ).rejects.toBeInstanceOf(CollectionExceedsDebtError);
  });

  it('applies the exchange rate (amountInBill = amount * rate) for the guard', async () => {
    // 1 USD = 40 YER → 3 USD = 120 in bill currency > 80 debt.
    await expect(
      svc.collect({
        customerCode: 'C001',
        billId: 'bill-1',
        amount: 3,
        currency: 'USD',
        rate: 40,
        idempotencyKey: 'k1',
      }),
    ).rejects.toBeInstanceOf(CollectionExceedsDebtError);
    // 2 USD = 80 → exactly settles.
    const r = await svc.collect({
      customerCode: 'C001',
      billId: 'bill-1',
      amount: 2,
      currency: 'USD',
      rate: 40,
      idempotencyKey: 'k2',
    });
    expect(r.bill.status).toBe('SETTLED');
  });

  it('is idempotent: same key replays the original receipt (no double-collect)', async () => {
    const a = await svc.collect({ customerCode: 'C001', billId: 'bill-1', amount: 30, idempotencyKey: 'k1' });
    const b = await svc.collect({ customerCode: 'C001', billId: 'bill-1', amount: 30, idempotencyKey: 'k1' });
    expect(b.replayed).toBe(true);
    expect(b.collection.id).toBe(a.collection.id);
    expect(repo.collections).toHaveLength(1);
    expect(b.bill.outstanding).toBe(50);
  });

  it('404 for a bill without credit debt for this customer', async () => {
    await expect(
      svc.collect({ customerCode: 'C001', billId: 'nope', amount: 10, idempotencyKey: 'k1' }),
    ).rejects.toBeInstanceOf(CreditBillNotFoundError);
    await expect(
      svc.collect({ customerCode: 'OTHER', billId: 'bill-1', amount: 10, idempotencyKey: 'k2' }),
    ).rejects.toBeInstanceOf(CreditBillNotFoundError);
  });

  it('422 for non-positive amount or rate', async () => {
    await expect(
      svc.collect({ customerCode: 'C001', billId: 'bill-1', amount: 0, idempotencyKey: 'k1' }),
    ).rejects.toBeInstanceOf(InvalidCollectionError);
    await expect(
      svc.collect({ customerCode: 'C001', billId: 'bill-1', amount: 10, rate: -1, idempotencyKey: 'k2' }),
    ).rejects.toBeInstanceOf(InvalidCollectionError);
  });
});
