---
inclusion: auto
---

# Database Conventions — TaskFlow

## Prisma Schema Naming

- Models: **PascalCase** (`Project`, `Task`)
- Fields: **camelCase** (`createdAt`, `projectId`, `dueDate`)
- Enums: **PascalCase** for enum name, **UPPER_SNAKE_CASE** for values
- Relations: named explicitly for clarity

## Primary Keys

- All models use UUID as primary key
- Generated via `@default(uuid())` in Prisma
- Field name: `id`

## Timestamps

Every model includes:
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
```

- `createdAt`: auto-set on creation, never modified
- `updatedAt`: auto-updated by Prisma on any change
- `deletedAt`: null = active, timestamp = soft-deleted

## Soft Delete Strategy

### Implementation

- All "delete" operations set `deletedAt = new Date()` instead of removing rows
- All read queries filter `WHERE deletedAt IS NULL` via Prisma middleware
- Soft-deleted records remain in the database for potential recovery

### Prisma Middleware for Soft Delete

```typescript
// Intercept findMany, findFirst, findUnique, count
// Automatically add: where: { deletedAt: null }
// This ensures deleted records are never returned unless explicitly queried
```

### Cascade Soft Delete

When a **Project** is soft-deleted:
1. Set `deletedAt` on the Project record
2. Set `deletedAt` on ALL Tasks belonging to that project (same timestamp)
3. Both disappear from all queries simultaneously

This is handled at the **service layer** (not database triggers) for explicit control.

### Querying Deleted Records (Admin/Debug only)

For debugging or future "trash" feature:
```typescript
// Bypass middleware by using raw query or a flag
prisma.project.findMany({ where: { deletedAt: { not: null } } })
```

## Relationships

```
Project (1) ──→ (many) Task
```

- A Project has many Tasks (`tasks Task[]`)
- A Task belongs to one Project (`project Project @relation(fields: [projectId], references: [id])`)
- Foreign key: `projectId` on Task table
- Database-level: `onDelete: Cascade` as safety net (but app uses soft delete)

## Enums

```prisma
enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}
```

## Indexes

- `Task.projectId` — indexed for fast project-based queries
- `Task.status` — indexed for Kanban board grouping
- `Task.priority` — indexed for filtering
- `Task.dueDate` — indexed for upcoming tasks query
- `Task.deletedAt` — indexed for soft delete filtering
- `Project.deletedAt` — indexed for soft delete filtering

## Seed Data

The seed script creates:
- 3 projects (1 Active, 1 Completed, 1 Active)
- 5-10 tasks per project with varied statuses, priorities, and due dates
- Some tasks with labels, some without
- Realistic project/task names for demo purposes

## Migration Naming

Migrations follow: `YYYYMMDDHHMMSS_description`
- Example: `20240101000000_initial_schema`
- Keep migrations atomic — one logical change per migration

## Environment Variables

```
DATABASE_URL=postgresql://taskflow:taskflow@localhost:5432/taskflow?schema=public
```

- Dev: points to Docker PostgreSQL container
- Prod: points to production PostgreSQL
- Never commit `.env` — use `.env.example` as template
