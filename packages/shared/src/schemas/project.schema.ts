import { z } from 'zod';
import { PROJECT_STATUS } from '../constants/status';

/**
 * Zod schema for creating a new project.
 * Used by both frontend forms (via zodResolver) and backend validation (via ZodValidationPipe).
 */
export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(1, 'Project name is required')
    .max(255, 'Project name must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  status: z
    .enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED, PROJECT_STATUS.ARCHIVED])
    .default(PROJECT_STATUS.ACTIVE),
});

/**
 * Zod schema for updating an existing project.
 * All fields are optional — only changed fields need to be sent.
 */
export const updateProjectSchema = createProjectSchema.partial();

/**
 * Full project schema representing what the API returns.
 * Excludes deletedAt (soft-deleted records are never returned).
 */
export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED, PROJECT_STATUS.ARCHIVED]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Extended project response with task counts (used in project list).
 */
export const projectWithCountsSchema = projectResponseSchema.extend({
  taskCount: z.number().int().min(0),
  completedTaskCount: z.number().int().min(0),
});

// Inferred TypeScript types
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
export type ProjectWithCounts = z.infer<typeof projectWithCountsSchema>;
