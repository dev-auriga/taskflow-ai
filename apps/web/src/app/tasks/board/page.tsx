import { Suspense } from 'react';
import { KanbanBoard } from './kanban-board';
import type { TaskWithProject, ProjectWithCounts } from '@taskflow/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getTasks(): Promise<TaskWithProject[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/tasks`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function getProjects(): Promise<ProjectWithCounts[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/projects`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function BoardPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);

  return (
    <Suspense>
      <KanbanBoard initialTasks={tasks} initialProjects={projects} />
    </Suspense>
  );
}
