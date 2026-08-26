'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertCircle,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/ui/status-badge';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import type { DashboardResponse, TaskWithProject } from '@taskflow/shared';

interface DashboardClientProps {
  initialData: DashboardResponse | null;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const { data, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get<DashboardResponse>('/api/dashboard'),
    initialData: initialData ?? undefined,
  });

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (isError && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground">Make sure the API server is running.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your projects and tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Projects"
          value={data.projectStats.total}
          icon={FolderKanban}
        />
        <StatCard
          label="Active Projects"
          value={data.projectStats.active}
          icon={FolderKanban}
          className="text-blue-600"
        />
        <StatCard
          label="Total Tasks"
          value={data.taskStats.total}
          icon={CheckSquare}
        />
        <StatCard
          label="To Do"
          value={data.taskStats.todo}
          icon={Clock}
          className="text-gray-600"
        />
        <StatCard
          label="In Progress"
          value={data.taskStats.inProgress}
          icon={Loader2}
          className="text-blue-600"
        />
        <StatCard
          label="Completed"
          value={data.taskStats.completed}
          icon={CheckSquare}
          className="text-green-600"
        />
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        projectStats={data.projectStats}
        taskStats={data.taskStats}
      />

      {/* Recent and Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No tasks yet. Create your first task to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentTasks.slice(0, 8).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming tasks with due dates in the next 7 days.
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcomingTasks.map((task) => (
                  <UpcomingTaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${className || 'text-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task }: { task: TaskWithProject }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground">{task.project.name}</p>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} />
      </div>
    </Link>
  );
}

function UpcomingTaskRow({ task }: { task: TaskWithProject }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const formattedDate = dueDate
    ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground">{task.project.name}</p>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedDate}</span>
        <TaskPriorityBadge priority={task.priority} />
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
