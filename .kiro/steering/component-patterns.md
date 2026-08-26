---
inclusion: auto
---

# Component Patterns — TaskFlow

## Server vs Client Component Decision

Use **Server Components** (default) when:
- Fetching data for initial page render
- No interactivity needed (display-only)
- SEO is relevant
- Component doesn't use hooks, state, or browser APIs

Use **Client Components** (`'use client'`) when:
- User interaction (clicks, forms, drag-and-drop)
- Using React hooks (useState, useEffect, useQuery)
- Browser APIs needed
- Real-time updates (TanStack Query polling/refetching)

**Pattern**: Server Component page fetches initial data, passes to Client Component wrappers for interactive sections.

## Data Fetching Pattern

```tsx
// app/projects/page.tsx (Server Component)
import { ProjectListClient } from './project-list-client';

export default async function ProjectsPage() {
  // Initial fetch for SSR
  const projects = await fetchProjects();
  return <ProjectListClient initialData={projects} />;
}
```

```tsx
// app/projects/project-list-client.tsx (Client Component)
'use client';
import { useQuery } from '@tanstack/react-query';

export function ProjectListClient({ initialData }) {
  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialData,
  });
  // Interactive UI here
}
```

## TanStack Query Conventions

- Query keys: `['resource']` for lists, `['resource', id]` for details
- Use `queryKey` arrays with filter params for filtered lists: `['tasks', { status, priority }]`
- Mutations invalidate related queries on success
- Use optimistic updates for status changes (Kanban drag-and-drop)
- Set `staleTime: 30_000` (30s) for lists, `staleTime: 60_000` for details

## Form Pattern (React Hook Form + Zod)

Every form follows this structure:

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type CreateProjectInput } from '@taskflow/shared';

export function ProjectForm() {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '', status: 'ACTIVE' },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    // mutation.mutate(data)
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* FormField components from shadcn/ui */}
      </form>
    </Form>
  );
}
```

## shadcn/ui Component Usage

- Use shadcn/ui primitives: Button, Input, Select, Dialog, AlertDialog, Card, Badge, Table, Skeleton, Toast (Sonner)
- Import from `@/components/ui/...`
- Extend with custom variants when needed (e.g., priority-colored badges)
- Use `cn()` utility for conditional classNames

## Loading State Pattern

Every route segment has a `loading.tsx`:

```tsx
// app/projects/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}
```

## Error State Pattern

Every route segment has an `error.tsx`:

```tsx
'use client';

export default function ProjectsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  );
}
```

## Empty State Pattern

Reusable `EmptyState` component:

```tsx
<EmptyState
  icon={FolderOpen}
  title="No projects yet"
  description="Create your first project to get started"
  action={{ label: "Create Project", onClick: openCreateDialog }}
/>
```

## Confirmation Pattern (Destructive Actions)

All delete operations use AlertDialog:

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This will delete the project and all its tasks.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Toast Feedback

Use Sonner for all mutation feedback:
- Success: `toast.success("Project created successfully")`
- Error: `toast.error("Failed to create project")`
- Position: bottom-right
- Duration: 4 seconds

## Badge Variants for Status/Priority

```
Status badges:
- TODO → variant="secondary" (gray)
- IN_PROGRESS → variant="default" (blue)
- COMPLETED → variant="success" (green)

Priority badges:
- LOW → variant="outline" (subtle)
- MEDIUM → variant="warning" (yellow/amber)
- HIGH → variant="destructive" (red)
```
