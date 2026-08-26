import { Injectable } from '@nestjs/common';
import { PrismaService, notDeleted } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get complete dashboard data: project stats, task stats, recent tasks, upcoming tasks.
   */
  async getDashboard() {
    const [projectStats, taskStats, recentTasks, upcomingTasks] = await Promise.all([
      this.getProjectStats(),
      this.getTaskStats(),
      this.getRecentTasks(),
      this.getUpcomingTasks(),
    ]);

    return {
      projectStats,
      taskStats,
      recentTasks,
      upcomingTasks,
    };
  }

  /**
   * Count projects by status.
   */
  private async getProjectStats() {
    const [total, active, completed, archived] = await Promise.all([
      this.prisma.project.count({ where: { ...notDeleted } }),
      this.prisma.project.count({ where: { ...notDeleted, status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { ...notDeleted, status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { ...notDeleted, status: 'ARCHIVED' } }),
    ]);

    return { total, active, completed, archived };
  }

  /**
   * Count tasks by status.
   */
  private async getTaskStats() {
    const baseWhere = { ...notDeleted, project: { ...notDeleted } };

    const [total, todo, inProgress, completed] = await Promise.all([
      this.prisma.task.count({ where: baseWhere }),
      this.prisma.task.count({ where: { ...baseWhere, status: 'TODO' } }),
      this.prisma.task.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { ...baseWhere, status: 'COMPLETED' } }),
    ]);

    return { total, todo, inProgress, completed };
  }

  /**
   * Get the 10 most recently updated tasks.
   */
  private async getRecentTasks() {
    const tasks = await this.prisma.task.findMany({
      where: { ...notDeleted, project: { ...notDeleted } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return tasks.map((task) => ({
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
    }));
  }

  /**
   * Get tasks with due dates within the next 7 days, sorted by due date.
   */
  private async getUpcomingTasks() {
    const now = new Date();
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: {
        ...notDeleted,
        project: { ...notDeleted },
        dueDate: {
          gte: now,
          lte: inSevenDays,
        },
        status: { not: 'COMPLETED' },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return tasks.map((task) => ({
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
    }));
  }
}
