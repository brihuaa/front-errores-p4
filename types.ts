export interface User {
  _id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  user: User;
  created_at: string;
  updated_at: string;
}

export enum TaskStatus {
  PENDING = "pending",         // arreglado: changed from "todo"
  IN_PROGRESS = "in_progress", // arreglado: match API value
  COMPLETED = "completed"      // arreglado: changed from "done"
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  user: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  user?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface MoveTaskRequest {
  userId: string;
}
