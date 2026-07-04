import { describe, expect, it } from 'vitest';
import { PrescriptionService } from '../../src/modules/prescriptions/application/prescription.service';
import {
  BillItem,
  CreatePrescriptionInput,
  ListPrescriptionsFilter,
  PrescriptionDetail,
  PrescriptionHeader,
  PrescriptionRepository,
} from '../../src/modules/prescriptions/domain/ports/prescription.port';
import {
  PrescriptionBillNotFoundError,
  PrescriptionItemNotOnBillError,
  PrescriptionNotFoundError,
} from '../../src/shared/errors/domain-error';

class FakeRepo implements PrescriptionRepository {
  bills = new Map<string, BillItem[]>();
  store = new Map<string, PrescriptionDetail>();
  private seq = 0;

  create(input: CreatePrescriptionInput): Promise<PrescriptionDetail> {
    const id = `rx-${++this.seq}`;
    const rx: PrescriptionDetail = {
      id,
      billNo: input.billNo,
      doctorName: input.doctorName,
      patientName: input.patientName,
      patientRef: input.patientRef,
      rxDate: input.rxDate ?? '2026-07-04',
      note: input.note,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      lineCount: input.lines.length,
      lines: input.lines.map((l, i) => ({
        lineId: `${id}-l${i}`,
        itemCode: l.itemCode,
        itemName: l.itemName,
        qty: l.qty,
        dosage: l.dosage,
        usageNotes: l.usageNotes,
        duration: l.duration,
      })),
    };
    this.store.set(id, rx);
    return Promise.resolve(rx);
  }

  findById(id: string): Promise<PrescriptionDetail | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  list(filter: ListPrescriptionsFilter): Promise<PrescriptionHeader[]> {
    const all = [...this.store.values()].filter(
      (r) =>
        (!filter.billNo || r.billNo === filter.billNo) &&
        (!filter.patient ||
          r.patientName.toLowerCase().includes(filter.patient.toLowerCase())),
    );
    return Promise.resolve(all.slice(0, filter.limit));
  }

  billItems(billNo: string): Promise<BillItem[] | null> {
    return Promise.resolve(this.bills.get(billNo) ?? null);
  }
}

function makeSvc() {
  const repo = new FakeRepo();
  repo.bills.set('26201300078', [
    { itemCode: 'MED-1', qty: 2, itemName: 'باراسيتامول 500' },
    { itemCode: 'MED-2', qty: 1, itemName: 'أموكسيسيلين 250' },
  ]);
  return { repo, svc: new PrescriptionService(repo) };
}

describe('PrescriptionService (POST023)', () => {
  it('creates a prescription with qty/name snapshotted from the bill', async () => {
    const { svc } = makeSvc();
    const rx = await svc.create({
      billNo: '26201300078',
      doctorName: 'د. أحمد',
      patientName: 'محمد العباسي',
      createdBy: 'cashier1',
      lines: [
        { itemCode: 'MED-1', dosage: 'قرص كل 8 ساعات', duration: '7 أيام' },
      ],
    });
    expect(rx.billNo).toBe('26201300078');
    expect(rx.lines).toHaveLength(1);
    // qty + Arabic name come from the BILL, not the client.
    expect(rx.lines[0].qty).toBe(2);
    expect(rx.lines[0].itemName).toBe('باراسيتامول 500');
    expect(rx.lines[0].dosage).toBe('قرص كل 8 ساعات');
  });

  it('404s when the bill does not exist in YSPOS23', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        billNo: 'NO-SUCH-BILL',
        doctorName: 'د. أحمد',
        patientName: 'م',
        createdBy: 'c',
        lines: [{ itemCode: 'MED-1' }],
      }),
    ).rejects.toBeInstanceOf(PrescriptionBillNotFoundError);
  });

  it('422s when an annotated item is not on the bill', async () => {
    const { svc } = makeSvc();
    await expect(
      svc.create({
        billNo: '26201300078',
        doctorName: 'د. أحمد',
        patientName: 'م',
        createdBy: 'c',
        lines: [{ itemCode: 'MED-1' }, { itemCode: 'NOT-ON-BILL' }],
      }),
    ).rejects.toBeInstanceOf(PrescriptionItemNotOnBillError);
  });

  it('lists by billNo and patient substring', async () => {
    const { svc } = makeSvc();
    await svc.create({
      billNo: '26201300078',
      doctorName: 'د',
      patientName: 'محمد العباسي',
      createdBy: 'c',
      lines: [{ itemCode: 'MED-1' }],
    });
    const byBill = await svc.list({ billNo: '26201300078', limit: 10 });
    expect(byBill).toHaveLength(1);
    const byPatient = await svc.list({ patient: 'العباسي', limit: 10 });
    expect(byPatient).toHaveLength(1);
    const none = await svc.list({ patient: 'غير موجود', limit: 10 });
    expect(none).toHaveLength(0);
  });

  it('404s on unknown prescription id and bill items', async () => {
    const { svc } = makeSvc();
    await expect(svc.byId('nope')).rejects.toBeInstanceOf(
      PrescriptionNotFoundError,
    );
    await expect(svc.billItems('nope')).rejects.toBeInstanceOf(
      PrescriptionBillNotFoundError,
    );
  });
});
