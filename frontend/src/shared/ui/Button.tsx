import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold transition-colors select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)]',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)]',
        success: 'bg-[var(--color-success)] text-white hover:brightness-110',
        danger: 'bg-[var(--color-danger)] text-white hover:brightness-110',
        ghost: 'bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]',
        outline:
          'border bg-transparent text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]',
      },
      size: {
        md: 'h-11 px-4 text-sm',
        lg: 'h-14 px-6 text-base',
        icon: 'h-11 w-11 p-0',
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
