import { cn } from '@/shared/lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border bg-[var(--color-surface)] shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
