import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@/shared/lib/types';

/**
 * Customer groups API (POSI009 مجموعات عملاء نقاط البيع) — proof-verified
 * against the live backend (:3000, 2026-07-04). MOTECH_POS authoritative
 * (V020); one group per customer (assign reassigns):
 *   GET  /customer-groups            → groups + member counts
 *   GET  /customer-groups/{no}       → detail + members (names resolved)
 *   POST /customer-groups            → create (supervisor/admin)
 *   PUT  /customer-groups/{no}       → edit
 *   POST /customer-groups/{no}/members     → assign a customer
 *   DELETE /customer-groups/members/{code} → unassign
 */

export interface CustomerGroup {
  id: string;
  grpCode: number;
  arName: string | null;
  enName: string | null;
  sendMsg: boolean;
  inactive: boolean;
  memberCount: number;
}

export interface GroupMember {
  id: string;
  grpCode: number;
  customerCode: string;
  customerName: string | null;
}

export interface CustomerGroupDetail extends CustomerGroup {
  members: GroupMember[];
}

export interface UpsertCustomerGroupDto {
  grpCode?: number;
  arName?: string;
  enName?: string;
  sendMsg?: boolean;
  inactive?: boolean;
}

export function useCustomerGroups() {
  return useQuery({
    queryKey: ['customer-groups'],
    queryFn: () => getData<CustomerGroup[]>('/customer-groups'),
    staleTime: 30_000,
  });
}

export function useCustomerGroup(grpCode: number | null) {
  return useQuery({
    queryKey: ['customer-groups', grpCode],
    enabled: grpCode != null,
    queryFn: () => getData<CustomerGroupDetail>(`/customer-groups/${grpCode}`),
    staleTime: 15_000,
  });
}

export function useCreateCustomerGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpsertCustomerGroupDto): Promise<CustomerGroup> => {
      const res = await api.post<ApiEnvelope<CustomerGroup>>('/customer-groups', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-groups'] }),
  });
}

export function useUpdateCustomerGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      grpCode: number;
      dto: UpsertCustomerGroupDto;
    }): Promise<CustomerGroup> => {
      const res = await api.put<ApiEnvelope<CustomerGroup>>(
        `/customer-groups/${vars.grpCode}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-groups'] }),
  });
}

export function useAssignGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { grpCode: number; customerCode: string }): Promise<GroupMember> => {
      const res = await api.post<ApiEnvelope<GroupMember>>(
        `/customer-groups/${vars.grpCode}/members`,
        { customerCode: vars.customerCode },
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-groups'] }),
  });
}

export function useUnassignGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customerCode: string) => {
      const res = await api.delete<ApiEnvelope<{ customerCode: string; removed: boolean }>>(
        `/customer-groups/members/${encodeURIComponent(customerCode)}`,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer-groups'] }),
  });
}
