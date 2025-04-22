import { Task, TaskStatus, User } from "../types.ts";
import { TaskCard } from "./TaskCard.tsx";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  columnClass: string;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
}

export function TaskColumn({
  title,
  status,
  tasks,
  columnClass,
  onEditTask,
  onDeleteTask,
  onMoveTask,
}: TaskColumnProps) {
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case TaskStatus.PENDING:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.COMPLETED;
      case TaskStatus.COMPLETED:
        return null; // prevent moving completed tasks
      default:
        return null;
    }
  };

  return (
    <div class={`task-column ${columnClass}`}>
      <h2 class="column-header">{title}</h2>
      <div class="task-list">
        {tasks.length === 0 ? (
          <p class="text-sm text-gray-500 text-center p-4">
            No tasks in this column
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              user={task.user}
              onEdit={() => onEditTask(task._id)}
              onDelete={() => onDeleteTask(task._id)}
              onStatusChange={
                getNextStatus(task.status) 
                  ? () => onMoveTask(task._id, getNextStatus(task.status)!) // ensure valid status
                  : undefined // disable move button for completed tasks
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
