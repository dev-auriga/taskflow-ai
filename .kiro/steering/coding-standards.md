---
inclusion: auto
---

# Coding Standards — TaskFlow

## TypeScript Configuration

- Use TypeScript strict mode (`"strict": true`) in all packages
- Never use `any` type — use `unknown` with type guards or proper generics
- Prefer `const` over `let`; never use `var`
- Use explicit return types on all exported functions
- Enable `noUncheckedIndexedAccess` for safer array/object access

## File Naming

- All files use **kebab-case**: `project-list.tsx`, `create-task.dto.ts`, `prisma.service.ts`
- React components: `kebab-case.tsx` (e.g., `task-card.tsx`, `project-form.tsx`)
- NestJS files follow NestJS convention: `projects.controller.ts`, `projects.service.ts`, `projects.module.ts`
- Test files: co-located with source, named `*.spec.ts` (NestJS/backend) or `*.test.tsx` (frontend)
- Barrel exports: each module/feature folder has an `index.ts`

## Import Ordering

Imports should be ordered (enforced by ESLint):
1. Node built-ins (`path`, `fs`)
2. External packages (`@nestjs/*`, `react`, `next/*`)
3. Internal packages (`@taskflow/shared`)
4. Relative imports (parent `../` before sibling `./`)
5. Type imports last (`import type { ... }`)

## Code Style

- Max line length: 100 characters (Prettier)
- Use single quotes for strings
- Use trailing commas (ES5)
- Use semicolons
- Arrow functions for callbacks and functional components
- Named exports over default exports (except Next.js pages which require default)
- Destructure props in function parameters
- Prefer early returns over nested conditionals

## Monorepo Package Aliases

- `@taskflow/shared` — shared Zod schemas, types, constants
- `@taskflow/web` — Next.js frontend app
- `@taskflow/api` — NestJS backend app

## Error Handling

- Never swallow errors silently
- Use typed error classes in NestJS (extend `HttpException`)
- Frontend: use error boundaries + TanStack Query error handling
- Log errors with context (what operation failed, what input caused it)

## Comments

- Use JSDoc for exported functions/classes
- Inline comments only for non-obvious logic
- TODO comments must include a ticket/issue reference or description
