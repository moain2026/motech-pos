import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Plus, Search, Eye } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatDateTime, formatNumber } from '@/shared/lib/format';
import { usePrescriptions } from '../api/prescriptions.api';
import { PrescriptionDialog } from './PrescriptionDialog';
import { PrescriptionDetailDialog } from './PrescriptionDetailDialog';

/**
 * POST023 الوصفة الطبية — list of prescriptions linked to sale bills, with
 * filters (billNo / patient), a create dialog, and a read-only detail view.
 */
export function PrescriptionsPage() {
  const { t } = useTranslation();
  const [billNo, setBillNo] = useState('');
  const [patient, setPatient] = useState('');
  const [applied, setApplied] = useState<{ billNo?: string; patient?: string }>({});
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const list = usePrescriptions(applied);
  const rows = list.data ?? [];

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <ClipboardList className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('rx.title')}
        </h1>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="size-4" />
          {t('rx.new')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-muted)]">{t('rx.billNo')}</span>
          <Input
            value={billNo}
            onChange={(e) => setBillNo(e.target.value)}
            placeholder={t('rx.billNoPlaceholder')}
            className="tnum h-9 w-48"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-muted)]">{t('rx.patient')}</span>
          <Input
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder={t('rx.patientPlaceholder')}
            className="h-9 w-56"
          />
        </label>
        <Button
          variant="outline"
          className="h-9"
          onClick={() => setApplied({ billNo: billNo || undefined, patient: patient || undefined })}
        >
          <Search className="size-4" />
          {t('rx.search')}
        </Button>
      </div>

      {list.isLoading ? (
        <LoadingView />
      ) : list.isError ? (
        <ErrorView error={list.error} onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyView label={t('rx.empty')} />
      ) : (
        <Card className="min-h-0 flex-1 overflow-auto scroll-thin">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('rx.billNo')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('rx.doctor')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('rx.patient')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('rx.patientRef')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('rx.rxDate')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('rx.lineCount')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('rx.createdAt')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('rx.view')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--color-surface-2)]">
                  <td className="tnum px-3 py-2 font-medium">{r.billNo}</td>
                  <td className="px-3 py-2">{r.doctorName}</td>
                  <td className="px-3 py-2 font-medium">{r.patientName}</td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">{r.patientRef ?? '—'}</td>
                  <td className="tnum px-3 py-2">{r.rxDate ?? '—'}</td>
                  <td className="tnum px-3 py-2 text-end">{formatNumber(r.lineCount)}</td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-end">
                    <Button
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setDetailId(r.id)}
                    >
                      <Eye className="size-4" />
                      {t('rx.view')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate ? <PrescriptionDialog onClose={() => setShowCreate(false)} /> : null}
      {detailId ? (
        <PrescriptionDetailDialog id={detailId} onClose={() => setDetailId(null)} />
      ) : null}
    </div>
  );
}
