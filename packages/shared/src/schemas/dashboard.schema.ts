import { z } from 'zod';
import { taskWithProjectSchema } from './task.schema';

/**
 * Dashboard project statistics.
 */
export const projectStatsSchema = z.object({
  total: z.number().int().min(0),
  active: z.number().int().min(0),
  completed: z.number().int().min(0),
  archived: z.number().int().min(0),
});

/**
 * Dashboard task statistics.
 */
export const taskStatsSchema = z.object({
  total: z.number().int().min(0),
  todo: z.number().int().min(0),
  inProgress: z.number().int().min(0),
  completed: z.number().int().min(0),
});

/**
 * Full dashboard response schema.
 */
export const dashboardResponseSchema = z.object({
  projectStats: projectStatsSchema,
  taskStats: taskStatsSchema,
  recentTasks: z.array(taskWithProjectSchema),
  upcomingTasks: z.array(taskWithProjectSchema),
});

// Inferred TypeScript types
export type ProjectStats = z.infer<typeof projectStatsSchema>;
export type TaskStats = z.infer<typeof taskStatsSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
