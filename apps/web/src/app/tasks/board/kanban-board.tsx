'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { AlertCircle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TASK_STATUS,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  type TaskWithProject,
  type ProjectWithCounts,
} from '@taskflow/shared';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';

interface KanbanBoardProps {
  initialTasks: TaskWithProject[] | null;
  initialProjects: ProjectWithCounts[] | null;
}

export function KanbanBoard({ initialTasks, initialProjects }: KanbanBoardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<TaskWithProject | null>(null);

  // Filters from URL
  const projectId = searchParams.get('projectId') || '';
  const priority = searchParams.get('priority') || '';

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Build query params
  const queryParams = new URLSearchParams();
  if (projectId) queryParams.set('projectId', projectId);
  if (priority) queryParams.set('priority', priority);
  const queryString = queryParams.toString();

  // Fetch tasks
  const { data: tasks, isLoading, isError } = useQuery<TaskWithProject[]>({
    queryKey: ['tasks', 'board', queryString],
    queryFn: () =>
      apiClient.get<TaskWithProject[]>(`/api/tasks${queryString ? `?${queryString}` : ''}`),
    initialData: !queryString ? (initialTasks ?? undefined) : undefined,
  });

  // Fetch projects for filter
  const { data: projects } = useQuery<ProjectWithCounts[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<ProjectWithCounts[]>('/api/projects'),
    initialData: initialProjects ?? undefined,
  });

  // Status update mutation with optimistic update
  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      apiClient.patch(`/api/tasks/${taskId}/status`, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'board', queryString] });
      const previous = queryClient.getQueryData<TaskWithProject[]>(['tasks', 'board', queryString]);

      queryClient.setQueryData<TaskWithProject[]>(
        ['tasks', 'board', queryString],
        (old) => old?.map((t) => (t.id === taskId ? { ...t, status: status as TaskWithProject['status'] } : t)) ?? [],
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks', 'board', queryString], context.previous);
      }
      toast.error('Failed to update task status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks?.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = tasks?.find((t) => t.id === taskId);

    if (task && task.status !== newStatus) {
      statusMutation.mutate({ taskId, status: newStatus });
    }
  };

  // Group tasks by status
  const todoTasks = tasks?.filter((t) => t.status === TASK_STATUS.TODO) ?? [];
  const inProgressTasks = tasks?.filter((t) => t.status === TASK_STATUS.IN_PROGRESS) ?? [];
  const completedTasks = tasks?.filter((t) => t.status === TASK_STATUS.COMPLETED) ?? [];

  if (isError && !tasks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Failed to load board</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Board</h1>
          <p className="text-muted-foreground mt-1">Drag tasks between columns to change status</p>
        </div>
        <Link href="/tasks" className="text-sm text-primary hover:underline">
          Switch to List View
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={projectId}
          onChange={(e) => setFilter('projectId', e.target.value)}
          options={[
            { value: '', label: 'All Projects' },
            ...(projects || []).map((p) => ({ value: p.id, label: p.name })),
          ]}
          className="w-[180px]"
        />
        <Select
          value={priority}
          onChange={(e) => setFilter('priority', e.target.value)}
          options={[
            { value: '', label: 'All Priority' },
            ...TASK_PRIORITY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
          ]}
          className="w-[150px]"
        />
      </div>

      {/* Board */}
      {isLoading && !tasks ? (
        <BoardSkeleton />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-4">
            <div className="grid grid-cols-3 gap-4 min-w-[820px]">
              <KanbanColumn
                id={TASK_STATUS.TODO}
                title="To Do"
                tasks={todoTasks}
                onStatusChange={(taskId, status) => statusMutation.mutate({ taskId, status })}
              />
              <KanbanColumn
                id={TASK_STATUS.IN_PROGRESS}
                title="In Progress"
                tasks={inProgressTasks}
                onStatusChange={(taskId, status) => statusMutation.mutate({ taskId, status })}
              />
              <KanbanColumn
                id={TASK_STATUS.COMPLETED}
                title="Completed"
                tasks={completedTasks}
                onStatusChange={(taskId, status) => statusMutation.mutate({ taskId, status })}
              />
            </div>
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} isDragging />}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 min-w-[768px]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-28" />
          ))}
        </div>
      ))}
    </div>
  );
}
