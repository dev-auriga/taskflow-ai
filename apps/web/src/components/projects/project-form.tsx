'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createProjectSchema,
  type CreateProjectInput,
  type ProjectWithCounts,
  PROJECT_STATUS_OPTIONS,
} from '@taskflow/shared';
import { apiClient, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface ProjectFormProps {
  project?: ProjectWithCounts;
  onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      status: project?.status ?? 'ACTIVE',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProjectInput) =>
      isEditing
        ? apiClient.patch(`/api/projects/${project.id}`, data)
        : apiClient.post('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isEditing ? 'Project updated successfully' : 'Project created successfully');
      onSuccess?.();
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.details) {
        error.details.forEach(({ field, message }) => {
          setError(field as keyof CreateProjectInput, { message });
        });
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong');
      }
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Project Name <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          placeholder="Enter project name"
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Enter project description (optional)"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <Select
          id="status"
          options={PROJECT_STATUS_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          {...register('status')}
        />
        {errors.status && (
          <p className="text-xs text-destructive">{errors.status.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? 'Saving...'
            : isEditing
              ? 'Update Project'
              : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
