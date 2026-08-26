# Skill: Setup Kanban Column with Drag-and-Drop

## Purpose
Build a Kanban board column using dnd-kit with draggable task cards, optimistic status updates, and a dropdown fallback for accessibility.

## Input Required
- Column status: TODO, IN_PROGRESS, or COMPLETED
- Task card fields: title, priority, project name, due date
- Status update API endpoint: PATCH /api/tasks/:id/status
- TanStack Query key for cache invalidation

## Steps

### 1. Board Container (DndContext)
```typescript
'use client';
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';

export function KanbanBoard({ tasks, filters }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const [activeTask, setActiveTask] = useState(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus);
    }
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveTask(tasks.find(t => t.id === active.id))}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto">
        <KanbanColumn status="TODO" tasks={todoTasks} />
        <KanbanColumn status="IN_PROGRESS" tasks={inProgressTasks} />
        <KanbanColumn status="COMPLETED" tasks={completedTasks} />
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
```

### 2. Droppable Column
```typescript
import { useDroppable } from '@dnd-kit/core';

function KanbanColumn({ status, tasks, title }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col gap-2 p-4 bg-muted/50 rounded-lg min-h-[400px]',
        isOver && 'ring-2 ring-primary/50 bg-primary/5',
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      {tasks.map((task) => (
        <DraggableTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### 3. Draggable Task Card
```typescript
import { useDraggable } from '@dnd-kit/core';

function DraggableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('touch-none', isDragging && 'opacity-50')}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} />
    </div>
  );
}
```

### 4. Task Card Component (with dropdown fallback)
```typescript
function TaskCard({ task, isDragging = false }) {
  return (
    <Card className={cn('p-3 cursor-grab', isDragging && 'shadow-lg rotate-2')}>
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{task.project.name}</p>
      {task.dueDate && (
        <p className="text-xs text-muted-foreground mt-1">
          Due: {formatDate(task.dueDate)}
        </p>
      )}
      {/* Dropdown fallback for accessibility */}
      <StatusDropdown
        currentStatus={task.status}
        onStatusChange={(status) => updateTaskStatus(task.id, status)}
      />
    </Card>
  );
}
```

### 5. Optimistic Update
```typescript
const queryClient = useQueryClient();

const statusMutation = useMutation({
  mutationFn: ({ taskId, status }) =>
    apiClient.patch(`/api/tasks/${taskId}/status`, { status }),
  onMutate: async ({ taskId, status }) => {
    await queryClient.cancelQueries({ queryKey: ['tasks'] });
    const previous = queryClient.getQueryData(['tasks']);

    queryClient.setQueryData(['tasks'], (old) =>
      old.map((t) => (t.id === taskId ? { ...t, status } : t))
    );

    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['tasks'], context.previous);
    toast.error('Failed to update task status');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  },
});
```

### 6. Responsive Layout
```tsx
{/* Horizontal scroll on mobile */}
<div className="overflow-x-auto pb-4">
  <div className="grid grid-cols-3 gap-4 min-w-[768px] md:min-w-0">
    {/* columns */}
  </div>
</div>
```

## Validation Checklist
- [ ] DndContext wraps all columns
- [ ] Columns are droppable (useDroppable)
- [ ] Cards are draggable (useDraggable)
- [ ] DragOverlay shows card preview while dragging
- [ ] Optimistic update on drop (instant visual feedback)
- [ ] Rollback on API error
- [ ] Dropdown fallback on each card (accessibility)
- [ ] Keyboard sensor enabled
- [ ] Visual feedback: column highlights when dragging over
- [ ] Mobile: horizontal scroll layout
- [ ] Filter bar above board
- [ ] Dashboard/project stats invalidated on status change
