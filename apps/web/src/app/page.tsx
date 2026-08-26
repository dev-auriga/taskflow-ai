import { DashboardClient } from './dashboard-client';
import type { DashboardResponse } from '@taskflow/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getDashboardData(): Promise<DashboardResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/dashboard`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient initialData={data} />;
}
