import { describe, it, expect } from 'vitest';
import { createProjectSchema, updateProjectSchema } from './project.schema';

describe('createProjectSchema', () => {
  it('should validate a valid project with all fields', () => {
    const result = createProjectSchema.safeParse({
      name: 'My Project',
      description: 'A test project',
      status: 'ACTIVE',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('My Project');
      expect(result.data.description).toBe('A test project');
      expect(result.data.status).toBe('ACTIVE');
    }
  });

  it('should validate with only required fields (name), applying defaults', () => {
    const result = createProjectSchema.safeParse({ name: 'Minimal Project' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Minimal Project');
      expect(result.data.status).toBe('ACTIVE'); // default
    }
  });

  it('should fail when name is empty', () => {
    const result = createProjectSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('name'));
      expect(nameError).toBeDefined();
      expect(nameError?.message).toBe('Project name is required');
    }
  });

  it('should fail when name is missing', () => {
    const result = createProjectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should fail when name exceeds 255 characters', () => {
    const result = createProjectSchema.safeParse({ name: 'a'.repeat(256) });
    expect(result.success).toBe(false);
  });

  it('should fail with invalid status', () => {
    const result = createProjectSchema.safeParse({ name: 'Test', status: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should accept all valid statuses', () => {
    for (const status of ['ACTIVE', 'COMPLETED', 'ARCHIVED']) {
      const result = createProjectSchema.safeParse({ name: 'Test', status });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateProjectSchema', () => {
  it('should allow partial updates (all fields optional)', () => {
    const result = updateProjectSchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('should allow empty object (no changes)', () => {
    const result = updateProjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should still validate field constraints', () => {
    const result = updateProjectSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});
