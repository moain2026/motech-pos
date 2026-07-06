import { cn } from '@/shared/lib/cn';

/*
 * Card موحّد على الـtokens (المرحلة 1) + مكوّنات فرعية اختيارية للترويسة/المحتوى
 * تُبقى التوافق مع الاستخدام القائم (<Card className=…>). variant='2' يستخدم سطحاً
 * أعمق (للحوارات/اللوحات داخل بطاقة).
 */
export function Card({
  className,
  variant = 'surface',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'surface' | 'surface-2' }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border shadow-[var(--shadow-sm)]',
        variant === 'surface-2'
          ? 'bg-[var(--color-surface-2)]'
          : 'bg-[var(--color-surface)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between gap-2 border-b px-4 py-3', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('flex items-center gap-2 text-[length:var(--text-lg)] font-bold', className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-4', className)} {...props} />;
}
