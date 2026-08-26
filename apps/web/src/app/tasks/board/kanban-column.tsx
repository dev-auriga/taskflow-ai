'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DraggableTaskCard } from './task-card';
import type { TaskWithProject } from '@taskflow/shared';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: TaskWithProject[];
  onStatusChange: (taskId: string, status: string) => void;
}

export function KanbanColumn({ id, title, tasks, onStatusChange }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-3 p-4 bg-muted/50 rounded-lg min-h-[400px] transition-colors',
        isOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <h3 className="font-semibold text-sm whitespace-nowrap">{title}</h3>
        <Badge variant="secondary" className="text-xs shrink-0">
          {tasks.length}
        </Badge>
      </div>

      {/* Task Cards */}
      {tasks.map((task) => (
        <DraggableTaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
        />
      ))}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Drop tasks here
          </p>
        </div>
      )}
    </div>
  );
}
