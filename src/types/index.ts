export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type Priority = 'low' | 'medium' | 'high';

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  userId: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
