// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_STATUS_OPTIONS = [
  { value: PROJECT_STATUS.ACTIVE, label: 'Active' },
  { value: PROJECT_STATUS.COMPLETED, label: 'Completed' },
  { value: PROJECT_STATUS.ARCHIVED, label: 'Archived' },
] as const;

// Task Status
export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.TODO, label: 'To Do' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TASK_STATUS.COMPLETED, label: 'Completed' },
] as const;

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const TASK_PRIORITY_OPTIONS = [
  { value: TASK_PRIORITY.LOW, label: 'Low' },
  { value: TASK_PRIORITY.MEDIUM, label: 'Medium' },
  { value: TASK_PRIORITY.HIGH, label: 'High' },
] as const;

// Sort fields for tasks
export const TASK_SORT_FIELDS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  DUE_DATE: 'dueDate',
  PRIORITY: 'priority',
} as const;

export type TaskSortField = (typeof TASK_SORT_FIELDS)[keyof typeof TASK_SORT_FIELDS];

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
