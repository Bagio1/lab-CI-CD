import prisma from '../database/prisma';
import { CreateTaskDto, UpdateTaskDto, TaskFilters, TaskStats } from '../types';

export class TaskService {
  async createTask(data: CreateTaskDto) {
    return prisma.task.create({
      data: {
        title:       data.title,
        description: data.description,
        status:   data.status   ?? 'pending',
        priority: data.priority ?? 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: data.userId,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async getTaskById(id: string) {
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
        ...(filters.status && { status: filters.status }),
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTask(id: string, data: UpdateTaskDto) {
    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async deleteTask(id: string) {
    return prisma.task.delete({ where: { id } });
  }

  async getOverdueTasks(userId: string) {
    const now = new Date();
    return prisma.task.findMany({
      where: {
        userId,
        dueDate: { lt: now },
        status: { not: 'completed' },
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async getTaskStats(userId: string): Promise<TaskStats> {
    const now = new Date();

    const [total, completed, pending, overdue] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'completed' } }),
      prisma.task.count({ where: { userId, status: 'pending' } }),
      prisma.task.count({
        where: {
          userId,
          dueDate: { lt: now },
          status: { not: 'completed' },
        },
      }),
    ]);

    return { total, completed, pending, overdue };
  }

  isOverdue(task: { dueDate: Date | null; status: string }): boolean {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date() > task.dueDate;
  }
}

export default new TaskService();
