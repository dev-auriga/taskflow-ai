# TaskFlow — Task Management Application

A full-stack task management application built with **Next.js**, **NestJS**, and **PostgreSQL** in a **Turborepo** monorepo. Manage projects, organize tasks, track progress via dashboard and Kanban board, and persist all data in a relational database.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TanStack Query, React Hook Form, dnd-kit, Tailwind CSS, shadcn/ui patterns |
| Backend | NestJS 10, Prisma ORM, PostgreSQL 16, Swagger/OpenAPI |
| Shared | Zod schemas, TypeScript types, constants (`@taskflow/shared`) |
| Monorepo | Turborepo, pnpm workspaces |
| Testing | Vitest (unit), Playwright (E2E) |
| Infrastructure | Docker Compose, Husky, lint-staged, conventional commits |
| Dev Tooling | ESLint 9 (flat config), Prettier, commitlint |

---

## Architecture

```
Frontend (Next.js :3000)
    ↓ REST API calls
Backend (NestJS :3001)
    ↓ Prisma ORM
Database (PostgreSQL :5434)
```

### Monorepo Structure

```
taskflow/
├── apps/
│   ├── web/                    # Next.js frontend (App Router)
│   │   ├── src/app/            # Pages (Dashboard, Projects, Tasks, Board)
│   │   ├── src/components/     # UI components (shadcn/ui patterns)
│   │   ├── src/lib/            # API client, providers, utilities
│   │   ├── e2e/                # Playwright E2E tests
│   │   └── playwright.config.ts
│   └── api/                    # NestJS backend
│       ├── src/modules/        # Feature modules (projects, tasks, dashboard)
│       ├── src/common/         # Pipes, filters, interceptors
│       ├── src/prisma/         # PrismaService + soft delete helpers
│       └── prisma/             # Schema, migrations, seed
├── packages/
│   └── shared/                 # Shared Zod schemas, types, constants
├── docker/                     # Docker configs (dev + production)
├── postman/                    # Generated OpenAPI spec
├── .kiro/                      # Kiro AI artifacts (steering, skills, hooks)
└── .husky/                     # Git hooks
```

---

## Features

### Core Functionality
- **Projects**: Create, view, edit, soft-delete (with cascade to tasks)
- **Tasks**: Full CRUD with title, description, project, status, priority, due date, labels
- **Dashboard**: Project/task statistics, recent tasks, upcoming tasks, analytics charts
- **Kanban Board**: Drag-and-drop between To Do / In Progress / Completed columns
- **Task List**: Search by title, filter by project/status/priority, sort by date/priority
- **Soft Delete**: Records marked with `deletedAt` timestamp, never hard-deleted

### UX Features
- Dark mode (neutral dark theme with emerald accent)
- Responsive layout (desktop sidebar, mobile hamburger drawer)
- Loading skeletons for every page
- Error boundaries with retry buttons
- Empty states with call-to-action buttons
- Toast notifications (top-right) for all mutations
- Confirmation dialogs for destructive actions
- URL-based filter state (shareable/bookmarkable)
- Inline status change on task details (no save button needed)
- Optimistic updates on Kanban drag-and-drop

### Backend Features
- Zod validation (shared schemas used by both frontend and backend)
- Standard response envelope: `{ data, meta: { timestamp } }`
- Consistent error format: `{ error: { statusCode, message, details? } }`
- Swagger/OpenAPI docs at `/api/docs`
- Soft delete with cascade (project → tasks)
- Search, filter, sort via query parameters
- UUID primary keys, automatic timestamps

---

## Quick Start

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Docker** (for PostgreSQL)

### First-Time Setup

```bash
# Clone and enter the project
cd ai-adoption-workshop

# Run the full setup (install deps, start DB, migrate, seed)
pnpm setup
```

This does:
1. `pnpm install` — installs all dependencies
2. `pnpm db:start` — starts PostgreSQL in Docker (port 5434)
3. `pnpm db:generate` — generates Prisma client
4. `pnpm db:migrate` — applies database migrations
5. `pnpm db:seed` — seeds 3 projects + 18 tasks

### Start Development

```bash
# Start all services (DB must be running)
pnpm dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs

### Verify Everything Works

```bash
pnpm doctor
```

---

## Scripts Reference

### Development

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps concurrently (API + Web) |
| `pnpm dev:api` | Start only the NestJS API |
| `pnpm dev:web` | Start only the Next.js frontend |

### Build

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages |
| `pnpm build:api` | Build only the API |
| `pnpm build:web` | Build only the frontend |
| `pnpm build:shared` | Build the shared package |

### Code Quality

| Script | Description |
|--------|-------------|
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | TypeScript type-check all packages |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without fixing |

### Testing

| Script | Description |
|--------|-------------|
| `pnpm test` | Run all unit tests |
| `pnpm test:shared` | Run shared package schema tests |
| `pnpm test:api` | Run API unit tests |
| `pnpm test:web` | Run frontend unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests (headless) |
| `pnpm test:e2e:headed` | Run E2E tests with visible browser |

### Database

| Script | Description |
|--------|-------------|
| `pnpm db:start` | Start PostgreSQL container |
| `pnpm db:stop` | Stop PostgreSQL container |
| `pnpm db:restart` | Restart PostgreSQL |
| `pnpm db:migrate` | Run pending Prisma migrations |
| `pnpm db:migrate:reset` | Reset DB and re-run all migrations |
| `pnpm db:seed` | Seed database with demo data |
| `pnpm db:studio` | Open Prisma Studio (visual DB editor) |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:push` | Push schema changes without migration |

### Infrastructure

| Script | Description |
|--------|-------------|
| `pnpm infra:up` | Start all infrastructure (DB) |
| `pnpm infra:down` | Stop all infrastructure |
| `pnpm infra:status` | Show running TaskFlow containers |
| `pnpm infra:logs` | Tail PostgreSQL container logs |

### Docker (Production)

| Script | Description |
|--------|-------------|
| `pnpm docker:dev` | Start dev DB container |
| `pnpm docker:prod` | Build & start full stack in containers |
| `pnpm docker:prod:down` | Stop production containers |
| `pnpm docker:prod:logs` | Tail production container logs |

### Setup & Maintenance

| Script | Description |
|--------|-------------|
| `pnpm setup` | Full first-time setup (install + DB + migrate + seed) |
| `pnpm setup:clean` | Wipe DB volume and re-setup from scratch |
| `pnpm doctor` | Health check (tools, DB, types, ports) |
| `pnpm clean` | Remove all node_modules and build outputs |
| `pnpm clean:turbo` | Remove Turbo cache |
| `pnpm reset` | Clean + reinstall dependencies |

### Services

| Script | Description |
|--------|-------------|
| `pnpm services:start` | Start DB and show connection info |
| `pnpm services:stop` | Stop all services |
| `pnpm services:status` | Show running containers + ports in use |

### OpenAPI / Postman

| Script | Description |
|--------|-------------|
| `pnpm generate:openapi` | Generate OpenAPI spec → `postman/openapi.json` |

---

## API Endpoints

Base URL: `http://localhost:3001`

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List all projects (with task counts) |
| GET | `/api/projects/:id` | Get project details (with tasks) |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Soft-delete project (+ cascade tasks) |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks (search, filter, sort) |
| GET | `/api/tasks/:id` | Get task details |
| PATCH | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Update task status only |
| DELETE | `/api/tasks/:id` | Soft-delete task |

**Query Parameters** for `GET /api/tasks`:
- `search` — partial title match (case-insensitive)
- `projectId` — filter by project UUID
- `status` — `TODO`, `IN_PROGRESS`, `COMPLETED`
- `priority` — `LOW`, `MEDIUM`, `HIGH`
- `sortBy` — `createdAt`, `updatedAt`, `dueDate`, `priority`
- `sortOrder` — `asc`, `desc`

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Stats, recent tasks, upcoming tasks |

---

## Data Model

### Project
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | auto | Primary key |
| name | string(255) | yes | Project name |
| description | text | no | Project description |
| status | enum | yes | ACTIVE, COMPLETED, ARCHIVED |
| createdAt | datetime | auto | Creation timestamp |
| updatedAt | datetime | auto | Last update timestamp |
| deletedAt | datetime | auto | Soft-delete timestamp (null = active) |

### Task
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | auto | Primary key |
| title | string(255) | yes | Task title |
| description | text | no | Detailed description |
| projectId | UUID (FK) | yes | Belongs to a project |
| status | enum | yes | TODO, IN_PROGRESS, COMPLETED |
| priority | enum | yes | LOW, MEDIUM, HIGH |
| dueDate | datetime | no | Due date |
| labels | string[] | no | Tags/labels (max 10) |
| createdAt | datetime | auto | Creation timestamp |
| updatedAt | datetime | auto | Last update timestamp |
| deletedAt | datetime | auto | Soft-delete timestamp |

---

## Environment Variables

Copy `.env.example` to `.env` and adjust if needed:

```env
# Database (PostgreSQL via Docker)
DATABASE_URL=postgresql://taskflow:taskflow@localhost:5434/taskflow?schema=public

# API
API_PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Kiro AI Artifacts

This project includes `.kiro/` configuration for AI-assisted development:

- **Steering files** (6): Coding standards, API conventions, component patterns, database conventions, monorepo structure, testing standards
- **Skills** (7): Reusable templates for creating NestJS modules, Next.js pages, forms, filtered lists, schemas, Kanban columns, E2E tests
- **Hooks** (5): Automated checks on schema changes, Prisma updates, new endpoints, component creation, OpenAPI regeneration

---

## Deployment

### Production Docker (recommended)

```bash
# Build and start all containers
pnpm docker:prod

# Access:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
# - Swagger: http://localhost:3001/api/docs
```

The production Docker setup includes:
- PostgreSQL 16 with persistent volume
- NestJS API (multi-stage build, ~100MB image)
- Next.js frontend (standalone output, ~150MB image)
- Health checks and dependency ordering
- Internal network for service communication

### Manual Deployment

1. Build: `pnpm build`
2. Start API: `cd apps/api && node dist/main.js`
3. Start Web: `cd apps/web && npx next start`

Ensure `DATABASE_URL` and `NEXT_PUBLIC_API_URL` environment variables are configured for your environment.

---

## Contributing

### Git Workflow

- Conventional commits enforced: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Pre-commit: ESLint + Prettier via lint-staged
- Pre-push: TypeScript type-check across all workspaces
- Branch from `main`, create PRs for review

### Adding a New Feature

1. Define Zod schema in `packages/shared/src/schemas/`
2. Create NestJS module in `apps/api/src/modules/`
3. Create Next.js page in `apps/web/src/app/`
4. Add E2E test in `apps/web/e2e/tests/`
5. Run `pnpm typecheck && pnpm test` before committing

---

## License

Private project — not licensed for redistribution.
