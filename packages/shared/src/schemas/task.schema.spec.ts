import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskStatusSchema, taskQuerySchema } from './task.schema';

describe('createTaskSchema', () => {
  const validTask = {
    title: 'My Task',
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'TODO',
    priority: 'MEDIUM',
  };

  it('should validate a valid task with required fields', () => {
    const result = createTaskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My Task');
      expect(result.data.projectId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.data.labels).toEqual([]); // default
    }
  });

  it('should validate a task with all optional fields', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      description: 'A detailed description',
      dueDate: '2025-03-01T00:00:00.000Z',
      labels: ['frontend', 'urgent'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('A detailed description');
      expect(result.data.labels).toEqual(['frontend', 'urgent']);
    }
  });

  it('should apply defaults for status and priority', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test',
      projectId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('TODO');
      expect(result.data.priority).toBe('MEDIUM');
    }
  });

  it('should fail when title is empty', () => {
    const result = createTaskSchema.safeParse({ ...validTask, title: '' });
    expect(result.success).toBe(false);
  });

  it('should fail when projectId is not a valid UUID', () => {
    const result = createTaskSchema.safeParse({ ...validTask, projectId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('should fail with invalid status', () => {
    const result = createTaskSchema.safeParse({ ...validTask, status: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should fail with invalid priority', () => {
    const result = createTaskSchema.safeParse({ ...validTask, priority: 'CRITICAL' });
    expect(result.success).toBe(false);
  });

  it('should reject more than 10 labels', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      labels: Array.from({ length: 11 }, (_, i) => `label-${i}`),
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid statuses', () => {
    for (const status of ['TODO', 'IN_PROGRESS', 'COMPLETED']) {
      const result = createTaskSchema.safeParse({ ...validTask, status });
      expect(result.success).toBe(true);
    }
  });

  it('should accept all valid priorities', () => {
    for (const priority of ['LOW', 'MEDIUM', 'HIGH']) {
      const result = createTaskSchema.safeParse({ ...validTask, priority });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateTaskStatusSchema', () => {
  it('should validate a valid status', () => {
    const result = updateTaskStatusSchema.safeParse({ status: 'COMPLETED' });
    expect(result.success).toBe(true);
  });

  it('should fail with invalid status', () => {
    const result = updateTaskStatusSchema.safeParse({ status: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('should fail when status is missing', () => {
    const result = updateTaskStatusSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('taskQuerySchema', () => {
  it('should validate empty query (all optional)', () => {
    const result = taskQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortBy).toBe('createdAt'); // default
      expect(result.data.sortOrder).toBe('desc'); // default
    }
  });

  it('should validate full query params', () => {
    const result = taskQuerySchema.safeParse({
      search: 'deploy',
      projectId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
  });

  it('should fail with invalid sortBy field', () => {
    const result = taskQuerySchema.safeParse({ sortBy: 'invalidField' });
    expect(result.success).toBe(false);
  });

  it('should fail with invalid projectId format', () => {
    const result = taskQuerySchema.safeParse({ projectId: 'not-uuid' });
    expect(result.success).toBe(false);
  });
});
