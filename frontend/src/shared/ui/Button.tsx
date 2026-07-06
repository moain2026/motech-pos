import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

/*
 * Button موحّد على الـtokens (المرحلة 1).
 * - variants دلالية (primary/secondary/success/danger/warning/ghost/outline).
 * - أحجام: sm / md (الافتراضي) / lg / touch (≥48px هدف POS) / xl (دفع كبير ثابت)
 *   / icon / icon-touch.
 * كل الأحجام القابلة للّمس تحقّق أهداف ≥44px (button min-height عالمي) والـtouch
 * تحديداً ≥48px لضغط ساعة الذروة (معيار POS §6).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold transition-colors select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)]',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)]',
        secondary:
          'bg-[var(--color-surface-3)] text-[var(--color-fg)] hover:bg-[var(--color-border-strong)]',
        success: 'bg-[var(--color-success)] text-white hover:brightness-110',
        warning: 'bg-[var(--color-warning)] text-white hover:brightness-110',
        danger: 'bg-[var(--color-danger)] text-white hover:brightness-110',
        ghost: 'bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]',
        outline:
          'border bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]',
      },
      size: {
        sm: 'h-9 px-3 text-[length:var(--text-xs)]',
        md: 'h-11 px-4 text-[length:var(--text-sm)]',
        lg: 'h-12 px-6 text-[length:var(--text-base)]',
        /* هدف لمس POS ≥48px */
        touch: 'min-h-[var(--touch)] px-5 text-[length:var(--text-base)]',
        /* زر دفع أساسي كبير ثابت */
        xl: 'min-h-[var(--touch-lg)] px-6 text-[length:var(--text-lg)] font-bold',
        icon: 'h-11 w-11 p-0',
        'icon-touch': 'size-[var(--touch)] p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
