# Skill: Create List with Filters

## Purpose
Build a filterable, sortable, searchable list view with URL-based state, TanStack Query data fetching, and proper empty/loading states.

## Input Required
- Resource name: what's being listed (tasks, projects)
- Filter fields: which fields can be filtered (status, priority, projectId)
- Sort fields: which fields can be sorted (createdAt, dueDate, priority)
- Search field: what field is searchable (title)
- Display fields: what columns/info to show in each row
- API endpoint with query param support

## Steps

### 1. Component Structure
```
{feature}-list/
├── {feature}-list-client.tsx    # Main client component
├── {feature}-filters.tsx        # Filter bar component
├── {feature}-table.tsx          # Table/list display
└── {feature}-sort.tsx           # Sort controls
```

### 2. URL State Management
```typescript
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

function useFilterState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    projectId: searchParams.get('projectId') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, router, pathname]);

  return { filters, setFilter };
}
```

### 3. Debounced Search
```typescript
import { useDebouncedCallback } from 'use-debounce';

function SearchInput({ value, onChange }) {
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  return (
    <Input
      placeholder="Search tasks..."
      defaultValue={value}
      onChange={(e) => debouncedOnChange(e.target.value)}
    />
  );
}
```

### 4. TanStack Query with Dynamic Params
```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['tasks', filters],
  queryFn: () => apiClient.get('/api/tasks', { params: filters }),
});
```

### 5. Filter Bar
```tsx
<div className="flex flex-wrap gap-2 mb-4">
  <SearchInput value={filters.search} onChange={(v) => setFilter('search', v)} />

  <Select value={filters.status} onValueChange={(v) => setFilter('status', v)}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">All</SelectItem>
      <SelectItem value="TODO">To Do</SelectItem>
      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
      <SelectItem value="COMPLETED">Completed</SelectItem>
    </SelectContent>
  </Select>

  {/* Similar for priority, project */}
</div>
```

### 6. Sort Controls
```tsx
<Select value={filters.sortBy} onValueChange={(v) => setFilter('sortBy', v)}>
  <SelectTrigger className="w-[150px]">
    <SelectValue placeholder="Sort by" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="createdAt">Created Date</SelectItem>
    <SelectItem value="updatedAt">Updated Date</SelectItem>
    <SelectItem value="dueDate">Due Date</SelectItem>
    <SelectItem value="priority">Priority</SelectItem>
  </SelectContent>
</Select>

<Button variant="outline" size="icon" onClick={toggleSortOrder}>
  {filters.sortOrder === 'asc' ? <ArrowUp /> : <ArrowDown />}
</Button>
```

### 7. Empty State
```tsx
{data?.length === 0 && (
  <EmptyState
    icon={SearchX}
    title="No tasks found"
    description={filters.search || hasActiveFilters
      ? "No tasks match your search or filters"
      : "Create your first task to get started"
    }
    action={!hasActiveFilters ? { label: "Create Task", onClick: openCreate } : undefined}
  />
)}
```

### 8. Loading State
```tsx
{isLoading && (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
)}
```

## Validation Checklist
- [ ] Filters stored in URL search params (shareable/bookmarkable)
- [ ] Search is debounced (300ms)
- [ ] Filters are combinable (AND logic)
- [ ] Sort toggles between asc/desc
- [ ] TanStack Query key includes all filter params
- [ ] Loading skeleton matches content shape
- [ ] Empty state differs based on whether filters are active
- [ ] Clear filters button when filters are active
- [ ] Responsive filter bar (stacks on mobile)
- [ ] Click on item navigates to detail page
