import { cn } from '@/shared/lib/cn';

/*
 * Skeleton — placeholder نابض هادئ على tokens (U3 من EXCELLENCE_AUDIT).
 * يحسّن الأداء المُدرَك (perceived performance): بدل spinner فارغ، يرى
 * المستخدم شكل المحتوى القادم فوراً. يحترم prefers-reduced-motion
 * (animate-pulse يُعطَّل عالمياً في tokens.css).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-[var(--radius)] bg-[var(--color-surface-3)]',
        className,
      )}
    />
  );
}

/** بطاقة صنف هيكلية — تطابق أبعاد بطاقة ItemGrid الحقيقية. */
export function ItemCardSkeleton() {
  return (
    <div className="flex min-h-[var(--touch-lg)] flex-col gap-2 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="mt-auto h-5 w-2/5" />
    </div>
  );
}

/** شبكة بطاقات هيكلية لحالة تحميل كتالوج POS. */
export function ItemGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
      role="status"
      aria-label="جارٍ التحميل"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}
