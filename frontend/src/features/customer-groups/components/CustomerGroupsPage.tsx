import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UsersRound, Plus, Pencil, UserPlus, UserMinus, MessageSquare } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { LoadingView, ErrorView, EmptyView } from '@/shared/ui/StateView';
import {
  useCustomerGroups,
  useCustomerGroup,
  useCreateCustomerGroup,
  useUpdateCustomerGroup,
  useAssignGroupMember,
  useUnassignGroupMember,
  type CustomerGroup,
} from '../api/customer-groups.api';
import { Field, CheckField, MdDialog, errorText } from '@/features/master-data/components/MdShared';

/**
 * مجموعات عملاء نقاط البيع (POSI009) — master/detail: groups list on one
 * side, members of the selected group on the other (responsive: stacked on
 * mobile). One group per customer — assigning reassigns. Feeds POSR012.
 * supervisor/admin.
 */
export function CustomerGroupsPage() {
  const { t } = useTranslation();
  const query = useCustomerGroups();
  const [selected, setSelected] = useState<number | null>(null);
  const [dialog, setDialog] = useState<{ group: CustomerGroup | null } | null>(null);

  const rows = query.data ?? [];
  const selectedGroup = rows.find((g) => g.grpCode === selected) ?? null;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <UsersRound className="size-6 text-[var(--color-brand-500)]" aria-hidden />
          {t('custGroups.title')}
        </h1>
        <Button variant="primary" onClick={() => setDialog({ group: null })}>
          <Plus className="size-4" />
          {t('custGroups.new')}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Groups list */}
        <Card className="flex min-h-[200px] flex-col overflow-hidden lg:min-h-0">
          <div className="min-h-0 flex-1 overflow-auto scroll-thin">
            {query.isLoading ? (
              <LoadingView />
            ) : query.isError ? (
              <ErrorView error={query.error} onRetry={() => query.refetch()} />
            ) : rows.length === 0 ? (
              <EmptyView label={t('custGroups.empty')} />
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-3 py-2 text-start font-semibold">{t('custGroups.name')}</th>
                    <th className="px-3 py-2 text-end font-semibold">{t('custGroups.code')}</th>
                    <th className="px-3 py-2 text-end font-semibold">{t('custGroups.members')}</th>
                    <th className="px-3 py-2 text-end font-semibold">{t('md.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((g) => (
                    <tr
                      key={g.id}
                      onClick={() => setSelected(g.grpCode)}
                      className={
                        'cursor-pointer hover:bg-[var(--color-surface-2)] ' +
                        (selected === g.grpCode ? 'bg-[var(--color-brand-600)]/10' : '') +
                        (g.inactive ? ' opacity-50' : '')
                      }
                    >
                      <td className="px-3 py-2 font-medium">
                        {g.arName?.trim() || g.enName?.trim() || `#${g.grpCode}`}
                        {g.sendMsg ? (
                          <MessageSquare
                            className="ms-2 inline size-3.5 text-[var(--color-brand-500)]"
                            aria-label={t('custGroups.sendMsg')}
                          />
                        ) : null}
                        {g.inactive ? (
                          <span className="ms-2 rounded-full bg-[var(--color-danger)]/15 px-2 py-0.5 text-[10px] text-[var(--color-danger)]">
                            {t('md.inactive')}
                          </span>
                        ) : null}
                      </td>
                      <td className="tnum px-3 py-2 text-end text-[var(--color-muted)]">
                        {g.grpCode}
                      </td>
                      <td className="tnum px-3 py-2 text-end">{g.memberCount}</td>
                      <td className="px-3 py-2 text-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t('md.edit')}
                          title={t('md.edit')}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDialog({ group: g });
                          }}
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
        </Card>

        {/* Members panel */}
        <Card className="flex min-h-[240px] flex-col overflow-hidden lg:min-h-0">
          {selectedGroup ? (
            <MembersPanel grpCode={selectedGroup.grpCode} />
          ) : (
            <div className="grid flex-1 place-items-center p-6 text-sm text-[var(--color-muted)]">
              {t('custGroups.pickGroup')}
            </div>
          )}
        </Card>
      </div>

      {dialog ? <GroupDialog group={dialog.group} onClose={() => setDialog(null)} /> : null}
    </div>
  );
}

function MembersPanel({ grpCode }: { grpCode: number }) {
  const { t } = useTranslation();
  const detail = useCustomerGroup(grpCode);
  const assign = useAssignGroupMember();
  const unassign = useUnassignGroupMember();

  const [newMember, setNewMember] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addMember = async () => {
    const code = newMember.trim();
    if (!code) return;
    setError(null);
    try {
      await assign.mutateAsync({ grpCode, customerCode: code });
      setNewMember('');
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  const removeMember = async (customerCode: string) => {
    setError(null);
    try {
      await unassign.mutateAsync(customerCode);
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <>
      <div className="border-b px-4 py-3">
        <h2 className="font-bold">
          {t('custGroups.membersOf')}{' '}
          <span className="text-[var(--color-brand-500)]">
            {detail.data?.arName?.trim() || detail.data?.enName?.trim() || `#${grpCode}`}
          </span>
        </h2>
        <div className="mt-2 flex gap-2">
          <Input
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void addMember();
            }}
            placeholder={t('custGroups.customerCodePlaceholder')}
            className="tnum h-10"
            aria-label={t('custGroups.addMember')}
          />
          <Button
            variant="primary"
            disabled={!newMember.trim() || assign.isPending}
            onClick={() => void addMember()}
          >
            <UserPlus className="size-4" />
            <span className="hidden sm:inline">{t('custGroups.addMember')}</span>
          </Button>
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-2 rounded-md bg-[var(--color-danger)]/15 p-2 text-center text-xs text-[var(--color-danger)]"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-auto scroll-thin">
        {detail.isLoading ? (
          <LoadingView />
        ) : detail.isError ? (
          <ErrorView error={detail.error} onRetry={() => detail.refetch()} />
        ) : !detail.data || detail.data.members.length === 0 ? (
          <EmptyView label={t('custGroups.noMembers')} />
        ) : (
          <ul className="divide-y" aria-label={t('custGroups.members')}>
            {detail.data.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.customerName?.trim() || '—'}</p>
                  <p className="tnum text-xs text-[var(--color-muted)]">{m.customerCode}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('custGroups.removeMember')}
                  title={t('custGroups.removeMember')}
                  disabled={unassign.isPending}
                  onClick={() => void removeMember(m.customerCode)}
                >
                  <UserMinus className="size-4 text-[var(--color-danger)]" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function GroupDialog({ group, onClose }: { group: CustomerGroup | null; onClose: () => void }) {
  const { t } = useTranslation();
  const isEdit = !!group;
  const create = useCreateCustomerGroup();
  const update = useUpdateCustomerGroup();
  const pending = create.isPending || update.isPending;

  const [grpCode, setGrpCode] = useState(group ? String(group.grpCode) : '');
  const [arName, setArName] = useState(group?.arName ?? '');
  const [enName, setEnName] = useState(group?.enName ?? '');
  const [sendMsg, setSendMsg] = useState(group?.sendMsg ?? false);
  const [inactive, setInactive] = useState(group?.inactive ?? false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const canSubmit = arName.trim().length > 0;

  const submit = async () => {
    setError(null);
    const dto = {
      arName: arName.trim(),
      enName: enName.trim() || undefined,
      sendMsg,
      inactive,
    };
    try {
      if (isEdit && group) {
        const saved = await update.mutateAsync({ grpCode: group.grpCode, dto });
        setDone(`${t('custGroups.updated')} ${saved.grpCode}`);
      } else {
        const saved = await create.mutateAsync({
          ...dto,
          grpCode: grpCode.trim() ? Number(grpCode) : undefined,
        });
        setDone(`${t('custGroups.created')} ${saved.grpCode}`);
      }
    } catch (e) {
      setError(errorText(e, t('md.saveError')));
    }
  };

  return (
    <MdDialog
      title={isEdit ? t('custGroups.editTitle') : t('custGroups.newTitle')}
      icon={<UsersRound className="size-5 text-[var(--color-brand-500)]" aria-hidden />}
      onClose={onClose}
      done={done}
      error={error}
      pending={pending}
      canSubmit={canSubmit}
      onSubmit={submit}
    >
      <Field label={t('custGroups.code')}>
        <Input
          type="number"
          min={1}
          value={grpCode}
          onChange={(e) => setGrpCode(e.target.value)}
          disabled={isEdit}
          className="tnum h-10"
          placeholder={t('md.codeAuto')}
        />
      </Field>
      <Field label={t('md.arName')}>
        <Input autoFocus value={arName} onChange={(e) => setArName(e.target.value)} className="h-10" />
      </Field>
      <Field label={t('md.enName')}>
        <Input value={enName} onChange={(e) => setEnName(e.target.value)} className="h-10" dir="ltr" />
      </Field>
      <CheckField label={t('custGroups.sendMsg')} checked={sendMsg} onChange={setSendMsg} />
      <CheckField label={t('md.inactive')} checked={inactive} onChange={setInactive} />
    </MdDialog>
  );
}
