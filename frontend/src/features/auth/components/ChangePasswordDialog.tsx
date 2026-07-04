import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ApiError } from '@/shared/lib/api-client';
import { useChangePassword } from '../api/auth.api';

/**
 * POSS004 تغيير كلمة السر — old + new + confirm for the CURRENT user.
 * POST /auth/change-password (server verifies the old password, min 8 chars).
 */
export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const change = useChangePassword();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && newPassword !== confirm;
  const tooShort = newPassword.length > 0 && newPassword.length < 8;
  const canSubmit =
    !change.isPending &&
    oldPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirm;

  const submit = async () => {
    setError(null);
    if (!canSubmit) return;
    try {
      await change.mutateAsync({ oldPassword, newPassword });
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.problem.detail || e.problem.title);
      } else {
        setError(t('changePw.error'));
      }
    }
  };

  const type = show ? 'text' : 'password';

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('changePw.title')}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="flex items-center gap-2 font-bold">
            <KeyRound className="size-5 text-[var(--color-brand-500)]" aria-hidden />
            {t('changePw.title')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('changePw.close')}>
            <X className="size-5" />
          </Button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-12 text-[var(--color-success)]" aria-hidden />
            <p className="font-bold">{t('changePw.done')}</p>
            <Button variant="primary" className="w-full" onClick={onClose}>
              {t('changePw.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 p-4">
              <Field label={t('changePw.old')}>
                <Input
                  autoFocus
                  type={type}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-10"
                />
              </Field>
              <Field label={t('changePw.new')}>
                <Input
                  type={type}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-10"
                />
              </Field>
              {tooShort ? (
                <p className="text-xs text-[var(--color-warning)]">{t('changePw.minLen')}</p>
              ) : null}
              <Field label={t('changePw.confirm')}>
                <Input
                  type={type}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="h-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void submit();
                  }}
                />
              </Field>
              {mismatch ? (
                <p className="text-xs text-[var(--color-danger)]">{t('changePw.mismatch')}</p>
              ) : null}

              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="flex items-center gap-2 self-start text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              >
                {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                {show ? t('changePw.hidePw') : t('changePw.showPw')}
              </button>

              {error ? (
                <p role="alert" className="rounded-md bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('changePw.cancel')}
              </Button>
              <Button variant="primary" className="flex-1" disabled={!canSubmit} onClick={() => void submit()}>
                {change.isPending ? t('changePw.saving') : t('changePw.submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-[var(--color-muted)]">{label}</span>
      {children}
    </label>
  );
}
