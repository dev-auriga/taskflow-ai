# Skill: Create Next.js App Router Page

## Purpose
Scaffold a complete Next.js App Router page with Server Component data fetching, Client Component wrappers for interactivity, loading states, and error boundaries.

## Input Required
- Route path: e.g., `/projects`, `/projects/[id]`, `/tasks`
- Data to fetch: which API endpoint(s)
- Interactive elements: forms, filters, actions
- Whether it's a list page, detail page, or dashboard

## Steps

### 1. Create Route Directory
```
apps/web/src/app/{route}/
├── page.tsx            # Server Component (data fetching + layout)
├── loading.tsx         # Loading skeleton
├── error.tsx           # Error boundary
└── {feature}-client.tsx  # Client Component (interactivity)
```

### 2. Server Component Page (`page.tsx`)
```typescript
import { Suspense } from 'react';
import { FeatureClient } from './{feature}-client';

// Fetch data server-side for initial render
async function getData() {
  const res = await fetch(`${process.env.API_URL}/api/{resource}`, {
    cache: 'no-store', // or next: { revalidate: 30 }
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  const json = await res.json();
  return json.data;
}

export default async function FeaturePage() {
  const data = await getData();
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Page Title</h1>
      <FeatureClient initialData={data} />
    </div>
  );
}
```

### 3. Loading State (`loading.tsx`)
- Match the shape of the actual content
- Use shadcn/ui Skeleton components
- Show appropriate number of skeleton items

### 4. Error Boundary (`error.tsx`)
```typescript
'use client';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### 5. Client Component (`{feature}-client.tsx`)
```typescript
'use client';
import { useQuery } from '@tanstack/react-query';

export function FeatureClient({ initialData }) {
  const { data, isLoading } = useQuery({
    queryKey: ['{resource}'],
    queryFn: () => apiClient.get('/api/{resource}'),
    initialData,
  });

  // Interactive UI: filters, forms, actions
  return <>{/* ... */}</>;
}
```

## Dynamic Routes (`[id]`)
- Use `params` prop: `{ params: { id: string } }`
- Fetch individual resource by ID
- Handle 404 with `notFound()` from `next/navigation`

## Validation Checklist
- [ ] Server Component fetches initial data
- [ ] Client Component handles interactivity
- [ ] loading.tsx with content-shaped skeletons
- [ ] error.tsx with retry button
- [ ] Empty state handled (when data is empty array)
- [ ] Responsive layout (mobile-first)
- [ ] Page title set via metadata export
