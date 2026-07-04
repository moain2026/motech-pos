import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderTree, Ruler, Plus, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { OriginBadge } from '@/shared/ui/OriginBadge';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import { formatNumber } from '@/shared/lib/format';
import {
  useItemGroups,
  useCreateItemGroup,
  useUpdateItemGroup,
  useUnits,
  useCreateUnit,
  useUpdateUnit,
  type ItemGroup,
  type Unit,
} from '../api/master-data.api';
import { Field, CheckField, MdDialog, errorText } from './MdShared';

type Tab = 'groups' | 'units';

/**
 * المجموعات والوحدات (POSI004 item groups + POSI005 units) — one screen,
 * two tabs. GET/POST/PUT /item-groups · /units. ERP GROUP_DETAILS/MEASUREMENT
 * merged with MOTECH_POS overlays (origin badges). supervisor/admin.
 */
export function GroupsUnitsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('groups');

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <FolderTree className="size-6 text-[var(--color-brand-500)]" aria-hidden />
        {t('groupsUnits.title')}
      </h1>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t('groupsUnits.title')}>
        {(
          [
            { key: 'groups' as Tab, icon: FolderTree },
            { key: 'units' as Tab, icon: Ruler },
          ]
        ).map(({ key, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={
              'flex items-center gap-2 rounded-[var(--radius)] border px-4 py-2 text-sm font-medium transition-colors ' +
              (tab === key
                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-600)] text-white'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]')
            }
          >
            <Icon className="size-4" aria-hidden />
            {t(`groupsUnits.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'groups' ? <GroupsTab /> : <UnitsTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item groups
// ---------------------------------------------------------------------------

function GroupsTab() {
  const { t } = useTranslation();
  const query = useItemGroups();
  const [dialog, setDialog] = useState<{ group: ItemGroup | null } | null>(null);
  const rows = query.data ?? [];

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm text-[var(--color-muted)]">
          {t('groupsUnits.groupsCount', { count: rows.length })}
        </span>
        <Button variant="primary" onClick={() => setDialog({ group: null })}>
          <Plus className="size-4" />
          {t('groupsUnits.newGroup')}
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto scroll-thin">
        {query.isLoading ? (
          <LoadingView />
        ) : query.isError ? (
          <ErrorView error={query.error} onRetry={() => query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyView />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('groupsUnits.groupName')}</th>
                <th className="px-3 py-2 text-start font-semibold">{t('md.code')}</th>
                <th className="hidden px-3 py-2 text-end font-semibold sm:table-cell">
                  {t('groupsUnits.taxPercent')}
                </th>
                <th className="hidden px-3 py-2 text-center font-semibold md:table-cell">
                  {t('groupsUnits.allowDiscount')}
                </th>
                <th className="hidden px-3 py-2 text-end font-semibold md:table-cell">
                  {t('groupsUnits.itemCount')}
                </th>
                <th className="px-3 py-2 text-center font-semibold">{t('md.origin')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('md.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((g) => (
                <tr
                  key={g.code}
                  className={`hover:bg-[var(--color-surface-2)] ${g.inactive ? 'opacity-50' : ''}`}
                >
                  <td className="px-3 py-2 font-medium">
                    {g.arName?.trim() || g.enName?.trim() || '—'}
                  </td>
                  <td className="tnum px-3 py-2 text-[var(--color-muted)]">{g.code}</td>
                  <td className="tnum hidden px-3 py-2 text-end sm:table-cell">
                    {g.taxPercent != null ? `${formatNumber(g.taxPercent)}%` : '—'}
                  </td>
                  <td className="hidden px-3 py-2 text-center md:table-cell">
                    {g.allowDiscount == null ? (
                      '—'
                    ) : g.allowDiscount ? (
                      <CheckCircle2 className="mx-auto size-4 text-[var(--color-success)]" aria-hidden />
                    ) : (
                      <XCircle className="mx-auto size-4 text-[var(--color-muted)]" aria-hidden />
                    )}
                  </td>
                  <td className="tnum hidden px-3 py-2 text-end md:table-cell">{g.itemCount}</td>
                  <td className="px-3 py-2 text-center">
                    <OriginBadge origin={g.origin} />
                  </td>
                  <td className="px-3 py-2 text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('md.edit')}
                      title={t('md.edit')}
                      onClick={() => setDialog({ group: g })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {dialog ? <GroupDialog group={dialog.group} onClose={() => setDialog(null)} /> : null}
    </Card>
  );
}

function GroupDialog({ group, onClose }: { group: ItemGroup | null; onClose: () => void }) {
  const { t } = useTranslation();
  const isEdit = !!group;
  const create = useCreateItemGroup();
  const update = useUpdateItemGroup();
  const pending = create.isPending || update.isPending;

  const [code, setCode] = useState(group?.code ?? '');
  const [arName, setArName] = useState(group?.arName ?? '');
  const [enName, setEnName] = useState(group?.enName ?? '');
  const [taxPercent, setTaxPercent] = useState(
    group?.taxPercent != null ? String(group.taxPercent) : '',
  );
  const [sortOrder, setSortOrder] = useState(
    group?.sortOrder != null ? String(group.sortOrder) : '',
  );
  const [allowDiscount, setAllowDiscount] = useState(group?.allowDiscount ?? true);
  const [inactive, setInactive] = useState(group?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const canSubmit = arName.trim().length > 0;

  const submit = async () => {
    setError(null);
    const dto = {
      arName: arName.trim(),
      enName: enName.trim() || undefined,
      taxPercent: taxPercent.trim() ? Number(taxPercent) : undefined,
      sortOrder: sortOrder.trim() ? Number(sortOrder) : undefined,
      allowDiscount,
      inactive,
    };
    try {
      if (isEdit && group) {
        const saved = await update.mutateAsync({ code: group.code, dto });
        setDone(`${t('groupsUnits.groupUpdated')} ${saved.code}`);
      } else {
        const saved = await create.mutateAsync({ ...dto, code: code.trim() || undefined });
        setDone(`${t('groupsUnits.groupCreated')} ${saved.code}`);
      }
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={isEdit ? t('groupsUnits.editGroup') : t('groupsUnits.newGroup')}
      icon={<FolderTree className="size-5 text-[var(--color-brand-500)]" aria-hidden />}
      origin={group?.origin}
      onClose={onClose}
      done={done}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('md.code')}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isEdit}
            className="tnum h-10"
            placeholder={t('md.codeAuto')}
          />
        </Field>
        <Field label={t('groupsUnits.sortOrder')}>
          <Input
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="tnum h-10 text-end"
          />
        </Field>
      </div>
      <Field label={t('md.arName')}>
        <Input autoFocus value={arName} onChange={(e) => setArName(e.target.value)} className="h-10" />
      </Field>
      <Field label={t('md.enName')}>
        <Input value={enName} onChange={(e) => setEnName(e.target.value)} className="h-10" dir="ltr" />
      </Field>
      <Field label={t('groupsUnits.taxPercent')}>
        <Input
          type="number"
          min={0}
          max={100}
          step="0.5"
          value={taxPercent}
          onChange={(e) => setTaxPercent(e.target.value)}
          className="tnum h-10 text-end"
          placeholder="0"
        />
      </Field>
      <CheckField
        label={t('groupsUnits.allowDiscount')}
        checked={allowDiscount}
        onChange={setAllowDiscount}
      />
      <CheckField label={t('md.inactive')} checked={inactive} onChange={setInactive} />
    </MdDialog>
  );
}

// ---------------------------------------------------------------------------
// Units of measure
// ---------------------------------------------------------------------------

function UnitsTab() {
  const { t } = useTranslation();
  const query = useUnits();
  const [dialog, setDialog] = useState<{ unit: Unit | null } | null>(null);
  const rows = query.data ?? [];

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm text-[var(--color-muted)]">
          {t('groupsUnits.unitsCount', { count: rows.length })}
        </span>
        <Button variant="primary" onClick={() => setDialog({ unit: null })}>
          <Plus className="size-4" />
          {t('groupsUnits.newUnit')}
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto scroll-thin">
        {query.isLoading ? (
          <LoadingView />
        ) : query.isError ? (
          <ErrorView error={query.error} onRetry={() => query.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyView />
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              <tr>
                <th className="px-3 py-2 text-start font-semibold">{t('groupsUnits.unitName')}</th>
                <th className="hidden px-3 py-2 text-start font-semibold sm:table-cell">
                  {t('md.enName')}
                </th>
                <th className="hidden px-3 py-2 text-end font-semibold md:table-cell">
                  {t('groupsUnits.defaultSize')}
                </th>
                <th className="px-3 py-2 text-center font-semibold">{t('md.origin')}</th>
                <th className="px-3 py-2 text-end font-semibold">{t('md.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((u) => (
                <tr
                  key={u.code}
                  className={`hover:bg-[var(--color-surface-2)] ${u.inactive ? 'opacity-50' : ''}`}
                >
                  <td className="px-3 py-2 font-medium">
                    {u.arName?.trim() || u.code}
                    {u.inactive ? (
                      <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                        {t('md.inactive')}
                      </span>
                    ) : null}
                  </td>
                  <td className="hidden px-3 py-2 text-[var(--color-muted)] sm:table-cell" dir="ltr">
                    {u.enName || '—'}
                  </td>
                  <td className="tnum hidden px-3 py-2 text-end md:table-cell">
                    {u.defaultSize != null ? formatNumber(u.defaultSize) : '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <OriginBadge origin={u.origin} />
                  </td>
                  <td className="px-3 py-2 text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('md.edit')}
                      title={t('md.edit')}
                      onClick={() => setDialog({ unit: u })}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {dialog ? <UnitDialog unit={dialog.unit} onClose={() => setDialog(null)} /> : null}
    </Card>
  );
}

function UnitDialog({ unit, onClose }: { unit: Unit | null; onClose: () => void }) {
  const { t } = useTranslation();
  const isEdit = !!unit;
  const create = useCreateUnit();
  const update = useUpdateUnit();
  const pending = create.isPending || update.isPending;

  const [code, setCode] = useState(unit?.code ?? '');
  const [arName, setArName] = useState(unit?.arName ?? '');
  const [enName, setEnName] = useState(unit?.enName ?? '');
  const [defaultSize, setDefaultSize] = useState(
    unit?.defaultSize != null ? String(unit.defaultSize) : '',
  );
  const [inactive, setInactive] = useState(unit?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Unit code is required on create (MEASURE_CODE is the key).
  const canSubmit = (isEdit || code.trim().length > 0) && arName.trim().length > 0;

  const submit = async () => {
    setError(null);
    const dto = {
      arName: arName.trim(),
      enName: enName.trim() || undefined,
      defaultSize: defaultSize.trim() ? Number(defaultSize) : undefined,
      inactive,
    };
    try {
      if (isEdit && unit) {
        const saved = await update.mutateAsync({ code: unit.code, dto });
        setDone(`${t('groupsUnits.unitUpdated')} ${saved.code}`);
      } else {
        const saved = await create.mutateAsync({ ...dto, code: code.trim() });
        setDone(`${t('groupsUnits.unitCreated')} ${saved.code}`);
      }
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={isEdit ? t('groupsUnits.editUnit') : t('groupsUnits.newUnit')}
      icon={<Ruler className="size-5 text-[var(--color-brand-500)]" aria-hidden />}
      origin={unit?.origin}
      onClose={onClose}
      done={done}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <Field label={t('md.code')}>
        <Input
          autoFocus={!isEdit}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isEdit}
          className="h-10"
          placeholder={t('groupsUnits.unitCodePlaceholder')}
        />
      </Field>
      <Field label={t('md.arName')}>
        <Input
          autoFocus={isEdit}
          value={arName}
          onChange={(e) => setArName(e.target.value)}
          className="h-10"
        />
      </Field>
      <Field label={t('md.enName')}>
        <Input value={enName} onChange={(e) => setEnName(e.target.value)} className="h-10" dir="ltr" />
      </Field>
      <Field label={t('groupsUnits.defaultSize')}>
        <Input
          type="number"
          min={0}
          value={defaultSize}
          onChange={(e) => setDefaultSize(e.target.value)}
          className="tnum h-10 text-end"
        />
      </Field>
      <CheckField label={t('md.inactive')} checked={inactive} onChange={setInactive} />
    </MdDialog>
  );
}
