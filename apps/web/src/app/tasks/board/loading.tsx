import { Skeleton } from '@/components/ui/skeleton';

export default function BoardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-3 gap-4 min-w-[768px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Skeleton className="h-6 w-24" />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-28" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
