'use client';

import { useDraggable } from '@dnd-kit/core';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { TaskPriorityBadge } from '@/components/ui/status-badge';
import { TASK_STATUS_OPTIONS, type TaskWithProject } from '@taskflow/shared';

interface TaskCardProps {
  task: TaskWithProject;
  isDragging?: boolean;
  onStatusChange?: (taskId: string, status: string) => void;
}

export function TaskCard({ task, isDragging = false, onStatusChange }: TaskCardProps) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const formattedDate = dueDate
    ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <Card
      className={cn(
        'p-3 cursor-grab active:cursor-grabbing',
        isDragging && 'shadow-lg rotate-1 opacity-90',
      )}
    >
      <div className="space-y-2">
        {/* Title */}
        <Link
          href={`/tasks/${task.id}`}
          className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
          onClick={(e) => e.stopPropagation()}
        >
          {task.title}
        </Link>

        {/* Project + Due Date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{task.project.name}</span>
          {formattedDate && <span className="whitespace-nowrap ml-2">{formattedDate}</span>}
        </div>

        {/* Priority + Status Fallback */}
        <div className="flex items-center justify-between">
          <TaskPriorityBadge priority={task.priority} />
          {onStatusChange && (
            <Select
              value={task.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(task.id, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              options={TASK_STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              className="w-[130px] h-full text-xs"
              aria-label="Change task status"
            />
          )}
        </div>
      </div>
    </Card>
  );
}

interface DraggableTaskCardProps {
  task: TaskWithProject;
  onStatusChange: (taskId: string, status: string) => void;
}

export function DraggableTaskCard({ task, onStatusChange }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('touch-none', isDragging && 'opacity-50')}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onStatusChange={onStatusChange} />
    </div>
  );
}
