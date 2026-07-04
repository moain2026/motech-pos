import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/shared/lib/api-client';
import type { StockDocStatus, StockIssueDetail, StockIssueHeader } from '@/shared/lib/types';
import {
  useCancelStockIssue,
  useCreateStockIssue,
  usePostStockIssue,
  useStockIssue,
  useStockIssues,
} from '../api/stock-docs.api';
import {
  StockDocCreateDialog,
  StockDocDetailDialog,
  StockDocListPage,
  type CreateDocInput,
  type DocDetailVM,
  type DocHeaderVM,
} from './StockDocShared';

const toVM = (r: StockIssueHeader): DocHeaderVM => ({
  id: r.id,
  docNo: r.issueNo,
  warehouseCode: r.warehouseCode,
  otherWarehouseCode: r.destWarehouseCode,
  status: r.status,
  refNo: r.refNo,
  note: r.note,
  createdBy: r.createdBy,
  createdAt: r.createdAt,
  postedBy: r.postedBy,
  postedAt: r.postedAt,
  cancelledBy: r.cancelledBy,
  cancelledAt: r.cancelledAt,
  lineCount: r.lineCount,
});

const toDetailVM = (r: StockIssueDetail): DocDetailVM => ({ ...toVM(r), lines: r.lines });

/**
 * POST028 التحويل المخزني الصادر — outbound dispatches: DRAFT entry, then a
 * supervisor/admin approval (post) that REALLY decreases source-warehouse
 * stock behind the server-side availability guard (422 when insufficient).
 */
export function StockIssuesPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StockDocStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const list = useStockIssues({ status: status === 'all' ? undefined : status });
  const detail = useStockIssue(detailId);
  const create = useCreateStockIssue();
  const post = usePostStockIssue();
  const cancel = useCancelStockIssue();

  const doCreate = async (input: CreateDocInput) => {
    const res = await create.mutateAsync({
      warehouseCode: input.warehouseCode,
      destWarehouseCode: input.otherWarehouseCode,
      refNo: input.refNo,
      note: input.note,
      lines: input.lines,
    });
    return { docNo: res.issueNo };
  };

  const doCancel = async (row: DocHeaderVM) => {
    setActionError(null);
    if (!window.confirm(t('stockDocs.issues.cancelConfirm', { no: row.docNo }))) return;
    try {
      await cancel.mutateAsync(row.id);
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.problem.detail || e.problem.title : t('stockDocs.cancelError'),
      );
    }
  };

  return (
    <>
      <StockDocListPage
        kind="issues"
        rows={list.data?.map(toVM)}
        isLoading={list.isLoading}
        isError={list.isError}
        error={list.error}
        refetch={() => list.refetch()}
        status={status}
        setStatus={setStatus}
        onView={setDetailId}
        onNew={() => setShowCreate(true)}
        onCancel={doCancel}
        cancelPending={cancel.isPending}
        actionError={actionError}
      />
      {showCreate ? (
        <StockDocCreateDialog
          kind="issues"
          onClose={() => setShowCreate(false)}
          onSubmit={doCreate}
          pending={create.isPending}
        />
      ) : null}
      {detailId ? (
        <StockDocDetailDialog
          kind="issues"
          detail={detail.data ? toDetailVM(detail.data) : undefined}
          isLoading={detail.isLoading}
          isError={detail.isError}
          error={detail.error}
          refetch={() => detail.refetch()}
          onClose={() => setDetailId(null)}
          onPost={async () => {
            await post.mutateAsync(detailId);
          }}
          postPending={post.isPending}
        />
      ) : null}
    </>
  );
}
