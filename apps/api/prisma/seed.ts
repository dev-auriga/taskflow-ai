import { PrismaClient, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.warn('Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  // Create Projects
  const websiteRedesign = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description:
        'Complete overhaul of the company website with modern design, improved UX, and mobile-first approach.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const mobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description:
        'Native mobile application for iOS and Android with offline capabilities and push notifications.',
      status: ProjectStatus.ACTIVE,
    },
  });

  const apiMigration = await prisma.project.create({
    data: {
      name: 'API Migration v2',
      description:
        'Migrate legacy REST API to new architecture with improved performance and documentation.',
      status: ProjectStatus.COMPLETED,
    },
  });

  // Create Tasks for Website Redesign
  const now = new Date();
  const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const inOneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: 'Design new homepage layout',
        description: 'Create wireframes and high-fidelity mockups for the new homepage.',
        projectId: websiteRedesign.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: inTwoDays,
        labels: ['design', 'homepage'],
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build mobile-friendly navigation with hamburger menu and smooth transitions.',
        projectId: websiteRedesign.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: inFiveDays,
        labels: ['frontend', 'responsive'],
      },
      {
        title: 'Set up analytics tracking',
        description: 'Integrate Google Analytics 4 and set up custom events for user interactions.',
        projectId: websiteRedesign.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: inTwoWeeks,
        labels: ['analytics'],
      },
      {
        title: 'Optimize image loading',
        description: 'Implement lazy loading and WebP format with proper fallbacks.',
        projectId: websiteRedesign.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: inOneWeek,
        labels: ['performance', 'frontend'],
      },
      {
        title: 'Create contact form',
        description: 'Build accessible contact form with validation and email notifications.',
        projectId: websiteRedesign.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        labels: ['frontend', 'forms'],
      },
      {
        title: 'SEO audit and improvements',
        description: 'Run SEO audit, fix meta tags, add structured data, improve page speed.',
        projectId: websiteRedesign.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: inTwoWeeks,
        labels: ['seo'],
      },
    ],
  });

  // Create Tasks for Mobile App
  await prisma.task.createMany({
    data: [
      {
        title: 'Set up React Native project',
        description: 'Initialize project with TypeScript, ESLint, and navigation library.',
        projectId: mobileApp.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        labels: ['setup', 'infrastructure'],
      },
      {
        title: 'Implement authentication flow',
        description: 'Build login, register, and password reset screens with biometric support.',
        projectId: mobileApp.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: inTwoDays,
        labels: ['auth', 'security'],
      },
      {
        title: 'Build offline data sync',
        description: 'Implement local storage with background sync when connectivity returns.',
        projectId: mobileApp.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: inOneWeek,
        labels: ['offline', 'sync'],
      },
      {
        title: 'Push notification integration',
        description: 'Set up Firebase Cloud Messaging for both iOS and Android.',
        projectId: mobileApp.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: inFiveDays,
        labels: ['notifications'],
      },
      {
        title: 'Design app icon and splash screen',
        description: 'Create app icon in all required sizes and animated splash screen.',
        projectId: mobileApp.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: inTwoWeeks,
        labels: ['design'],
      },
      {
        title: 'Write unit tests for core modules',
        description: 'Test authentication, data sync, and API client modules.',
        projectId: mobileApp.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        labels: ['testing'],
      },
      {
        title: 'App Store submission preparation',
        description: 'Prepare screenshots, descriptions, and metadata for store listings.',
        projectId: mobileApp.id,
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: inTwoWeeks,
        labels: ['release'],
      },
    ],
  });

  // Create Tasks for API Migration (mostly completed)
  await prisma.task.createMany({
    data: [
      {
        title: 'Document new API endpoints',
        description: 'Generate OpenAPI spec and update developer documentation.',
        projectId: apiMigration.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        labels: ['documentation'],
      },
      {
        title: 'Migrate user endpoints',
        description: 'Port user CRUD operations to new architecture with validation.',
        projectId: apiMigration.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        labels: ['migration', 'users'],
      },
      {
        title: 'Migrate payment endpoints',
        description: 'Port payment processing endpoints with proper error handling.',
        projectId: apiMigration.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        labels: ['migration', 'payments'],
      },
      {
        title: 'Performance benchmarks',
        description: 'Run load tests comparing old vs new API response times.',
        projectId: apiMigration.id,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        labels: ['performance', 'testing'],
      },
      {
        title: 'Deprecation notices for v1',
        description: 'Add deprecation headers and update client documentation.',
        projectId: apiMigration.id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.LOW,
        dueDate: yesterday,
        labels: ['documentation', 'deprecation'],
      },
    ],
  });

  const projectCount = await prisma.project.count();
  const taskCount = await prisma.task.count();

  console.warn(`Seeding complete: ${projectCount} projects, ${taskCount} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
