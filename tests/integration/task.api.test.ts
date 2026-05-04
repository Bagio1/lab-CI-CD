/**
 * Integration tests for the Task API.
 *
 * The Prisma client is mocked so no real database is required.
 * Supertest spins up the Express app in-process and exercises the full
 * HTTP stack (routing → validation → controller → service → mock DB).
 */
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/database/prisma';

// ---------------------------------------------------------------------------
// Mock Prisma – hoisted before any module that imports the DB client
// ---------------------------------------------------------------------------
jest.mock('../../src/database/prisma', () => ({
  __esModule: true,
  default: {
    task: {
      create:     jest.fn(),
      findUnique: jest.fn(),
      update:     jest.fn(),
      delete:     jest.fn(),
      findMany:   jest.fn(),
      count:      jest.fn(),
    },
  },
}));

// Typed helpers
const mockCreate     = prisma.task.create     as jest.Mock;
const mockFindUniq   = prisma.task.findUnique as jest.Mock;
const mockUpdate     = prisma.task.update     as jest.Mock;
const mockDelete     = prisma.task.delete     as jest.Mock;
const mockFindMany   = prisma.task.findMany   as jest.Mock;
const mockCount      = prisma.task.count      as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const USER_ID = '123e4567-e89b-42d3-a456-426614174000';
const TASK_ID = '123e4567-e89b-42d3-a456-426614174001';

const dbTask = {
  id: TASK_ID,
  title: 'Integration Task',
  description: 'desc',
  status: 'pending',
  priority: 'medium',
  dueDate: null,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  userId: USER_ID,
  user: { id: USER_ID, username: 'testuser', email: 'test@example.com' },
};

beforeEach(() => jest.clearAllMocks());

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// POST /api/tasks
// ---------------------------------------------------------------------------
describe('POST /api/tasks', () => {
  it('creates a task and returns 201', async () => {
    mockCreate.mockResolvedValue(dbTask);

    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Integration Task', userId: USER_ID });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(TASK_ID);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ userId: USER_ID });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when userId is not a UUID', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task', userId: 'bad-id' });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks/:id
// ---------------------------------------------------------------------------
describe('GET /api/tasks/:id', () => {
  it('returns the task when it exists', async () => {
    mockFindUniq.mockResolvedValue(dbTask);

    const res = await request(app).get(`/api/tasks/${TASK_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(TASK_ID);
  });

  it('returns 404 when the task is not found', async () => {
    mockFindUniq.mockResolvedValue(null);

    const res = await request(app).get(`/api/tasks/${TASK_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Task not found');
  });

  it('returns 400 for an invalid UUID', async () => {
    const res = await request(app).get('/api/tasks/not-a-uuid');
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/tasks/:id
// ---------------------------------------------------------------------------
describe('PUT /api/tasks/:id', () => {
  it('updates and returns the task', async () => {
    const updated = { ...dbTask, title: 'Updated', status: 'in_progress' };
    // First call: existence check (findUnique), second call: update
    mockFindUniq.mockResolvedValue(dbTask);
    mockUpdate.mockResolvedValue(updated);

    const res = await request(app)
      .put(`/api/tasks/${TASK_ID}`)
      .send({ title: 'Updated', status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  it('returns 404 when the task does not exist', async () => {
    mockFindUniq.mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/tasks/${TASK_ID}`)
      .send({ title: 'X' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .put(`/api/tasks/${TASK_ID}`)
      .send({ status: 'done' });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/tasks/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/tasks/:id', () => {
  it('deletes the task and returns 204', async () => {
    mockFindUniq.mockResolvedValue(dbTask);
    mockDelete.mockResolvedValue(dbTask);

    const res = await request(app).delete(`/api/tasks/${TASK_ID}`);

    expect(res.status).toBe(204);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when the task does not exist', async () => {
    mockFindUniq.mockResolvedValue(null);

    const res = await request(app).delete(`/api/tasks/${TASK_ID}`);

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks/user/:userId
// ---------------------------------------------------------------------------
describe('GET /api/tasks/user/:userId', () => {
  it('returns an array of tasks', async () => {
    mockFindMany.mockResolvedValue([dbTask]);

    const res = await request(app).get(`/api/tasks/user/${USER_ID}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it('filters by status query param', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await request(app)
      .get(`/api/tasks/user/${USER_ID}`)
      .query({ status: 'completed' });

    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid status query param', async () => {
    const res = await request(app)
      .get(`/api/tasks/user/${USER_ID}`)
      .query({ status: 'archived' });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks/user/:userId/overdue
// ---------------------------------------------------------------------------
describe('GET /api/tasks/user/:userId/overdue', () => {
  it('returns overdue tasks', async () => {
    const overdueTask = {
      ...dbTask,
      dueDate: new Date('2020-01-01T00:00:00Z'),
      status: 'pending',
    };
    mockFindMany.mockResolvedValue([overdueTask]);

    const res = await request(app).get(`/api/tasks/user/${USER_ID}/overdue`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 400 for invalid userId', async () => {
    const res = await request(app).get('/api/tasks/user/bad-id/overdue');
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/tasks/user/:userId/stats
// ---------------------------------------------------------------------------
describe('GET /api/tasks/user/:userId/stats', () => {
  it('returns task statistics', async () => {
    mockCount
      .mockResolvedValueOnce(10)  // total
      .mockResolvedValueOnce(4)   // completed
      .mockResolvedValueOnce(5)   // pending
      .mockResolvedValueOnce(1);  // overdue

    const res = await request(app).get(`/api/tasks/user/${USER_ID}/stats`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 10, completed: 4, pending: 5, overdue: 1 });
  });

  it('returns 400 for invalid userId', async () => {
    const res = await request(app).get('/api/tasks/user/bad-id/stats');
    expect(res.status).toBe(400);
  });
});
