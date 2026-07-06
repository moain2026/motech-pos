import { describe, expect, it } from 'vitest';
import { ReportsService } from '../../src/modules/reports/application/reports.service';
import { PosReportsRepository } from '../../src/modules/reports/domain/ports/pos-reports-repository.port';
import {
  AuditReportRow,
  CategoryReportRow,
  ComparisonReport,
  CustomerReportRow,
  DailyReportRow,
  DateRangeFilter,
  DiscountReportRow,
  HourlyReportRow,
  ItemMovementReport,
  ItemReportRow,
  MachineReportRow,
  MonthlyReportRow,
  ProfitReportRow,
  ReportsRepository,
  SlowMovingRow,
  TaxReportRow,
  VatDetailedRow,
  ZReportSummary,
} from '../../src/modules/reports/domain/ports/reports-repository.port';

const pos = {} as unknown as PosReportsRepository;

/** Fake YSPOS23 reports repo that records the last filter it received. */
class FakeReports implements ReportsRepository {
  lastFilter?: DateRangeFilter & {
    limit?: number;
    machineNo?: number;
    maxQty?: number;
    iCode?: string;
  };
  lastPeriods?: { fromA: string; toA: string; fromB: string; toB: string };

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
  slowMoving(
    f: DateRangeFilter & { limit: number; maxQty: number },
  ): Promise<SlowMovingRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        iCode: '1150010004',
        iName: 'بهارات الرجوي زربيان (100 جم) 24ح',
        totalQty: 0,
        totalAmt: 0,
        lineCount: 0,
        lastSoldDay: null,
      },
      {
        iCode: '1040020098',
        iName: 'بسكوت دريم واي',
        totalQty: 2,
        totalAmt: 500,
        lineCount: 2,
        lastSoldDay: '2026-05-12',
      },
    ]);
  }
  profitReport(
    f: DateRangeFilter & { limit: number },
  ): Promise<ProfitReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        iCode: '1010010004',
        iName: 'صنف رابح',
        totalQty: 10,
        revenue: 1000,
        cost: 600,
        profit: 400,
        marginPct: 40,
        costAvailable: true,
      },
    ]);
  }
  comparison(p: {
    fromA: string;
    toA: string;
    fromB: string;
    toB: string;
  }): Promise<ComparisonReport> {
    this.lastPeriods = p;
    return Promise.resolve({
      periodA: {
        from: p.fromA,
        to: p.toA,
        billCount: 120,
        totalAmt: 60000,
        totalVat: 0,
        totalDisc: 100,
        avgBill: 500,
      },
      periodB: {
        from: p.fromB,
        to: p.toB,
        billCount: 100,
        totalAmt: 50000,
        totalVat: 0,
        totalDisc: 80,
        avgBill: 500,
      },
      deltaAmt: 10000,
      deltaAmtPct: 20,
      deltaBills: 20,
      deltaBillsPct: 20,
    });
  }
  itemMovement(
    f: DateRangeFilter & { iCode: string; limit: number },
  ): Promise<ItemMovementReport> {
    this.lastFilter = f;
    return Promise.resolve({
      iCode: f.iCode,
      iName: 'شاي العروس 400 جم',
      totalSoldQty: 12,
      totalReturnedQty: 2,
      netQty: 10,
      netAmt: 4400,
      movements: [
        {
          moveType: 'SALE',
          billNo: 26401100010,
          day: '2026-07-01',
          time: '10:15:00',
          qty: 3,
          price: 440,
          amount: 1320,
          machineNo: 1,
        },
        {
          moveType: 'RETURN',
          billNo: 26401100011,
          day: '2026-07-02',
          time: '11:00:00',
          qty: -2,
          price: 440,
          amount: -880,
          machineNo: 1,
        },
      ],
    });
  }
  auditReport(
    f: DateRangeFilter & { limit: number },
  ): Promise<AuditReportRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        billNo: 26401100001,
        billDay: '2026-05-01',
        billTime: '21:38:00',
        iCode: '1010030003',
        iName: 'صنف محذوف',
        qty: 1,
        price: 286,
        amount: 286,
        machineNo: 1,
        fromHungBill: false,
        auditUserId: 3,
        auditUserName: 'كاشير ١',
        auditedAt: '2026-05-01 21:38:12',
      },
    ]);
  }
  vatDetailed(f: DateRangeFilter): Promise<VatDetailedRow[]> {
    this.lastFilter = f;
    return Promise.resolve([
      {
        vatRate: 15,
        categoryNo: 1,
        categoryName: 'الاصناف الغير موزونه',
        lineCount: 14,
        totalQty: 20,
        grossAmt: 3000,
        vatAmt: 391.3,
      },
      {
        vatRate: 0,
        categoryNo: 1,
        categoryName: 'الاصناف الغير موزونه',
        lineCount: 41000,
        totalQty: 90000,
        grossAmt: 900000,
        vatAmt: 0,
      },
    ]);
  }

  salesOrders(): Promise<never[]> {
    return Promise.resolve([]);
  }

  customerGroups(): Promise<never[]> {
    return Promise.resolve([]);
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

describe('ReportsService — historical / advanced reports', () => {
  it('slowMoving forwards limit + maxQty and surfaces never-sold items', async () => {
    const repo = new FakeReports();
    const svc = new ReportsService(repo, pos);
    const rows = await svc.slowMoving({
      from: '2026-05-10',
      to: '2026-07-03',
      limit: 50,
      maxQty: 5,
    });
    expect(repo.lastFilter).toEqual({
      from: '2026-05-10',
      to: '2026-07-03',
      limit: 50,
      maxQty: 5,
    });
    expect(rows[0].totalQty).toBe(0);
    expect(rows[0].lastSoldDay).toBeNull();
    expect(rows[1].lastSoldDay).toBe('2026-05-12');
  });

  it('profitReport returns revenue/cost/margin with cost availability flag', async () => {
    const svc = new ReportsService(new FakeReports(), pos);
    const rows = await svc.profitReport({ limit: 10 });
    expect(rows[0].profit).toBe(400);
    expect(rows[0].marginPct).toBe(40);
    expect(rows[0].costAvailable).toBe(true);
    expect(rows[0].revenue - rows[0].cost).toBe(rows[0].profit);
  });

  it('comparison forwards both periods and returns deltas', async () => {
    const repo = new FakeReports();
    const svc = new ReportsService(repo, pos);
    const cmp = await svc.comparison({
      fromA: '2026-06-01',
      toA: '2026-06-30',
      fromB: '2026-05-01',
      toB: '2026-05-31',
    });
    expect(repo.lastPeriods?.fromA).toBe('2026-06-01');
    expect(repo.lastPeriods?.toB).toBe('2026-05-31');
    expect(cmp.deltaAmt).toBe(10000);
    expect(cmp.deltaAmtPct).toBe(20);
    expect(cmp.periodA.billCount - cmp.periodB.billCount).toBe(cmp.deltaBills);
  });

  it('itemMovement returns sales + returns with net totals', async () => {
    const repo = new FakeReports();
    const svc = new ReportsService(repo, pos);
    const rep = await svc.itemMovement({ iCode: '1010010004', limit: 200 });
    expect(repo.lastFilter).toEqual({ iCode: '1010010004', limit: 200 });
    expect(rep.netQty).toBe(rep.totalSoldQty - rep.totalReturnedQty);
    expect(rep.movements[1].moveType).toBe('RETURN');
    expect(rep.movements[1].qty).toBeLessThan(0);
    expect(rep.movements[1].amount).toBe(
      rep.movements[1].qty * rep.movements[1].price,
    );
  });

  it('auditReport returns deleted-line trail with Arabic user name', async () => {
    const svc = new ReportsService(new FakeReports(), pos);
    const rows = await svc.auditReport({ from: '2026-05-01', limit: 100 });
    expect(rows[0].amount).toBe(rows[0].qty * rows[0].price);
    expect(rows[0].auditUserName).toBe('كاشير ١');
    expect(rows[0].fromHungBill).toBe(false);
  });

  it('vatDetailed groups by effective rate x category', async () => {
    const svc = new ReportsService(new FakeReports(), pos);
    const rows = await svc.vatDetailed({ from: '2026-05-10' });
    expect(rows[0].vatRate).toBe(15);
    expect(rows[0].vatAmt).toBeGreaterThan(0);
    expect(rows[1].vatRate).toBe(0);
    expect(rows[1].vatAmt).toBe(0);
    expect(rows[0].categoryName).toContain('الاصناف');
  });
});
