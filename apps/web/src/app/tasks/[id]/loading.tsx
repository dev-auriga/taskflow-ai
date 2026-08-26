import { Skeleton } from '@/components/ui/skeleton';

export default function TaskDetailLoading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-8 w-80" />
        </div>
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
