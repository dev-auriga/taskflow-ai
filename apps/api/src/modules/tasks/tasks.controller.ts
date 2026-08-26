import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
  type TaskQueryParams,
} from '@taskflow/shared';

@ApiTags('tasks')
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'projectId'],
      properties: {
        title: { type: 'string', example: 'Implement login page' },
        description: { type: 'string', example: 'Build the login form with validation' },
        projectId: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'], default: 'TODO' },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
        dueDate: { type: 'string', format: 'date-time', nullable: true },
        labels: { type: 'array', items: { type: 'string' }, example: ['frontend', 'auth'] },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or project does not exist' })
  async create(
    @Body(new ZodValidationPipe(createTaskSchema)) dto: CreateTaskInput,
  ) {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional search, filter, and sort' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by task title' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project UUID' })
  @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'dueDate', 'priority'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of tasks matching query' })
  async findAll(
    @Query(new ZodValidationPipe(taskQuerySchema)) query: TaskQueryParams,
  ) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details with project info' })
  @ApiParam({ name: 'id', description: 'Task UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Task details' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task UUID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string', nullable: true },
        projectId: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
        dueDate: { type: 'string', format: 'date-time', nullable: true },
        labels: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) dto: UpdateTaskInput,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status (for Kanban board)' })
  @ApiParam({ name: 'id', description: 'Task UUID', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Task status updated' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTaskStatusSchema)) dto: UpdateTaskStatusInput,
  ) {
    return this.tasksService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a task' })
  @ApiParam({ name: 'id', description: 'Task UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }
}
