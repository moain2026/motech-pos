import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Card } from '@/shared/ui/Card';
import { OnlineBadge } from '@/shared/ui/OnlineBadge';
import { ApiError } from '@/shared/lib/api-client';
import { useLogin } from '../api/auth.api';

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    await login.mutateAsync(values);
    navigate('/pos', { replace: true });
  });

  const errMsg =
    login.error instanceof ApiError
      ? login.error.status === 401
        ? t('auth.errorInvalid')
        : login.error.problem.detail || t('auth.errorGeneric')
      : login.error
        ? t('auth.errorGeneric')
        : null;

  return (
    <main className="grid min-h-full place-items-center bg-[var(--color-bg)] p-4">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-[var(--color-brand-600)] text-white">
            <ShoppingCart className="size-7" aria-hidden />
          </div>
          <h1 className="text-xl font-bold">{t('auth.title')}</h1>
          <p className="text-sm text-[var(--color-muted)]">{t('auth.subtitle')}</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              {t('auth.username')}
            </label>
            <Input
              id="username"
              autoComplete="username"
              autoFocus
              aria-invalid={!!errors.username}
              {...register('username')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.password')}
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
          </div>

          {errMsg ? (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {errMsg}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? t('auth.submitting') : t('auth.submit')}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span>{t('auth.demoHint')}</span>
          <OnlineBadge />
        </div>
      </Card>
    </main>
  );
}
