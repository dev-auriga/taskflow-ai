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
  Plus,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectStatusBadge, TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { ProjectForm } from '@/components/projects/project-form';
import { TaskForm } from '@/components/tasks/task-form';
import type { ProjectWithCounts, TaskResponse } from '@taskflow/shared';

interface ProjectDetailData extends ProjectWithCounts {
  tasks: TaskResponse[];
}

interface ProjectDetailClientProps {
  projectId: string;
  initialData: ProjectDetailData | null;
}

export function ProjectDetailClient({ projectId, initialData }: ProjectDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const { data: project, isLoading, isError } = useQuery<ProjectDetailData>({
    queryKey: ['projects', projectId],
    queryFn: () => apiClient.get<ProjectDetailData>(`/api/projects/${projectId}`),
    initialData: initialData ?? undefined,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Project deleted successfully');
      router.push('/projects');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete project');
      }
    },
  });

  if (isLoading && !project) {
    return <ProjectDetailSkeleton />;
  }

  if (isError && !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Project not found</h2>
        <p className="text-muted-foreground mb-4">
          The project you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Button variant="outline" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) return null;

  const completionPercent =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Back button + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{project.taskCount}</p>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{project.completedTaskCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{project.taskCount - project.completedTaskCount}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{completionPercent}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tasks</CardTitle>
            <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet"
              description="Create your first task for this project."
              action={{
                label: 'Add Task',
                onClick: () => setCreateTaskOpen(true),
              }}
            />
          ) : (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <TaskStatusBadge status={task.status} />
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <ProjectForm
          project={project}
          onSuccess={() => {
            setEditOpen(false);
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
          }}
        />
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This will also delete all ${project.taskCount} associated tasks. This action cannot be undone.`}
        confirmLabel="Delete Project"
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />

      {/* Create Task Dialog */}
      <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
        <DialogHeader>
          <DialogTitle>Add Task to {project.name}</DialogTitle>
        </DialogHeader>
        <TaskForm
          defaultProjectId={projectId}
          onSuccess={() => {
            setCreateTaskOpen(false);
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
          }}
        />
      </Dialog>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
