import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * POS terminal settings (client state, persisted).
 *
 * The backend keys shifts and bills by POS `cashierNo` + `machineNo`, which are
 * distinct from the auth user id (the seed users carry no cashierNo). The
 * cashier picks/confirms these once per terminal; defaults match the demo data
 * that the backend accepts (cashierNo 12, machine 1).
 */
interface PosSettingsState {
  cashierNo: number;
  machineNo: number;
  shiftCode: string;
  setCashierNo: (n: number) => void;
  setMachineNo: (n: number) => void;
  setShiftCode: (c: string) => void;
}

export const usePosSettings = create<PosSettingsState>()(
  persist(
    (set) => ({
      cashierNo: 12,
      machineNo: 1,
      shiftCode: 'M',
      setCashierNo: (n) => set({ cashierNo: Math.max(0, Math.floor(n) || 0) }),
      setMachineNo: (n) => set({ machineNo: Math.max(0, Math.floor(n) || 0) }),
      setShiftCode: (c) => set({ shiftCode: c || 'M' }),
    }),
    { name: 'motech-pos-settings' },
  ),
);
