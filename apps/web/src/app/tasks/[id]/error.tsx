'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaskDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Failed to load task</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || 'The task could not be loaded.'}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push('/tasks')}>
          Back to Tasks
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
