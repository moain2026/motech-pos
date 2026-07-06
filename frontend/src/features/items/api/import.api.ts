import { useMutation, useQuery } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@/shared/lib/types';

/**
 * POS_IMPXLS import API. Proof-verified against live backend (:3000):
 *   POST /items/import/{kind}?dryRun=true|false  (multipart file)  supervisor/admin
 *   GET  /items/import/batches
 */

export type ImportKind = 'items' | 'prices' | 'balances';

export interface ImportRowError {
  row: number;
  code: string;
  message: string;
}

export interface ImportResult {
  kind: string;
  fileName: string;
  headers: string[];
  totalRows: number;
  okRows: number;
  errorRows: number;
  sample: Record<string, unknown>[];
  errors: ImportRowError[];
  committed: boolean;
  batch: { id: string } | null;
}

export interface ImportBatch {
  id: string;
  kind: string;
  fileName: string | null;
  totalRows: number;
  okRows: number;
  errorRows: number;
  status: string;
  errors: ImportRowError[];
  createdBy: number | null;
  createdAt: string;
}

export function useRunImport() {
  return useMutation({
    mutationFn: async (vars: {
      kind: ImportKind;
      file: File;
      commit: boolean;
    }): Promise<ImportResult> => {
      const fd = new FormData();
      fd.append('file', vars.file);
      const res = await api.post<ApiEnvelope<ImportResult>>(
        `/items/import/${vars.kind}?dryRun=${vars.commit ? 'false' : 'true'}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return res.data.data;
    },
  });
}

export function useImportBatches(enabled: boolean) {
  return useQuery({
    queryKey: ['import-batches'],
    queryFn: () => getData<ImportBatch[]>('/items/import/batches?limit=20'),
    enabled,
    staleTime: 10_000,
  });
}
