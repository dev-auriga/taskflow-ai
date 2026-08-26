import { test, expect } from '@playwright/test';
import { ApiHelper } from '../fixtures/api-helper';

let api: ApiHelper;

test.beforeAll(async ({ request }) => {
  api = new ApiHelper(request);
});

test.beforeEach(async ({ request }) => {
  api = new ApiHelper(request);
  await api.cleanup();
});

/**
 * Flow 1 — Create Project
 * Projects → Create Project → Enter info → Submit → Project appears in list
 */
test.describe('Flow 1: Create Project', () => {
  test('should create a project and show it in the list', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    // Click "New Project"
    await page.click('button:has-text("New Project")');

    // Fill form
    await page.fill('input#name', 'E2E Test Project');
    await page.fill('textarea#description', 'Created by Playwright');

    // Submit
    await page.click('button:has-text("Create Project")');

    // Verify project appears
    await expect(page.locator('text=E2E Test Project')).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/projects');
    await page.click('button:has-text("New Project")');

    // Submit without filling name
    await page.click('button:has-text("Create Project")');

    // Should show validation error
    await expect(page.locator('text=Project name is required')).toBeVisible();
  });
});

/**
 * Flow 2 — Create Task
 * Project → Create Task → Enter info → Submit → Task appears in views
 */
test.describe('Flow 2: Create Task', () => {
  test('should create a task and show it in the task list', async ({ page }) => {
    // Seed a project
    const project = await api.createProject({ name: 'Task Flow Project' });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Click "New Task"
    await page.click('button:has-text("New Task")');

    // Fill form
    await page.fill('input#title', 'E2E Test Task');
    await page.selectOption('select#projectId', project.id);
    await page.selectOption('select#status', 'TODO');
    await page.selectOption('select#priority', 'HIGH');

    // Submit
    await page.click('button:has-text("Create Task")');

    // Verify task appears in list
    await expect(page.locator('text=E2E Test Task')).toBeVisible({ timeout: 5000 });
  });
});

/**
 * Flow 3 — Update Task
 * Task → Open → Edit → Change info → Save → Updated info displayed
 */
test.describe('Flow 3: Update Task', () => {
  test('should update a task title', async ({ page }) => {
    const project = await api.createProject({ name: 'Update Project' });
    const task = await api.createTask({ title: 'Original Title', projectId: project.id });

    await page.goto(`/tasks/${task.id}`);
    await page.waitForLoadState('networkidle');

    // Click Edit
    await page.click('button:has-text("Edit")');

    // Clear and update title
    await page.fill('input#title', 'Updated Title');

    // Submit
    await page.click('button:has-text("Update Task")');

    // Verify updated title
    await expect(page.locator('h1:has-text("Updated Title")')).toBeVisible({ timeout: 5000 });
  });
});

/**
 * Flow 4 — Complete Task
 * Task → Change status to Completed → Dashboard stats update
 */
test.describe('Flow 4: Complete Task', () => {
  test('should change task status to completed', async ({ page }) => {
    const project = await api.createProject({ name: 'Complete Project' });
    await api.createTask({ title: 'Task to Complete', projectId: project.id, status: 'TODO' });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Navigate to task
    await page.click('text=Task to Complete');
    await page.waitForLoadState('networkidle');

    // Change status inline
    await page.selectOption('select:near(:text("Status"))', 'COMPLETED');

    // Verify toast
    await expect(page.locator('text=Task status updated')).toBeVisible({ timeout: 5000 });

    // Navigate to dashboard and check
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should show 1 completed task
    await expect(page.locator('text=Completed').first()).toBeVisible();
  });
});

/**
 * Flow 5 — Search and Filter
 * Tasks → Enter search → Apply filters → Matching tasks displayed
 */
test.describe('Flow 5: Search and Filter', () => {
  test('should filter tasks by search and status', async ({ page }) => {
    const project = await api.createProject({ name: 'Filter Project' });
    await api.createTask({ title: 'Alpha Task', projectId: project.id, status: 'TODO', priority: 'HIGH' });
    await api.createTask({ title: 'Beta Task', projectId: project.id, status: 'IN_PROGRESS', priority: 'LOW' });
    await api.createTask({ title: 'Gamma Task', projectId: project.id, status: 'TODO', priority: 'HIGH' });

    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Search for "Alpha"
    await page.fill('input[placeholder="Search tasks..."]', 'Alpha');
    await page.waitForTimeout(500); // wait for debounce

    // Should show only Alpha
    await expect(page.locator('text=Alpha Task')).toBeVisible();
    await expect(page.locator('text=Beta Task')).not.toBeVisible();

    // Clear search and filter by status
    await page.fill('input[placeholder="Search tasks..."]', '');
    await page.waitForTimeout(500);
    await page.selectOption('select:nth-of-type(2)', 'TODO'); // Status filter

    // Should show TODO tasks only
    await expect(page.locator('text=Alpha Task')).toBeVisible();
    await expect(page.locator('text=Gamma Task')).toBeVisible();
    await expect(page.locator('text=Beta Task')).not.toBeVisible();
  });
});

/**
 * Flow 6 — Delete Task
 * Task → Delete → Confirmation → Confirm → Task removed
 */
test.describe('Flow 6: Delete Task', () => {
  test('should delete a task with confirmation', async ({ page }) => {
    const project = await api.createProject({ name: 'Delete Project' });
    const task = await api.createTask({ title: 'Task to Delete', projectId: project.id });

    await page.goto(`/tasks/${task.id}`);
    await page.waitForLoadState('networkidle');

    // Click Delete
    await page.click('button:has-text("Delete")');

    // Confirm in AlertDialog
    await expect(page.locator('text=Are you sure')).toBeVisible();
    await page.click('button:has-text("Delete Task")');

    // Should redirect to tasks list
    await page.waitForURL('/tasks');

    // Task should not be in the list
    await expect(page.locator('text=Task to Delete')).not.toBeVisible();
  });
});

/**
 * Flow 7 — Persistent Data
 * Create data → Refresh → Data still there
 */
test.describe('Flow 7: Data Persistence', () => {
  test('should persist data across page refresh', async ({ page }) => {
    const project = await api.createProject({ name: 'Persistent Project' });
    await api.createTask({ title: 'Persistent Task', projectId: project.id });

    // First load
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Persistent Task')).toBeVisible();

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Still there
    await expect(page.locator('text=Persistent Task')).toBeVisible();

    // Check project persists too
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Persistent Project')).toBeVisible();
  });
});
