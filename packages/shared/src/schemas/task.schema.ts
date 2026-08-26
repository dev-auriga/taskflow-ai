import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY, TASK_SORT_FIELDS, SORT_ORDER } from '../constants/status';

/**
 * Zod schema for creating a new task.
 * Used by both frontend forms and backend validation.
 */
export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .min(1, 'Task title is required')
    .max(255, 'Task title must be 255 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  projectId: z
    .string({ required_error: 'Project is required' })
    .uuid('Invalid project ID'),
  status: z
    .enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED])
    .default(TASK_STATUS.TODO),
  priority: z
    .enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH])
    .default(TASK_PRIORITY.MEDIUM),
  dueDate: z.string().optional().nullable().transform((val) => {
    if (!val || val === '') return null;
    // Accept both ISO datetime and datetime-local format
    const date = new Date(val);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  }),
  labels: z.array(z.string().max(50)).max(10).optional().default([]),
});

/**
 * Zod schema for updating an existing task.
 * All fields are optional — only changed fields need to be sent.
 */
export const updateTaskSchema = createTaskSchema.partial();

/**
 * Zod schema for updating only a task's status.
 * Used by the Kanban board drag-and-drop and status dropdown.
 */
export const updateTaskStatusSchema = z.object({
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED]),
});

/**
 * Full task schema representing what the API returns.
 * Excludes deletedAt. Includes project name for display.
 */
export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  projectId: z.string().uuid(),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED]),
  priority: z.enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH]),
  dueDate: z.string().datetime().nullable(),
  labels: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Task response with project info included (used in task lists).
 */
export const taskWithProjectSchema = taskResponseSchema.extend({
  project: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
});

/**
 * Query parameters for filtering/searching/sorting tasks.
 */
export const taskQuerySchema = z.object({
  search: z.string().optional(),
  projectId: z.string().uuid().optional(),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED]).optional(),
  priority: z.enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH]).optional(),
  sortBy: z
    .enum([
      TASK_SORT_FIELDS.CREATED_AT,
      TASK_SORT_FIELDS.UPDATED_AT,
      TASK_SORT_FIELDS.DUE_DATE,
      TASK_SORT_FIELDS.PRIORITY,
    ])
    .optional()
    .default(TASK_SORT_FIELDS.CREATED_AT),
  sortOrder: z.enum([SORT_ORDER.ASC, SORT_ORDER.DESC]).optional().default(SORT_ORDER.DESC),
});

// Inferred TypeScript types
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TaskWithProject = z.infer<typeof taskWithProjectSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
