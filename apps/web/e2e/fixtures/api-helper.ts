import { APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3001';

export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  async createProject(data: { name: string; description?: string; status?: string }) {
    const res = await this.request.post(`${API_URL}/api/projects`, { data });
    const json = await res.json();
    return json.data;
  }

  async createTask(data: {
    title: string;
    projectId: string;
    status?: string;
    priority?: string;
    description?: string;
    dueDate?: string;
    labels?: string[];
  }) {
    const res = await this.request.post(`${API_URL}/api/tasks`, {
      data: {
        status: 'TODO',
        priority: 'MEDIUM',
        ...data,
      },
    });
    const json = await res.json();
    return json.data;
  }

  async getProjects() {
    const res = await this.request.get(`${API_URL}/api/projects`);
    const json = await res.json();
    return json.data;
  }

  async deleteProject(id: string) {
    await this.request.delete(`${API_URL}/api/projects/${id}`);
  }

  async cleanup() {
    const projects = await this.getProjects();
    for (const project of projects) {
      await this.deleteProject(project.id);
    }
  }
}
