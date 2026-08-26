# Skill: Create Playwright E2E Test

## Purpose
Write a Playwright end-to-end test for a user flow using page object pattern, API seeding for test isolation, and assertions for expected outcomes.

## Input Required
- User flow to test (from PRD section 28)
- Pages involved and their URLs
- Actions the user takes (clicks, form fills, drags)
- Expected outcomes (visible text, navigation, data persistence)
- Test data to seed via API

## Steps

### 1. Page Object
```typescript
// e2e/fixtures/projects-page.ts
import { Page, Locator, expect } from '@playwright/test';

export class ProjectsPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly projectCards: Locator;
  readonly nameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByRole('button', { name: /create project/i });
    this.projectCards = page.locator('[data-testid="project-card"]');
    this.nameInput = page.getByLabel(/project name/i);
    this.submitButton = page.getByRole('button', { name: /create|save/i });
  }

  async navigate() {
    await this.page.goto('/projects');
    await this.page.waitForLoadState('networkidle');
  }

  async createProject(data: { name: string; description?: string }) {
    await this.createButton.click();
    await this.nameInput.fill(data.name);
    if (data.description) {
      await this.page.getByLabel(/description/i).fill(data.description);
    }
    await this.submitButton.click();
  }

  async getProjectByName(name: string) {
    return this.page.locator(`[data-testid="project-card"]:has-text("${name}")`);
  }
}
```

### 2. API Helper for Seeding
```typescript
// e2e/fixtures/api-helper.ts
import { APIRequestContext } from '@playwright/test';

export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  async createProject(data: { name: string; description?: string }) {
    const response = await this.request.post('/api/projects', { data });
    return (await response.json()).data;
  }

  async createTask(data: { title: string; projectId: string; status: string; priority: string }) {
    const response = await this.request.post('/api/tasks', { data });
    return (await response.json()).data;
  }

  async cleanup() {
    // Delete all test data (or use a dedicated cleanup endpoint)
    const projects = await this.request.get('/api/projects');
    const { data } = await projects.json();
    for (const project of data) {
      await this.request.delete(`/api/projects/${project.id}`);
    }
  }
}
```

### 3. Test File Structure
```typescript
// e2e/tests/create-project.spec.ts
import { test, expect } from '@playwright/test';
import { ProjectsPage } from '../fixtures/projects-page';
import { ApiHelper } from '../fixtures/api-helper';

test.describe('Flow 1: Create Project', () => {
  let api: ApiHelper;

  test.beforeEach(async ({ request }) => {
    api = new ApiHelper(request);
    await api.cleanup();
  });

  test('should create a project and show it in the list', async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();

    // Verify empty state
    await expect(page.getByText(/no projects/i)).toBeVisible();

    // Create project
    await projectsPage.createProject({ name: 'Test Project' });

    // Verify success toast
    await expect(page.getByText(/created successfully/i)).toBeVisible();

    // Verify project appears in list
    const card = await projectsPage.getProjectByName('Test Project');
    await expect(card).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();

    await projectsPage.createButton.click();
    await projectsPage.submitButton.click();

    // Verify validation error
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });
});
```

### 4. Playwright Config
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Patterns

### Data Persistence Test
```typescript
test('data persists across page refresh', async ({ page }) => {
  // Create via API
  await api.createProject({ name: 'Persistent Project' });

  // Navigate and verify
  await page.goto('/projects');
  await expect(page.getByText('Persistent Project')).toBeVisible();

  // Refresh and verify again
  await page.reload();
  await expect(page.getByText('Persistent Project')).toBeVisible();
});
```

### Status Change Test
```typescript
test('changing task status updates dashboard', async ({ page }) => {
  // Seed data
  const project = await api.createProject({ name: 'Test' });
  await api.createTask({ title: 'Task 1', projectId: project.id, status: 'TODO', priority: 'HIGH' });

  // Change status
  await page.goto('/tasks');
  await page.getByText('Task 1').click();
  await page.getByLabel(/status/i).selectOption('COMPLETED');

  // Verify dashboard updates
  await page.goto('/');
  await expect(page.getByTestId('completed-tasks-count')).toContainText('1');
});
```

## Validation Checklist
- [ ] Page objects abstract selectors and actions
- [ ] API helper seeds test data
- [ ] Each test is isolated (cleanup in beforeEach)
- [ ] Tests don't depend on other tests' data
- [ ] Assertions wait for expected state (no arbitrary sleeps)
- [ ] Screenshots captured on failure
- [ ] Tests run headless in CI
- [ ] WebServer config starts the dev environment
