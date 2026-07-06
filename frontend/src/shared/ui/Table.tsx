import { cn } from '@/shared/lib/cn';

/*
 * Table متجاوب موحّد على الـtokens (المرحلة 1).
 * نمط "responsive stacked": على الجوال يتحوّل كل صف إلى بطاقة (label/value)
 * عبر data-label على الخلايا؛ على التابلت/الديسكتوب جدول عادي قابل للتمرير أفقياً.
 *
 * الاستخدام:
 *   <Table>
 *     <THead><TR><TH>الاسم</TH>…</TR></THead>
 *     <TBody><TR><TD data-label="الاسم">…</TD>…</TR></TBody>
 *   </Table>
 *
 * فعّل النمط المكدّس على الجوال بإضافة الصنف "table-stack" على <Table>.
 */
export function Table({
  className,
  stack = true,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement> & { stack?: boolean }) {
  return (
    <div className="w-full overflow-x-auto scroll-thin">
      <table
        className={cn(
          'w-full border-collapse text-start text-[length:var(--text-sm)]',
          stack && 'table-stack',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="text-[color:var(--color-muted)]" {...props} />;
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y" {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b', className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('px-3 py-2 text-start text-[length:var(--text-xs)] font-semibold', className)}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-3 py-2 align-middle', className)} {...props} />;
}
