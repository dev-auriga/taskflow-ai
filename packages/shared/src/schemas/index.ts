export {
  createProjectSchema,
  updateProjectSchema,
  projectResponseSchema,
  projectWithCountsSchema,
} from './project.schema';

export type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectResponse,
  ProjectWithCounts,
} from './project.schema';

export {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskResponseSchema,
  taskWithProjectSchema,
  taskQuerySchema,
} from './task.schema';

export type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  TaskResponse,
  TaskWithProject,
  TaskQueryParams,
} from './task.schema';

export {
  projectStatsSchema,
  taskStatsSchema,
  dashboardResponseSchema,
} from './dashboard.schema';

export type {
  ProjectStats,
  TaskStats,
  DashboardResponse,
} from './dashboard.schema';
