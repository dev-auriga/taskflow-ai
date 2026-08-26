'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  createTaskSchema,
  type CreateTaskInput,
  type TaskWithProject,
  type ProjectWithCounts,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '@taskflow/shared';
import { apiClient, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

interface TaskFormProps {
  task?: TaskWithProject;
  defaultProjectId?: string;
  onSuccess?: () => void;
}

export function TaskForm({ task, defaultProjectId, onSuccess }: TaskFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!task;
  const [labelInput, setLabelInput] = useState('');

  // Fetch projects for the project select dropdown
  const { data: projects } = useQuery<ProjectWithCounts[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<ProjectWithCounts[]>('/api/projects'),
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      projectId: task?.projectId ?? defaultProjectId ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: task?.dueDate ? task.dueDate.slice(0, 16) : '',
      labels: task?.labels ?? [],
    },
  });

  const labels = watch('labels') ?? [];

  const mutation = useMutation({
    mutationFn: (data: CreateTaskInput) =>
      isEditing
        ? apiClient.patch(`/api/tasks/${task.id}`, data)
        : apiClient.post('/api/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isEditing ? 'Task updated successfully' : 'Task created successfully');
      onSuccess?.();
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.details) {
        error.details.forEach(({ field, message }) => {
          setError(field as keyof CreateTaskInput, { message });
        });
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong');
      }
    },
  });

  const addLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed) && labels.length < 10) {
      setValue('labels', [...labels, trimmed]);
      setLabelInput('');
    }
  };

  const removeLabel = (label: string) => {
    setValue('labels', labels.filter((l) => l !== label));
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLabel();
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="title"
          placeholder="Enter task title"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Project */}
      <div className="space-y-2">
        <label htmlFor="projectId" className="text-sm font-medium">
          Project <span className="text-destructive">*</span>
        </label>
        <Select
          id="projectId"
          placeholder="Select a project"
          options={
            projects?.map((p) => ({ value: p.id, label: p.name })) ?? []
          }
          {...register('projectId')}
          aria-invalid={!!errors.projectId}
        />
        {errors.projectId && (
          <p className="text-xs text-destructive">{errors.projectId.message}</p>
        )}
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status <span className="text-destructive">*</span>
          </label>
          <Select
            id="status"
            options={TASK_STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            {...register('status')}
          />
          {errors.status && (
            <p className="text-xs text-destructive">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Priority <span className="text-destructive">*</span>
          </label>
          <Select
            id="priority"
            options={TASK_PRIORITY_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            {...register('priority')}
          />
          {errors.priority && (
            <p className="text-xs text-destructive">{errors.priority.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Enter task description (optional)"
          rows={3}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <label htmlFor="dueDate" className="text-sm font-medium">
          Due Date
        </label>
        <Input
          id="dueDate"
          type="datetime-local"
          {...register('dueDate')}
        />
        {errors.dueDate && (
          <p className="text-xs text-destructive">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Labels */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Labels</label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a label"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={handleLabelKeyDown}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={addLabel}>
            Add
          </Button>
        </div>
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeLabel(label)}
                  className="hover:text-destructive"
                  aria-label={`Remove label ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.labels && (
          <p className="text-xs text-destructive">{errors.labels.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? 'Saving...'
            : isEditing
              ? 'Update Task'
              : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
