'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">Failed to load board</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || 'Something went wrong while loading the board.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
