import { describe, expect, it } from 'vitest';
import { ReportsService } from '../../src/modules/reports/application/reports.service';
import { PosReportsRepository } from '../../src/modules/reports/domain/ports/pos-reports-repository.port';
import {
  CategoryReportRow,
  CustomerReportRow,
  DailyReportRow,
  DateRangeFilter,
  DiscountReportRow,
  HourlyReportRow,
  ItemReportRow,
  MachineReportRow,
  MonthlyReportRow,
  ReportsRepository,
  TaxReportRow,
  ZReportSummary,
} from '../../src/modules/reports/domain/ports/reports-repository.port';

const pos = {} as unknown as PosReportsRepository;

/** Fake YSPOS23 reports repo that records the last filter it received. */
class FakeReports implements ReportsRepository {
  lastFilter?: DateRangeFilter & { limit?: number; machineNo?: number };

  daily(f: DateRangeFilter): Promise<DailyReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([]);
  }
  monthly(f: DateRangeFilter): Promise<MonthlyReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([]);
  }
  byItem(f: DateRangeFilter & { limit: number }): Promise<ItemReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([]);
  }
  byMachine(f: DateRangeFilter): Promise<MachineReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([]);
  }
  taxReport(f: DateRangeFilter): Promise<TaxReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        day: '2026-06-25',
        billCount: 10,
        totalVat: 150,
        totalDisc: 20,
        totalAmt: 1150,
        netBeforeVat: 1000,
      },
    ]);
  }
  hourlySales(f: DateRangeFilter): Promise<HourlyReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      { hour: '13', billCount: 42, totalAmt: 5000, totalVat: 0, totalDisc: 0 },
    ]);
  }
  topCustomers(
    f: DateRangeFilter & { limit: number },
  ): Promise<CustomerReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        cCode: '2',
        cName: 'عميل',
        custCode: null,
        billCount: 7,
        totalAmt: 34010,
        totalVat: 0,
        totalDisc: 0,
      },
    ]);
  }
  discountReport(f: DateRangeFilter): Promise<DiscountReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      { day: '2026-06-25', billCount: 5, totalDisc: 50, totalAmt: 950, discPct: 5 },
    ]);
  }
  salesByCategory(f: DateRangeFilter): Promise<CategoryReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        categoryNo: 1,
        categoryName: 'الاصناف الغير موزونه',
        lineCount: 100,
        totalQty: 250,
        totalAmt: 40000,
      },
    ]);
  }
  zReport(
    f: DateRangeFilter & { machineNo?: number },
  ): Promise<ZReportSummary> {
    this.lastFilter = f;
    return Promise.resolve({
      from: f.from ?? null,
      to: f.to ?? null,
      machineNo: f.machineNo ?? null,
      billCount: 292,
      grossAmt: 110143.3,
      totalVat: 0,
      totalDisc: 0,
      netBeforeVat: 110143.3,
      returnAmt: 0,
      firstBillTime: '00:00:48',
      lastBillTime: '18:07:16',
      byPayment: [
        { method: 'CASH', billCount: 292, amount: 109203.3 },
        { method: 'CARD', billCount: 292, amount: 940 },
      ],
    });
  }
}

describe('ReportsService — extended YSPOS23 reports', () => {
  it('taxReport passes filter through and returns taxable base', async () => {
    const repo = new FakeReports();
    const svc = new ReportsService(repo, pos);
    const rows = await svc.taxReport({ from: '2026-06-01', to: '2026-06-30' });
    expect(repo.lastFilter).toEqual({ from: '2026-06-01', to: '2026-06-30' });
    expect(rows[0].netBeforeVat).toBe(1000);
    expect(rows[0].totalVat).toBe(150);
  });

  it('hourlySales returns per-hour buckets', async () => {
    const svc = new ReportsService(new FakeReports(), pos);
    const rows = await svc.hourlySales({});
    expect(rows[0].hour).toBe('13');
    expect(rows[0].billCount).toBe(42);
  });

  it('topCustomers forwards the limit', async () => {
    const repo = new FakeReports();
    const svc = new ReportsService(repo, pos);
    const rows = await svc.topCustomers({ limit: 5 });
    expect(repo.lastFilter).toEqual({ limit: 5 });
    expect(rows[0].cCode).toBe('2');
    expect(rows[0].totalAmt).toBe(34010);
  });

  it('discountReport returns discount percentage', async () => {
    const svc = new ReportsService(new FakeReports(), pos);
    const rows = await svc.discountReport({ from: '2026-06-25' });
    expect(rows[0].discPct).toBe(5);
    expect(rows[0].totalDisc).toBe(50);
  });

  it('salesByCategory returns Arabic category names', async () => {
    const svc = new ReportsService(new FakeReports(), pos);
    const rows = await svc.salesByCategory({});
    expect(rows[0].categoryNo).toBe(1);
    expect(rows[0].categoryName).toContain('الاصناف');
  });

  it('zReport returns a single close summary with payment split', async () => {
    const repo = new FakeReports();
    const svc = new ReportsService(repo, pos);
    const summary = await svc.zReport({
      from: '2026-06-25',
      to: '2026-06-25',
      machineNo: 3,
    });
    expect(repo.lastFilter).toEqual({
      from: '2026-06-25',
      to: '2026-06-25',
      machineNo: 3,
    });
    expect(summary.billCount).toBe(292);
    expect(summary.byPayment).toHaveLength(2);
    expect(summary.byPayment[1].method).toBe('CARD');
    expect(summary.netBeforeVat).toBe(110143.3);
  });
});
