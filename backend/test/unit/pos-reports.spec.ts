import { describe, expect, it } from 'vitest';
import { ReportsService } from '../../src/modules/reports/application/reports.service';
import {
  CashierReportRow,
  PaymentMethodReportRow,
  PosReportFilter,
  PosReportsRepository,
  ReturnsReportRow,
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

  it('returnsReport returns per-day aggregation', async () => {
    const svc = new ReportsService(legacy, new FakePos());
    const rows = await svc.returnsReport({ from: '2026-07-01', to: '2026-07-01' });
    expect(rows[0].refundAmt).toBe(610);
    expect(rows[0].returnCount).toBe(5);
  });
});
