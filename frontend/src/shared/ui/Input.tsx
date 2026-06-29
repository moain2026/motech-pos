import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-11 w-full rounded-[var(--radius)] border bg-[var(--color-surface-2)] px-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)]',
      'focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)]',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
