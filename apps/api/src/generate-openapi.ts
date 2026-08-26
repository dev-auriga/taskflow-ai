/**
 * Script to generate OpenAPI JSON spec from NestJS Swagger module.
 * Run with: npx ts-node -r tsconfig-paths/register src/generate-openapi.ts
 *
 * Output: ../../postman/openapi.json
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('Task Management Application API — CRUD for projects and tasks')
    .setVersion('1.0')
    .addServer('http://localhost:3001', 'Local development')
    .addTag('health', 'Health check endpoint')
    .addTag('projects', 'Project management endpoints')
    .addTag('tasks', 'Task management endpoints')
    .addTag('dashboard', 'Dashboard statistics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputDir = path.resolve(__dirname, '../../../postman');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.warn(`OpenAPI spec generated at: ${outputPath}`);

  await app.close();
}

generateOpenApi().catch((err) => {
  console.error('Failed to generate OpenAPI spec:', err);
  process.exit(1);
});
