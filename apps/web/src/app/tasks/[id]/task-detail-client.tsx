'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/status-badge';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { TASK_STATUS_OPTIONS, type TaskWithProject } from '@taskflow/shared';

interface TaskDetailClientProps {
  taskId: string;
  initialData: TaskWithProject | null;
}

export function TaskDetailClient({ taskId, initialData }: TaskDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: task, isLoading, isError } = useQuery<TaskWithProject>({
    queryKey: ['tasks', taskId],
    queryFn: () => apiClient.get<TaskWithProject>(`/api/tasks/${taskId}`),
    initialData: initialData ?? undefined,
  });

  // Inline status change mutation
  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      apiClient.patch(`/api/tasks/${taskId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Task status updated');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update status');
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Task deleted successfully');
      router.push('/tasks');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete task');
      }
    },
  });

  if (isLoading && !task) {
    return <TaskDetailSkeleton />;
  }

  if (isError && !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Task not found</h2>
        <p className="text-muted-foreground mb-4">
          The task you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button variant="outline" onClick={() => router.push('/tasks')}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/tasks" className="hover:text-foreground">
              Tasks
            </Link>
            <span>/</span>
            <Link
              href={`/projects/${task.project.id}`}
              className="hover:text-foreground"
            >
              {task.project.name}
            </Link>
          </div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Status (inline changeable) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Status</label>
                <div className="mt-1">
                  <Select
                    value={task.status}
                    onChange={(e) => statusMutation.mutate(e.target.value)}
                    options={TASK_STATUS_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                    disabled={statusMutation.isPending}
                    className="w-[150px]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Priority</label>
                <div className="mt-1">
                  <TaskPriorityBadge priority={task.priority} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="text-xs text-muted-foreground font-medium">Description</label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="text-xs text-muted-foreground font-medium">Project</label>
              <p className="mt-1 text-sm">
                <Link
                  href={`/projects/${task.project.id}`}
                  className="text-primary hover:underline"
                >
                  {task.project.name}
                </Link>
              </p>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due Date
              </label>
              <p className="mt-1 text-sm">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No due date'}
              </p>
            </div>

            {/* Created */}
            <div>
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created
              </label>
              <p className="mt-1 text-sm">
                {new Date(task.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Updated */}
            <div>
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Updated
              </label>
              <p className="mt-1 text-sm">
                {new Date(task.updatedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {task.labels.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          task={task}
          onSuccess={() => {
            setEditOpen(false);
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
          }}
        />
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function TaskDetailSkeleton() {
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
