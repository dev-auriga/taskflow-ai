import { TaskDetailClient } from './task-detail-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getTask(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/tasks/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const task = await getTask(id);
  return <TaskDetailClient taskId={id} initialData={task} />;
}
