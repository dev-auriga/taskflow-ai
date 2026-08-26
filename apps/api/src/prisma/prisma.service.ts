import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Soft delete a single record by setting deletedAt to now.
   */
  async softDelete(model: 'project' | 'task', id: string): Promise<void> {
    const now = new Date();
    if (model === 'project') {
      await this.project.update({
        where: { id },
        data: { deletedAt: now },
      });
    } else {
      await this.task.update({
        where: { id },
        data: { deletedAt: now },
      });
    }
  }

  /**
   * Cascade soft delete: soft-delete a project and all its associated tasks.
   * Both get the same timestamp for consistency.
   */
  async cascadeSoftDeleteProject(projectId: string): Promise<void> {
    const now = new Date();
    await this.$transaction([
      this.task.updateMany({
        where: { projectId, deletedAt: null },
        data: { deletedAt: now },
      }),
      this.project.update({
        where: { id: projectId },
        data: { deletedAt: now },
      }),
    ]);
  }
}

/**
 * Base where clause for filtering soft-deleted records.
 * Add this to every find query in service methods.
 *
 * Usage:
 *   this.prisma.project.findMany({ where: { ...notDeleted } })
 *   this.prisma.task.findMany({ where: { ...notDeleted, status: 'TODO' } })
 */
export const notDeleted = { deletedAt: null } as const;
