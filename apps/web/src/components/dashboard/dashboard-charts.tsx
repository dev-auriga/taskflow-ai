'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProjectStats, TaskStats } from '@taskflow/shared';

interface DashboardChartsProps {
  projectStats: ProjectStats;
  taskStats: TaskStats;
}

const TASK_STATUS_COLORS = {
  'To Do': '#737373',
  'In Progress': '#22c55e',
  'Completed': '#06b6d4',
};

const PROJECT_STATUS_COLORS = {
  Active: '#22c55e',
  Completed: '#06b6d4',
  Archived: '#737373',
};

export function DashboardCharts({ projectStats, taskStats }: DashboardChartsProps) {
  const taskPieData = [
    { name: 'To Do', value: taskStats.todo, color: TASK_STATUS_COLORS['To Do'] },
    { name: 'In Progress', value: taskStats.inProgress, color: TASK_STATUS_COLORS['In Progress'] },
    { name: 'Completed', value: taskStats.completed, color: TASK_STATUS_COLORS['Completed'] },
  ].filter((d) => d.value > 0);

  const projectBarData = [
    { name: 'Active', value: projectStats.active, fill: PROJECT_STATUS_COLORS.Active },
    { name: 'Completed', value: projectStats.completed, fill: PROJECT_STATUS_COLORS.Completed },
    { name: 'Archived', value: projectStats.archived, fill: PROJECT_STATUS_COLORS.Archived },
  ];

  const completionRate = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Distribution Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {taskStats.total === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              No tasks to display
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={taskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {taskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 9%)',
                      border: '1px solid hsl(0, 0%, 16%)',
                      borderRadius: '8px',
                      color: 'hsl(0, 0%, 95%)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Completion Rate */}
          <div className="text-center mt-2">
            <span className="text-3xl font-bold text-primary">{completionRate}%</span>
            <p className="text-xs text-muted-foreground mt-1">Overall Completion Rate</p>
          </div>
        </CardContent>
      </Card>

      {/* Project Status Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {projectStats.total === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              No projects to display
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(0, 0%, 16%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'hsl(0, 0%, 55%)', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(0, 0%, 16%)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'hsl(0, 0%, 55%)', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(0, 0%, 16%)' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 9%)',
                    border: '1px solid hsl(0, 0%, 16%)',
                    borderRadius: '8px',
                    color: 'hsl(0, 0%, 95%)',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {projectBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* Summary */}
          <div className="flex justify-around mt-3 text-center">
            <div>
              <span className="text-lg font-bold">{projectStats.active}</span>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <span className="text-lg font-bold">{projectStats.completed}</span>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <span className="text-lg font-bold">{projectStats.archived}</span>
              <p className="text-xs text-muted-foreground">Archived</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
