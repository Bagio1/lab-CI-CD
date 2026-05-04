// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts
// Central place for ALL shared TypeScript types and interfaces.
// Keeping types here avoids circular imports and makes refactoring easier.
// ─────────────────────────────────────────────────────────────────────────────

// The three lifecycle states a task can be in.
// Must match the Prisma enum `TaskStatus` in schema.prisma.
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Urgency level assigned to a task.
// Must match the Prisma enum `Priority` in schema.prisma.
export type Priority = 'low' | 'medium' | 'high';

// DTO (Data Transfer Object) for creating a new task.
// Received from the request body of POST /api/tasks.
export interface CreateTaskDto {
  title: string;          // Required – short name for the task
  description?: string;   // Optional – longer explanation
  status?: TaskStatus;    // Optional – defaults to 'pending' in the service
  priority?: Priority;    // Optional – defaults to 'medium' in the service
  dueDate?: string;       // Optional – ISO 8601 string, converted to Date by service
  userId: string;         // Required – UUID of the owner (foreign key to User)
}

// DTO for updating an existing task (all fields optional → partial update).
// Received from the request body of PUT /api/tasks/:id.
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string; // ISO 8601 string – converted to Date object by the service
}

// Shape of query parameters accepted by GET /api/tasks/user/:userId.
export interface TaskFilters {
  status?: TaskStatus; // When provided, only tasks with this status are returned
}

// Response shape for the GET /api/tasks/user/:userId/stats endpoint.
export interface TaskStats {
  total: number;     // All tasks belonging to the user
  completed: number; // Tasks with status = 'completed'
  pending: number;   // Tasks with status = 'pending'
  overdue: number;   // Non-completed tasks whose dueDate is in the past
}
