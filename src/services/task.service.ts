// ─────────────────────────────────────────────────────────────────────────────
// services/task.service.ts
// Contains ALL business logic for tasks.
// The controller calls this layer; it never touches Express (no req/res here).
// This separation makes the service easy to unit-test without HTTP.
// ─────────────────────────────────────────────────────────────────────────────
import prisma from '../database/prisma';
import { CreateTaskDto, UpdateTaskDto, TaskFilters, TaskStats } from '../types';

export class TaskService {
  // ── Create ──────────────────────────────────────────────────────────────────

  async createTask(data: CreateTaskDto) {
    // Insert one row into the Task table.
    // ?? operator supplies defaults when optional DTO fields are undefined.
    return prisma.task.create({
      data: {
        title:       data.title,
        description: data.description,
        status:   data.status   ?? 'pending', // default when caller omits status
        priority: data.priority ?? 'medium',  // default when caller omits priority
        // Convert ISO string → Date only when the field was actually sent
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: data.userId,
      },
      // Also return the related User so the response includes owner details
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async getTaskById(id: string) {
    // findUnique returns the task OR null when the id doesn’t exist.
    // The controller converts null into a 404 HTTP response.
    return prisma.task.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async getTasksByUserId(userId: string, filters: TaskFilters = {}) {
    return prisma.task.findMany({
      where: {
        userId,
        // Spread the status filter only when it was explicitly provided.
        // Without this guard, passing undefined would break the Prisma query.
        ...(filters.status && { status: filters.status }),
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' }, // newest tasks first
    });
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async updateTask(id: string, data: UpdateTaskDto) {
    return prisma.task.update({
      where: { id },
      data: {
        ...data, // spread all DTO fields (undefined ones are ignored by Prisma)
        // Override dueDate only when it was explicitly sent in the request body
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async deleteTask(id: string) {
    // Hard-delete the row. Prisma throws P2025 if the record is missing,
    // which is caught by the central error handler and converted to 404.
    return prisma.task.delete({ where: { id } });
  }

  // ── Overdue detection ─────────────────────────────────────────────────────

  async getOverdueTasks(userId: string) {
    const now = new Date(); // current timestamp used as the cut-off point
    return prisma.task.findMany({
      where: {
        userId,
        dueDate: { lt: now },         // dueDate < now → deadline has passed
        status: { not: 'completed' }, // completed tasks are never considered overdue
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  // ── Statistics ────────────────────────────────────────────────────────────

  async getTaskStats(userId: string): Promise<TaskStats> {
    const now = new Date();

    // Run all four COUNT queries in parallel (Promise.all) instead of one-by-one.
    // This is faster: all queries hit the DB at the same time.
    const [total, completed, pending, overdue] = await Promise.all([
      prisma.task.count({ where: { userId } }),                         // all tasks
      prisma.task.count({ where: { userId, status: 'completed' } }),    // done
      prisma.task.count({ where: { userId, status: 'pending' } }),      // not started
      prisma.task.count({
        where: {
          userId,
          dueDate: { lt: now },         // past deadline
          status: { not: 'completed' }, // and not yet finished
        },
      }),
    ]);

    return { total, completed, pending, overdue };
  }

  // ── Synchronous helper ────────────────────────────────────────────────────

  // Pure function: checks if a single task object is overdue.
  // No DB call – used when the task is already in memory (and in unit tests).
  isOverdue(task: { dueDate: Date | null; status: string }): boolean {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date() > task.dueDate; // true when now is past the deadline
  }
}

// Export a singleton instance so every file that imports this module
// shares the same object (saves memory, avoids duplicate state).
export default new TaskService();
