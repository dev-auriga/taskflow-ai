import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, notDeleted } from '../../prisma/prisma.service';
import type { CreateProjectInput, UpdateProjectInput } from '@taskflow/shared';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new project.
   */
  async create(data: CreateProjectInput) {
    const project = await this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        status: data.status,
      },
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  /**
   * Find all non-deleted projects with task counts.
   */
  async findAll() {
    const projects = await this.prisma.project.findMany({
      where: { ...notDeleted },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tasks: { where: { ...notDeleted } },
          },
        },
        tasks: {
          where: { ...notDeleted, status: 'COMPLETED' },
          select: { id: true },
        },
      },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      taskCount: project._count.tasks,
      completedTaskCount: project.tasks.length,
    }));
  }

  /**
   * Find a single project by ID with its tasks.
   */
  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ...notDeleted },
      include: {
        tasks: {
          where: { ...notDeleted },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            tasks: { where: { ...notDeleted } },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED');

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      taskCount: project._count.tasks,
      completedTaskCount: completedTasks.length,
      tasks: project.tasks.map((task) => ({
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
      })),
    };
  }

  /**
   * Update a project by ID.
   */
  async update(id: string, data: UpdateProjectInput) {
    // Check existence
    const existing = await this.prisma.project.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Soft delete a project and cascade to its tasks.
   */
  async remove(id: string) {
    const existing = await this.prisma.project.findFirst({
      where: { id, ...notDeleted },
    });

    if (!existing) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    await this.prisma.cascadeSoftDeleteProject(id);

    return { id, deleted: true };
  }
}
