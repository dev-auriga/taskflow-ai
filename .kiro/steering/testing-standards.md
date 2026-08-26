---
inclusion: auto
---

# Testing Standards — TaskFlow

## Testing Tools by Layer

| Layer | Tool | Config File |
|-------|------|-------------|
| Backend (NestJS) | Jest | `apps/api/jest.config.ts` |
| Frontend (Next.js) | Vitest | `apps/web/vitest.config.ts` |
| Shared package | Vitest | `packages/shared/vitest.config.ts` |
| E2E | Playwright | `apps/web/playwright.config.ts` |

## File Naming

- Backend tests: `*.spec.ts` (co-located with source)
- Frontend tests: `*.test.tsx` or `*.test.ts` (co-located)
- E2E tests: `apps/web/e2e/tests/*.spec.ts`
- Test fixtures: `__fixtures__/` directory

## What to Test — Backend (NestJS)

### Controllers (Integration Tests)
- Test each endpoint with supertest
- Test happy path (valid input → correct response)
- Test validation errors (missing/invalid fields → 400)
- Test not found (invalid ID → 404)
- Test soft delete behavior
- Test cascade soft delete (project → tasks)
- Test query parameters (search, filter, sort)

### Services (Unit Tests)
- Test business logic in isolation
- Mock PrismaService
- Test soft delete logic
- Test cascade behavior
- Test edge cases (empty results, invalid references)

### Test Structure
```typescript
describe('ProjectsController', () => {
  describe('POST /api/projects', () => {
    it('should create a project with valid data', async () => { ... });
    it('should return 400 when name is missing', async () => { ... });
    it('should return 400 when status is invalid', async () => { ... });
  });

  describe('GET /api/projects', () => {
    it('should return all non-deleted projects', async () => { ... });
    it('should include task counts', async () => { ... });
    it('should not return soft-deleted projects', async () => { ... });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should soft delete the project', async () => { ... });
    it('should cascade soft delete to tasks', async () => { ... });
    it('should return 404 for non-existent project', async () => { ... });
  });
});
```

## What to Test — Frontend (Vitest)

### Components
- Renders correctly with props
- User interactions trigger expected callbacks
- Form validation displays errors
- Loading/error/empty states render correctly
- Conditional rendering based on data

### Hooks
- Returns correct data structure
- Handles loading/error states
- Mutations trigger cache invalidation

### Utils
- Pure functions with various inputs
- Edge cases and boundary values

## What to Test — E2E (Playwright)

### User Flows (PRD Section 28)
1. Create Project flow
2. Create Task flow
3. Update Task flow
4. Complete Task (status change → dashboard update)
5. Search and Filter flow
6. Delete Task with confirmation
7. Data persistence across refresh

### E2E Test Structure
```typescript
// Page Object Pattern
class ProjectsPage {
  constructor(private page: Page) {}

  async navigate() { ... }
  async createProject(data: CreateProjectInput) { ... }
  async getProjectCards() { ... }
}

// Test
test('Flow 1: Create Project', async ({ page }) => {
  const projectsPage = new ProjectsPage(page);
  await projectsPage.navigate();
  await projectsPage.createProject({ name: 'Test Project' });
  await expect(projectsPage.getProjectCards()).toContainText('Test Project');
});
```

### E2E Test Isolation
- Each test seeds its own data via API calls in `beforeEach`
- Each test cleans up (or uses separate DB transactions)
- Tests run in parallel where possible
- Use `test.describe.serial` for flows that depend on order

## Test Commands

```bash
# Run all tests
pnpm test

# Backend tests
pnpm --filter @taskflow/api test
pnpm --filter @taskflow/api test:watch
pnpm --filter @taskflow/api test:cov

# Frontend tests
pnpm --filter @taskflow/web test
pnpm --filter @taskflow/web test:watch

# Shared package tests
pnpm --filter @taskflow/shared test

# E2E tests (requires dev server running)
pnpm test:e2e
pnpm --filter @taskflow/web test:e2e --headed  # Visual mode
```

## Coverage Requirements

- Backend services: aim for 80%+ coverage
- Backend controllers: integration test all endpoints
- Frontend components: test interactive behavior, not implementation details
- E2E: cover all 7 required user flows

## Mocking

- Backend: mock PrismaService with `jest.mock()` or manual mocks
- Frontend: mock API calls with MSW (Mock Service Worker) or TanStack Query test utils
- E2E: no mocks — test against real backend + database (seeded)
