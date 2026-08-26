import { Badge } from './badge';
import type { TaskStatus, TaskPriority, ProjectStatus } from '@taskflow/shared';

const statusConfig: Record<string, { label: string; variant: 'secondary' | 'default' | 'success' }> = {
  TODO: { label: 'To Do', variant: 'secondary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'success' },
};

const priorityConfig: Record<string, { label: string; variant: 'outline' | 'warning' | 'destructive' }> = {
  LOW: { label: 'Low', variant: 'outline' },
  MEDIUM: { label: 'Medium', variant: 'warning' },
  HIGH: { label: 'High', variant: 'destructive' },
};

const projectStatusConfig: Record<string, { label: string; variant: 'success' | 'default' | 'secondary' }> = {
  ACTIVE: { label: 'Active', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'secondary' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus | string }) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority | string }) {
  const config = priorityConfig[priority] || { label: priority, variant: 'outline' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus | string }) {
  const config = projectStatusConfig[status] || { label: status, variant: 'secondary' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
