import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService, notDeleted } from '../../prisma/prisma.service';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  TaskQueryParams,
} from '@taskflow/shared';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new task. Validates that the referenced project exists.
   */
  async create(data: CreateTaskInput) {
    // Verify project exists and is not deleted
    const project = await this.prisma.project.findFirst({
      where: { id: data.projectId, ...notDeleted },
    });

    if (!project) {
      throw new BadRequestException({
        message: 'Validation failed',
        details: [{ field: 'projectId', message: 'Project does not exist' }],
      });
    }

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        projectId: data.projectId,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        labels: data.labels ?? [],
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return this.formatTaskResponse(task);
  }

  /**
   * Find all non-deleted tasks with search, filter, and sort.
   */
  async findAll(query: TaskQueryParams) {
    const where: Prisma.TaskWhereInput = { ...notDeleted };

    // Also exclude tasks whose project is soft-deleted
    where.project = { ...notDeleted };

    // Search by title (case-insensitive partial match)
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    // Filter by project
    if (query.projectId) {
      where.projectId = query.projectId;
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by priority
    if (query.priority) {
      where.priority = query.priority;
    }

    // Build orderBy
    const orderBy = this.buildOrderBy(query.sortBy, query.sortOrder);

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy,
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return tasks.map((task) => this.formatTaskResponse(task));
  }

  /**
   * Find a single task by ID with project info.
   */
  async findOne(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, ...notDeleted },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return this.formatTaskResponse(task);
  }

  /**
   * Update a task. Validates project exists if projectId is being changed.
   */
  async update(id: string, data: UpdateTaskInput) {
    // Check task exists
    const existing = await this.prisma.task.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    // If changing project, validate new project exists
    if (data.projectId && data.projectId !== existing.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: data.projectId, ...notDeleted },
      });

      if (!project) {
        throw new BadRequestException({
          message: 'Validation failed',
          details: [{ field: 'projectId', message: 'Project does not exist' }],
        });
      }
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.labels !== undefined && { labels: data.labels }),
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return this.formatTaskResponse(task);
  }

  /**
   * Update only the status of a task (used by Kanban board).
   */
  async updateStatus(id: string, data: UpdateTaskStatusInput) {
    const existing = await this.prisma.task.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: { status: data.status },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return this.formatTaskResponse(task);
  }

  /**
   * Soft delete a task.
   */
  async remove(id: string) {
    const existing = await this.prisma.task.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    await this.prisma.softDelete('task', id);

    return { id, deleted: true };
  }

  /**
   * Build Prisma orderBy from sort params.
   * Priority sorting maps to enum order: HIGH > MEDIUM > LOW.
   */
  private buildOrderBy(
    sortBy?: string,
    sortOrder?: string,
  ): Prisma.TaskOrderByWithRelationInput {
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    switch (sortBy) {
      case 'updatedAt':
        return { updatedAt: order };
      case 'dueDate':
        // Null due dates should appear last
        return { dueDate: { sort: order, nulls: 'last' } };
      case 'priority':
        return { priority: order };
      case 'createdAt':
      default:
        return { createdAt: order };
    }
  }

  /**
   * Format a task record into the API response shape.
   */
  private formatTaskResponse(task: {
    id: string;
    title: string;
    description: string | null;
    projectId: string;
    status: string;
    priority: string;
    dueDate: Date | null;
    labels: string[];
    createdAt: Date;
    updatedAt: Date;
    project: { id: string; name: string };
  }) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString() ?? null,
      labels: task.labels,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      project: task.project,
    };
  }
}
