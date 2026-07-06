import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@/shared/lib/types';

/**
 * Loyalty programs API (POSI008) — proof-verified against live backend (:3000):
 *   GET    /loyalty/programs
 *   GET    /loyalty/programs/{id}
 *   POST   /loyalty/programs         (supervisor/admin)
 *   PUT    /loyalty/programs/{id}    (supervisor/admin)
 *   DELETE /loyalty/programs/{id}    (supervisor/admin)
 * One ACTIVE program per point type is enforced by the DB (409 on conflict).
 */

export interface LoyaltyProgram {
  id: string;
  name: string;
  pointTypNo: number;
  calcType: 1 | 2;
  amt4Point: number;
  pointCnt: number;
  truncate: boolean;
  pointValue: number;
  minBillAmt: number;
  maxPointsPerBill: number;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertLoyaltyProgram {
  name: string;
  pointTypNo?: number;
  calcType: 1 | 2;
  amt4Point: number;
  pointCnt?: number;
  truncate?: boolean;
  pointValue?: number;
  minBillAmt?: number;
  maxPointsPerBill?: number;
  startDate?: string | null;
  endDate?: string | null;
  active?: boolean;
}

const KEY = ['loyalty-programs'];

export function useLoyaltyPrograms() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => getData<LoyaltyProgram[]>('/loyalty/programs'),
    staleTime: 30_000,
  });
}

export function useCreateLoyaltyProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertLoyaltyProgram): Promise<LoyaltyProgram> => {
      const res = await api.post<ApiEnvelope<LoyaltyProgram>>('/loyalty/programs', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLoyaltyProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      dto: UpsertLoyaltyProgram;
    }): Promise<LoyaltyProgram> => {
      const res = await api.put<ApiEnvelope<LoyaltyProgram>>(
        `/loyalty/programs/${encodeURIComponent(vars.id)}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLoyaltyProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/loyalty/programs/${encodeURIComponent(id)}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
