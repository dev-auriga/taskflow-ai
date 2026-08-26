import { ProjectsClient } from './projects-client';
import type { ProjectWithCounts } from '@taskflow/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient initialData={projects} />;
}
