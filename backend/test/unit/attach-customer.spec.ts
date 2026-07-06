import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { AttachCustomerUseCase } from '../../src/modules/bills/application/attach-customer.usecase';
import {
  AddPaymentInput,
  BillWriteRepository,
  InsertBillInput,
  PersistedBill,
} from '../../src/modules/bills/domain/ports/bill-write-repository.port';

function makeBill(over: Partial<PersistedBill> = {}): PersistedBill {
  return {
    id: 'bill-1',
    billNo: '260700100000369',
    shiftId: 's1',
    cashierNo: 3,
    machineNo: 3,
    billType: 1,
    customerCode: null,
    customerName: null,
    currency: 'YER',
    taxCalcType: 2,
    grossAmt: 600,
    discountAmt: 0,
    vatAmt: 0,
    netAmt: 600,
    paidAmt: 600,
    status: 'POSTED',
    idempotencyKey: 'k1',
    clientOpId: null,
    issuedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lines: [],
    payments: [],
    ...over,
  };
}

class FakeBills implements BillWriteRepository {
  constructor(private bill: PersistedBill | null) {}
  findByIdempotencyKey(): Promise<PersistedBill | null> {
    return Promise.resolve(null);
  }
  findById(id: string): Promise<PersistedBill | null> {
    return Promise.resolve(this.bill && this.bill.id === id ? this.bill : null);
  }
  findByBillNo(billNo: string): Promise<PersistedBill | null> {
    return Promise.resolve(
      this.bill && this.bill.billNo === billNo ? this.bill : null,
    );
  }
  insertBill(_i: InsertBillInput): Promise<PersistedBill> {
    return Promise.resolve(this.bill as PersistedBill);
  }
  addPayment(_i: AddPaymentInput): Promise<PersistedBill> {
    return Promise.resolve(this.bill as PersistedBill);
  }
  attachCustomer(
    billId: string,
    customerCode: string,
    customerName: string | null,
  ): Promise<PersistedBill> {
    if (this.bill && this.bill.id === billId) {
      this.bill.customerCode = customerCode;
      this.bill.customerName = customerName;
    }
    return Promise.resolve(this.bill as PersistedBill);
  }
}

// Minimal stand-ins for the injected collaborators.
function fakeCustomers(known: Record<string, string>) {
  return {
    findByCode(code: string) {
      if (!(code in known)) {
        return Promise.reject(new NotFoundException(`Customer '${code}' not found`));
      }
      return Promise.resolve({ code, arName: known[code], enName: null });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function fakeLoyalty() {
  const earned: Array<{ billId: string | null }> = [];
  return {
    earnOnSale(input: { billId: string | null; billAmount: number }) {
      // Idempotent per bill: earning twice returns the same row.
      const existing = earned.find((e) => e.billId === input.billId);
      if (existing) {
        return Promise.resolve({
          trnsType: 1,
          pointCnt: Math.trunc(input.billAmount / 100),
          billId: input.billId,
        });
      }
      earned.push({ billId: input.billId });
      return Promise.resolve({
        trnsType: 1,
        pointCnt: Math.trunc(input.billAmount / 100),
        billId: input.billId,
      });
    },
    _earned: earned,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('AttachCustomerUseCase (POST020 retroactive attach)', () => {
  it('attaches a customer to a bill with none and earns points', async () => {
    const bill = makeBill();
    const uc = new AttachCustomerUseCase(
      new FakeBills(bill),
      fakeCustomers({ '1': 'محمد العباسي' }),
      fakeLoyalty(),
    );
    const res = await uc.execute({ billId: 'bill-1', customerCode: '1' });
    expect(res.alreadyAttached).toBe(false);
    expect(res.bill.customerCode).toBe('1');
    expect(res.bill.customerName).toBe('محمد العباسي');
    expect(res.pointsEarned).toBe(6); // 600 / 100
  });

  it('is a no-op when the same customer is already attached (idempotent)', async () => {
    const bill = makeBill({ customerCode: '1', customerName: 'محمد العباسي' });
    const uc = new AttachCustomerUseCase(
      new FakeBills(bill),
      fakeCustomers({ '1': 'محمد العباسي' }),
      fakeLoyalty(),
    );
    const res = await uc.execute({ billId: 'bill-1', customerCode: '1' });
    expect(res.alreadyAttached).toBe(true);
    expect(res.pointsEarned).toBe(0);
  });

  it('rejects attaching a DIFFERENT customer to a bill that already has one (409)', async () => {
    const bill = makeBill({ customerCode: '2', customerName: 'أنس' });
    const uc = new AttachCustomerUseCase(
      new FakeBills(bill),
      fakeCustomers({ '1': 'محمد', '2': 'أنس' }),
      fakeLoyalty(),
    );
    await expect(
      uc.execute({ billId: 'bill-1', customerCode: '1' }),
    ).rejects.toThrow(/already has/i);
  });

  it('404 when the bill does not exist', async () => {
    const uc = new AttachCustomerUseCase(
      new FakeBills(null),
      fakeCustomers({ '1': 'محمد' }),
      fakeLoyalty(),
    );
    await expect(
      uc.execute({ billId: 'ghost', customerCode: '1' }),
    ).rejects.toThrow(/not found/i);
  });

  it('404 when the target customer does not exist', async () => {
    const bill = makeBill();
    const uc = new AttachCustomerUseCase(
      new FakeBills(bill),
      fakeCustomers({}),
      fakeLoyalty(),
    );
    await expect(
      uc.execute({ billId: 'bill-1', customerCode: '999' }),
    ).rejects.toThrow(/customer 999 not found/i);
  });
});
