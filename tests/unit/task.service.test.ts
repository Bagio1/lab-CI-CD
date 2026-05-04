/**
 * Unit tests for TaskService.
 *
 * Prisma is fully mocked so no database connection is needed.
 * Each test verifies a single method of the service in isolation.
 */
import { TaskService } from '../../src/services/task.service';
import prisma from '../../src/database/prisma';

// ---------------------------------------------------------------------------
// Mock the Prisma singleton – must be declared before any imports that
// pull in the module under test (jest.mock is hoisted by ts-jest).
// ---------------------------------------------------------------------------
jest.mock('../../src/database/prisma', () => ({
  __esModule: true,
  default: {
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Typed shorthand helpers
const mockCreate   = prisma.task.create   as jest.Mock;
const mockFindUniq = prisma.task.findUnique as jest.Mock;
const mockUpdate   = prisma.task.update   as jest.Mock;
const mockDelete   = prisma.task.delete   as jest.Mock;
const mockFindMany = prisma.task.findMany as jest.Mock;
const mockCount    = prisma.task.count    as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const USER_ID  = '00000000-0000-0000-0000-000000000001';
const TASK_ID  = '00000000-0000-0000-0000-000000000002';

const mockTask = {
  id: TASK_ID,
  title: 'Test Task',
  description: 'Test description',
  status: 'pending' as const,
  priority: 'medium' as const,
  dueDate: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  userId: USER_ID,
  user: { id: USER_ID, username: 'testuser', email: 'test@example.com' },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
    jest.clearAllMocks();
  });

  // --- createTask ----------------------------------------------------------
  describe('createTask', () => {
    it('creates a task with provided values', async () => {
      mockCreate.mockResolvedValue(mockTask);

      const result = await service.createTask({
        title: 'Test Task',
        userId: USER_ID,
        description: 'Test description',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: 'Test description',
          status: 'pending',
          priority: 'medium',
          dueDate: null,
          userId: USER_ID,
        },
        include: { user: { select: { id: true, username: true, email: true } } },
      });
      expect(result).toEqual(mockTask);
    });

    it('applies default status and priority when omitted', async () => {
      mockCreate.mockResolvedValue(mockTask);

      await service.createTask({ title: 'Min task', userId: USER_ID });

      const callArg = mockCreate.mock.calls[0][0];
      expect(callArg.data.status).toBe('pending');
      expect(callArg.data.priority).toBe('medium');
    });

    it('converts ISO dueDate string to a Date object', async () => {
      mockCreate.mockResolvedValue(mockTask);

      await service.createTask({
        title: 'Task with due',
        userId: USER_ID,
        dueDate: '2025-12-31T00:00:00Z',
      });

      const callArg = mockCreate.mock.calls[0][0];
      expect(callArg.data.dueDate).toBeInstanceOf(Date);
    });
  });

  // --- getTaskById ---------------------------------------------------------
  describe('getTaskById', () => {
    it('returns the task when found', async () => {
      mockFindUniq.mockResolvedValue(mockTask);

      const result = await service.getTaskById(TASK_ID);

      expect(mockFindUniq).toHaveBeenCalledWith({
        where: { id: TASK_ID },
        include: { user: { select: { id: true, username: true, email: true } } },
      });
      expect(result).toEqual(mockTask);
    });

    it('returns null when task does not exist', async () => {
      mockFindUniq.mockResolvedValue(null);
      const result = await service.getTaskById(TASK_ID);
      expect(result).toBeNull();
    });
  });

  // --- updateTask ----------------------------------------------------------
  describe('updateTask', () => {
    it('updates a task with the provided fields', async () => {
      const updatedTask = { ...mockTask, title: 'Updated title', status: 'in_progress' as const };
      mockUpdate.mockResolvedValue(updatedTask);

      const result = await service.updateTask(TASK_ID, {
        title: 'Updated title',
        status: 'in_progress',
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: TASK_ID } }),
      );
      expect(result).toEqual(updatedTask);
    });

    it('converts dueDate string to Date when provided', async () => {
      mockUpdate.mockResolvedValue(mockTask);

      await service.updateTask(TASK_ID, { dueDate: '2025-06-01T00:00:00Z' });

      const callArg = mockUpdate.mock.calls[0][0];
      expect(callArg.data.dueDate).toBeInstanceOf(Date);
    });
  });

  // --- deleteTask ----------------------------------------------------------
  describe('deleteTask', () => {
    it('calls prisma.task.delete with the correct id', async () => {
      mockDelete.mockResolvedValue(mockTask);

      await service.deleteTask(TASK_ID);

      expect(mockDelete).toHaveBeenCalledWith({ where: { id: TASK_ID } });
    });
  });

  // --- getTasksByUserId ----------------------------------------------------
  describe('getTasksByUserId', () => {
    it('returns all tasks for a user with no filter', async () => {
      mockFindMany.mockResolvedValue([mockTask]);

      const result = await service.getTasksByUserId(USER_ID);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: USER_ID } }),
      );
      expect(result).toHaveLength(1);
    });

    it('applies the status filter when provided', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getTasksByUserId(USER_ID, { status: 'completed' });

      const callArg = mockFindMany.mock.calls[0][0];
      expect(callArg.where.status).toBe('completed');
    });
  });

  // --- getOverdueTasks -----------------------------------------------------
  describe('getOverdueTasks', () => {
    it('queries tasks with a past dueDate and non-completed status', async () => {
      mockFindMany.mockResolvedValue([]);

      await service.getOverdueTasks(USER_ID);

      const callArg = mockFindMany.mock.calls[0][0];
      expect(callArg.where.userId).toBe(USER_ID);
      expect(callArg.where.dueDate).toHaveProperty('lt');
      expect(callArg.where.status).toEqual({ not: 'completed' });
    });
  });

  // --- getTaskStats --------------------------------------------------------
  describe('getTaskStats', () => {
    it('returns aggregated task statistics', async () => {
      // count is called 4 times (total, completed, pending, overdue)
      mockCount
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(4)  // completed
        .mockResolvedValueOnce(5)  // pending
        .mockResolvedValueOnce(1); // overdue

      const stats = await service.getTaskStats(USER_ID);

      expect(stats).toEqual({ total: 10, completed: 4, pending: 5, overdue: 1 });
      expect(mockCount).toHaveBeenCalledTimes(4);
    });
  });

  // --- isOverdue -----------------------------------------------------------
  describe('isOverdue', () => {
    it('returns true when dueDate is in the past and task is not completed', () => {
      const pastDate = new Date('2000-01-01T00:00:00Z');
      expect(service.isOverdue({ dueDate: pastDate, status: 'pending' })).toBe(true);
    });

    it('returns false when task is completed even if dueDate is past', () => {
      const pastDate = new Date('2000-01-01T00:00:00Z');
      expect(service.isOverdue({ dueDate: pastDate, status: 'completed' })).toBe(false);
    });

    it('returns false when dueDate is null', () => {
      expect(service.isOverdue({ dueDate: null, status: 'pending' })).toBe(false);
    });

    it('returns false when dueDate is in the future', () => {
      const futureDate = new Date(Date.now() + 1_000_000_000);
      expect(service.isOverdue({ dueDate: futureDate, status: 'pending' })).toBe(false);
    });
  });
});
