import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/shared/lib/api-client';
import type { StockDocStatus, StockReceiptDetail, StockReceiptHeader } from '@/shared/lib/types';
import {
  useCancelStockReceipt,
  useCreateStockReceipt,
  usePostStockReceipt,
  useStockReceipt,
  useStockReceipts,
} from '../api/stock-docs.api';
import { confirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  StockDocCreateDialog,
  StockDocDetailDialog,
  StockDocListPage,
  type CreateDocInput,
  type DocDetailVM,
  type DocHeaderVM,
} from './StockDocShared';

const toVM = (r: StockReceiptHeader): DocHeaderVM => ({
  id: r.id,
  docNo: r.receiptNo,
  warehouseCode: r.warehouseCode,
  otherWarehouseCode: r.sourceWarehouseCode,
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

const toDetailVM = (r: StockReceiptDetail): DocDetailVM => ({ ...toVM(r), lines: r.lines });

/**
 * POST029 الاستلام المخزني — incoming goods receipts: DRAFT entry, then a
 * supervisor/admin approval (post) that REALLY increases warehouse stock.
 */
export function StockReceiptsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StockDocStatus | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const list = useStockReceipts({ status: status === 'all' ? undefined : status });
  const detail = useStockReceipt(detailId);
  const create = useCreateStockReceipt();
  const post = usePostStockReceipt();
  const cancel = useCancelStockReceipt();

  const doCreate = async (input: CreateDocInput) => {
    const res = await create.mutateAsync({
      warehouseCode: input.warehouseCode,
      sourceWarehouseCode: input.otherWarehouseCode,
      refNo: input.refNo,
      note: input.note,
      lines: input.lines,
    });
    return { docNo: res.receiptNo };
  };

  const doCancel = async (row: DocHeaderVM) => {
    setActionError(null);
    if (!(await confirmDialog({ message: t('stockDocs.receipts.cancelConfirm', { no: row.docNo }), variant: 'danger' }))) return;
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
        kind="receipts"
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
          kind="receipts"
          onClose={() => setShowCreate(false)}
          onSubmit={doCreate}
          pending={create.isPending}
        />
      ) : null}
      {detailId ? (
        <StockDocDetailDialog
          kind="receipts"
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
