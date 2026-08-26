'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, FolderKanban, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectStatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectForm } from '@/components/projects/project-form';
import type { ProjectWithCounts } from '@taskflow/shared';

interface ProjectsClientProps {
  initialData: ProjectWithCounts[] | null;
}

export function ProjectsClient({ initialData }: ProjectsClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ProjectWithCounts | null>(null);

  const { data: projects, isLoading, isError } = useQuery<ProjectWithCounts[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<ProjectWithCounts[]>('/api/projects'),
    initialData: initialData ?? undefined,
  });

  if (isLoading && !projects) {
    return <ProjectsSkeleton />;
  }

  if (isError && !projects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Failed to load projects</h2>
        <p className="text-muted-foreground">Make sure the API server is running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your projects</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project List */}
      {!projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing your tasks."
          action={{ label: 'Create Project', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setEditProject(project)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <ProjectForm onSuccess={() => setCreateOpen(false)} />
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        {editProject && (
          <ProjectForm
            project={editProject}
            onSuccess={() => setEditProject(null)}
          />
        )}
      </Dialog>
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
}: {
  project: ProjectWithCounts;
  onEdit: () => void;
}) {
  const completionPercent =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/projects/${project.id}`} className="flex-1 min-w-0">
            <CardTitle className="text-base truncate hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
          </Link>
          <ProjectStatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Task Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {project.completedTaskCount} / {project.taskCount} tasks
            </span>
            <span>{completionPercent}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-3">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
