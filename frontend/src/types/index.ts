export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskStatus {
  id: number;
  name: string;
}

export interface TaskPriority {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  statusId: number;
  priorityId: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface DashboardStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface TaskFilterParams {
  search?: string;
  status?: string;
  priority?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  statusId: number;
  priorityId: number;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title: string;
  description?: string | null;
  statusId: number;
  priorityId: number;
  dueDate?: string | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}
