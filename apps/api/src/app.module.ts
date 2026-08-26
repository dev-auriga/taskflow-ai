import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [PrismaModule, ProjectsModule, TasksModule, DashboardModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
