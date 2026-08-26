# Skill: Create Shared Zod Schema

## Purpose
Add a new Zod schema to `packages/shared` with proper type inference, barrel exports, and documentation for use in both frontend (React Hook Form) and backend (NestJS validation pipe).

## Input Required
- Resource name: e.g., "project", "task"
- Fields with types and validation rules
- Which fields are required vs optional
- Valid enum values for constrained fields
- Related resources (for foreign key references)

## Steps

### 1. Define Constants (if new enums)
```typescript
// packages/shared/src/constants/{resource}-status.ts

export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_STATUS_OPTIONS = [
  { value: PROJECT_STATUS.ACTIVE, label: 'Active' },
  { value: PROJECT_STATUS.COMPLETED, label: 'Completed' },
  { value: PROJECT_STATUS.ARCHIVED, label: 'Archived' },
] as const;
```

### 2. Define Zod Schema
```typescript
// packages/shared/src/schemas/{resource}.schema.ts

import { z } from 'zod';
import { PROJECT_STATUS } from '../constants';

// Base schema (all fields including server-generated)
export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED, PROJECT_STATUS.ARCHIVED]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create schema (what the client sends to create)
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  status: z.enum([PROJECT_STATUS.ACTIVE, PROJECT_STATUS.COMPLETED, PROJECT_STATUS.ARCHIVED]).default(PROJECT_STATUS.ACTIVE),
});

// Update schema (partial, all optional)
export const updateProjectSchema = createProjectSchema.partial();

// Response schema (what the API returns — excludes deletedAt)
export const projectResponseSchema = projectSchema;
```

### 3. Infer TypeScript Types
```typescript
// In the same schema file or in types/
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

### 4. Update Barrel Exports
```typescript
// packages/shared/src/schemas/index.ts
export * from './project.schema';
export * from './task.schema';

// packages/shared/src/constants/index.ts
export * from './status';

// packages/shared/src/index.ts
export * from './schemas';
export * from './types';
export * from './constants';
```

### 5. Usage in NestJS (Backend)
```typescript
import { createProjectSchema } from '@taskflow/shared';

@Post()
async create(@Body(new ZodValidationPipe(createProjectSchema)) dto: CreateProjectInput) {
  return this.projectsService.create(dto);
}
```

### 6. Usage in Next.js (Frontend)
```typescript
import { createProjectSchema, type CreateProjectInput } from '@taskflow/shared';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<CreateProjectInput>({
  resolver: zodResolver(createProjectSchema),
});
```

## Validation Checklist
- [ ] Schema file created in `packages/shared/src/schemas/`
- [ ] Constants defined for enum values
- [ ] TypeScript types inferred from schemas
- [ ] Barrel exports updated (schemas/index.ts, constants/index.ts, root index.ts)
- [ ] Create schema has sensible defaults
- [ ] Update schema uses `.partial()`
- [ ] Response schema excludes `deletedAt`
- [ ] Validation messages are user-friendly
- [ ] Schema compiles without errors in both apps
