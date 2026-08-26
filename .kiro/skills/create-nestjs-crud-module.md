# Skill: Create NestJS CRUD Module

## Purpose
Scaffold a complete NestJS feature module with CRUD operations, Swagger documentation, Zod validation, Prisma integration, and soft delete support.

## Input Required
- Resource name (singular): e.g., "project", "task"
- Zod schemas from `@taskflow/shared`: create, update, response schemas
- Prisma model name
- Whether cascade soft delete is needed
- Related resources to include (e.g., task counts for projects)

## Steps

### 1. Create Module Directory
```
apps/api/src/modules/{resource}/
├── {resource}.module.ts
├── {resource}.controller.ts
├── {resource}.service.ts
├── dto/
│   ├── create-{resource}.dto.ts
│   └── update-{resource}.dto.ts
└── {resource}.controller.spec.ts
```

### 2. Module File
```typescript
import { Module } from '@nestjs/common';
import { {Resource}Controller } from './{resource}.controller';
import { {Resource}Service } from './{resource}.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [{Resource}Controller],
  providers: [{Resource}Service],
  exports: [{Resource}Service],
})
export class {Resource}Module {}
```

### 3. Controller
- Decorate class with `@ApiTags('{resources}')`
- Implement: create, findAll, findOne, update, remove
- Each method has:
  - `@ApiOperation({ summary: '...' })`
  - `@ApiResponse()` for success and error cases
  - `@Body(new ZodValidationPipe(schema))` for validation
  - `@Param('id', ParseUUIDPipe)` for ID params
- Return data directly — TransformInterceptor wraps in envelope

### 4. Service
- Inject PrismaService
- All queries filter `deletedAt: null` (middleware handles this)
- Delete operation: `update({ where: { id }, data: { deletedAt: new Date() } })`
- Cascade delete: also update related records' `deletedAt`
- Include related data where needed (e.g., `include: { tasks: true }`)
- Throw `NotFoundException` when record not found

### 5. DTOs
Import from `@taskflow/shared` and re-export for type inference:
```typescript
import { createProjectSchema } from '@taskflow/shared';
export type CreateProjectDto = z.infer<typeof createProjectSchema>;
```

### 6. Integration Tests
- Use `@nestjs/testing` Test module
- Set up test database or mock Prisma
- Test each endpoint: happy path + validation + not found + soft delete

## Validation Checklist
- [ ] Module registered in AppModule
- [ ] All endpoints have Swagger decorators
- [ ] Zod validation pipe on all body/query inputs
- [ ] Soft delete instead of hard delete
- [ ] Cascade soft delete if applicable
- [ ] NotFoundException for missing resources
- [ ] Integration tests for all endpoints
