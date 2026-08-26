'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  CheckSquare,
  AlertCircle,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/status-badge';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import {
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  type TaskWithProject,
  type ProjectWithCounts,
} from '@taskflow/shared';

interface TasksClientProps {
  initialTasks: TaskWithProject[] | null;
  initialProjects: ProjectWithCounts[] | null;
}

export function TasksClient({ initialTasks, initialProjects }: TasksClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  // Read filter state from URL
  const filters = {
    search: searchParams.get('search') || '',
    projectId: searchParams.get('projectId') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };

  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search — update URL after 300ms of no typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilter('search', searchInput);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Update a single filter in URL params
  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchInput('');
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
  }, [filters.sortOrder, setFilter]);

  // Build query params for API
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set('search', filters.search);
  if (filters.projectId) queryParams.set('projectId', filters.projectId);
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.priority) queryParams.set('priority', filters.priority);
  if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

  const queryString = queryParams.toString();

  // Fetch tasks with current filters
  const { data: tasks, isLoading, isError } = useQuery<TaskWithProject[]>({
    queryKey: ['tasks', queryString],
    queryFn: () =>
      apiClient.get<TaskWithProject[]>(`/api/tasks${queryString ? `?${queryString}` : ''}`),
    initialData: !queryString ? (initialTasks ?? undefined) : undefined,
  });

  // Fetch projects for filter dropdown
  const { data: projects } = useQuery<ProjectWithCounts[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<ProjectWithCounts[]>('/api/projects'),
    initialData: initialProjects ?? undefined,
  });

  const hasActiveFilters = !!(filters.search || filters.projectId || filters.status || filters.priority);

  if (isError && !tasks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Failed to load tasks</h2>
        <p className="text-muted-foreground">Make sure the API server is running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">All tasks across projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tasks/board" className="text-sm text-primary hover:underline">
            Board View
          </Link>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Project Filter */}
        <Select
          value={filters.projectId}
          onChange={(e) => setFilter('projectId', e.target.value)}
          options={[
            { value: '', label: 'All Projects' },
            ...(projects || []).map((p) => ({ value: p.id, label: p.name })),
          ]}
          className="w-[180px]"
        />

        {/* Status Filter */}
        <Select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          options={[
            { value: '', label: 'All Status' },
            ...TASK_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
          ]}
          className="w-[150px]"
        />

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onChange={(e) => setFilter('priority', e.target.value)}
          options={[
            { value: '', label: 'All Priority' },
            ...TASK_PRIORITY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
          ]}
          className="w-[150px]"
        />

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onChange={(e) => setFilter('sortBy', e.target.value)}
          options={[
            { value: 'createdAt', label: 'Created Date' },
            { value: 'updatedAt', label: 'Updated Date' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'priority', label: 'Priority' },
          ]}
          className="w-[150px]"
        />

        {/* Sort Order Toggle */}
        <Button variant="outline" size="icon" onClick={toggleSortOrder} title="Toggle sort order">
          {filters.sortOrder === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Task List */}
      {isLoading && !tasks ? (
        <TaskListSkeleton />
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters.'
              : 'Create your first task to get started.'
          }
          action={
            hasActiveFilters
              ? { label: 'Clear Filters', onClick: clearFilters }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{task.project.name}</span>
                  {task.dueDate && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          defaultProjectId={filters.projectId || undefined}
          onSuccess={() => setCreateOpen(false)}
        />
      </Dialog>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
