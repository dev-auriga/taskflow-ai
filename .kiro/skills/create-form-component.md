# Skill: Create Form Component

## Purpose
Build a validated form using React Hook Form + Zod resolver + shadcn/ui form components with server error handling and success feedback.

## Input Required
- Form purpose: create or edit
- Zod schema from `@taskflow/shared`
- Fields: list of fields with types (text, select, textarea, date, tags)
- API endpoint: POST or PATCH URL
- Success behavior: close dialog, navigate, invalidate queries
- Pre-fill data (for edit forms)

## Steps

### 1. Form Component Structure
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { schema, type SchemaType } from '@taskflow/shared';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FormProps {
  defaultValues?: Partial<SchemaType>;
  onSuccess?: () => void;
}

export function ResourceForm({ defaultValues, onSuccess }: FormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!defaultValues?.id;

  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      // Set sensible defaults for create
      ...defaultValues,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SchemaType) =>
      isEditing
        ? apiClient.patch(`/api/resources/${defaultValues.id}`, data)
        : apiClient.post('/api/resources', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success(isEditing ? 'Updated successfully' : 'Created successfully');
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      // Handle server validation errors
      if (error.details) {
        error.details.forEach(({ field, message }) => {
          form.setError(field, { message });
        });
      } else {
        toast.error(error.message || 'Something went wrong');
      }
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        {/* Form fields here */}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </form>
    </Form>
  );
}
```

### 2. Field Types

**Text Input:**
```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name *</FormLabel>
      <FormControl>
        <Input placeholder="Enter name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Select:**
```tsx
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status *</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Textarea:**
```tsx
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea placeholder="Enter description" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Date Picker:**
```tsx
<FormField
  control={form.control}
  name="dueDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Due Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline">{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3. Wrapping in Dialog
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Create Resource</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{isEditing ? 'Edit' : 'Create'} Resource</DialogTitle>
    </DialogHeader>
    <ResourceForm
      defaultValues={editingResource}
      onSuccess={() => setOpen(false)}
    />
  </DialogContent>
</Dialog>
```

## Validation Checklist
- [ ] Zod resolver validates client-side before submit
- [ ] Required fields marked with asterisk (*)
- [ ] Server errors mapped to form fields via `setError`
- [ ] Generic errors shown via toast
- [ ] Submit button disabled during mutation
- [ ] Loading text on submit button
- [ ] Form resets on success
- [ ] Query cache invalidated on success
- [ ] Toast notification on success
- [ ] Dialog closes on success (if in dialog)
