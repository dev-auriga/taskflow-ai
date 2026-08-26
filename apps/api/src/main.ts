import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — allow Next.js frontend
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global exception filter — consistent error response format
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor — wraps responses in { data, meta } envelope
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('Task Management Application API — CRUD for projects and tasks')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoint')
    .addTag('projects', 'Project management endpoints')
    .addTag('tasks', 'Task management endpoints')
    .addTag('dashboard', 'Dashboard statistics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.warn(`API running on http://localhost:${port}`);
  console.warn(`Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
