import { ProjectDetailClient } from './project-detail-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getProject(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/projects/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  return <ProjectDetailClient projectId={id} initialData={project} />;
}
