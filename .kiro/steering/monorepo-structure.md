---
inclusion: auto
---

# Monorepo Structure — TaskFlow

## Workspace Layout

```
taskflow/ (workspace root)
├── apps/
│   ├── web/                    # Next.js 14+ App Router frontend
│   └── api/                    # NestJS backend
├── packages/
│   └── shared/                 # Shared Zod schemas, types, constants
├── docker/                     # Docker configurations
│   ├── docker-compose.dev.yml  # PostgreSQL only (local dev)
│   ├── docker-compose.prod.yml # Full stack (production/CI)
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── postman/                    # Generated Postman collection
├── .kiro/                      # Kiro artifacts
├── .husky/                     # Git hooks
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # pnpm workspace definition
├── package.json                # Root package.json (scripts, devDeps)
└── .env.example                # Environment variable template
```

## Package Aliases

| Package | Alias | Path |
|---------|-------|------|
| Frontend | `@taskflow/web` | `apps/web` |
| Backend | `@taskflow/api` | `apps/api` |
| Shared | `@taskflow/shared` | `packages/shared` |

## Dependency Rules

- `@taskflow/shared` has NO dependencies on `web` or `api`
- `@taskflow/web` can depend on `@taskflow/shared`
- `@taskflow/api` can depend on `@taskflow/shared`
- `web` and `api` must NEVER depend on each other

## Turborepo Pipeline

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Development Workflow

1. Start database: `docker compose -f docker/docker-compose.dev.yml up -d`
2. Start all apps: `pnpm dev` (runs Turborepo dev pipeline)
3. Frontend: http://localhost:3000
4. Backend: http://localhost:3001
5. Swagger: http://localhost:3001/api/docs
6. Prisma Studio: `pnpm --filter @taskflow/api prisma studio`

## Root Scripts

```json
{
  "dev": "turbo run dev",
  "build": "turbo run build",
  "lint": "turbo run lint",
  "typecheck": "turbo run typecheck",
  "test": "turbo run test",
  "test:e2e": "pnpm --filter @taskflow/web test:e2e",
  "db:dev": "docker compose -f docker/docker-compose.dev.yml up -d",
  "db:stop": "docker compose -f docker/docker-compose.dev.yml down",
  "db:migrate": "pnpm --filter @taskflow/api prisma migrate dev",
  "db:seed": "pnpm --filter @taskflow/api prisma db seed",
  "db:studio": "pnpm --filter @taskflow/api prisma studio",
  "generate:openapi": "pnpm --filter @taskflow/api generate:openapi",
  "docker:dev": "docker compose -f docker/docker-compose.dev.yml up -d",
  "docker:prod": "docker compose -f docker/docker-compose.prod.yml up --build"
}
```

## Shared Package Structure

```
packages/shared/
├── src/
│   ├── schemas/
│   │   ├── project.schema.ts   # Zod schemas for project
│   │   ├── task.schema.ts      # Zod schemas for task
│   │   └── index.ts            # Barrel export
│   ├── types/
│   │   ├── api.types.ts        # ApiResponse<T>, ApiError
│   │   └── index.ts
│   ├── constants/
│   │   ├── status.ts           # ProjectStatus, TaskStatus, TaskPriority
│   │   └── index.ts
│   └── index.ts                # Main barrel export
├── tsconfig.json
└── package.json
```

## Docker Configuration

### Development (docker-compose.dev.yml)
- PostgreSQL 16 with persistent volume
- Exposed on port 5432
- Credentials: taskflow/taskflow
- Database name: taskflow

### Production (docker-compose.prod.yml)
- PostgreSQL 16 with persistent volume
- NestJS API (multi-stage build, port 3001)
- Next.js Web (standalone output, port 3000)
- Internal network for service communication
- Health checks on all services
- Environment variables via .env file

## ESLint & Prettier

- Shared ESLint config at root
- Prettier config at root: single quotes, trailing commas, semicolons, 100 char width
- Each app extends the base config with framework-specific rules
