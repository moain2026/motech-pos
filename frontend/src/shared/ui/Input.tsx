import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

/*
 * Input موحّد على الـtokens (المرحلة 1). الافتراضي h-11 (متوافق مع الاستخدام
 * القائم)؛ size='touch' يعطي هدف لمس ≥48px لحقول POS الأساسية. لا يزال يمكن
 * تجاوز الارتفاع عبر className (h-8/h-9 المستخدمة في الحوارات المدمجة).
 */
const inputVariants = cva(
  'w-full rounded-[var(--radius)] border bg-[var(--color-surface-2)] px-3 text-[color:var(--color-fg)] placeholder:text-[var(--color-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand-500)] disabled:opacity-50',
  {
    variants: {
      inputSize: {
        sm: 'h-9 text-[length:var(--text-sm)]',
        md: 'h-11 text-[length:var(--text-sm)]',
        touch: 'min-h-[var(--touch)] text-[length:var(--text-base)]',
      },
    },
    defaultVariants: { inputSize: 'md' },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize, ...props }, ref) => (
    <input ref={ref} className={cn(inputVariants({ inputSize }), className)} {...props} />
  ),
);
Input.displayName = 'Input';
