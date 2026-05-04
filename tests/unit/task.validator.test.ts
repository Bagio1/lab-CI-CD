/**
 * Unit tests for express-validator validation chains.
 *
 * Each validator is run against a fake Request object via the chain's
 * `.run(req)` method, which is the official API for out-of-middleware usage.
 */
import { Request } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  userIdValidator,
  statusFilterValidator,
} from '../../src/validators/task.validator';

// ---------------------------------------------------------------------------
// Helper: executes an array of validation chains against a synthetic request
// ---------------------------------------------------------------------------
async function runValidators(
  chains: ValidationChain[],
  body: Record<string, unknown> = {},
  params: Record<string, string> = {},
  query: Record<string, string> = {},
) {
  const req = { body, params, query } as unknown as Request;
  await Promise.all(chains.map((chain) => chain.run(req)));
  return validationResult(req);
}

const VALID_UUID = '123e4567-e89b-42d3-a456-426614174000';

// ---------------------------------------------------------------------------
// createTaskValidator
// ---------------------------------------------------------------------------
describe('createTaskValidator', () => {
  it('passes with minimal valid data', async () => {
    const result = await runValidators(createTaskValidator, {
      title: 'Buy milk',
      userId: VALID_UUID,
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('passes with all optional fields provided', async () => {
    const result = await runValidators(createTaskValidator, {
      title: 'Buy milk',
      description: 'From the corner shop',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2025-12-31T00:00:00Z',
      userId: VALID_UUID,
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails when title is missing', async () => {
    const result = await runValidators(createTaskValidator, { userId: VALID_UUID });
    expect(result.isEmpty()).toBe(false);
    const msgs = result.array().map((e) => e.msg);
    expect(msgs).toContain('Title is required');
  });

  it('fails when title exceeds 255 characters', async () => {
    const result = await runValidators(createTaskValidator, {
      title: 'a'.repeat(256),
      userId: VALID_UUID,
    });
    expect(result.isEmpty()).toBe(false);
  });

  it('fails when userId is missing', async () => {
    const result = await runValidators(createTaskValidator, { title: 'Task' });
    expect(result.isEmpty()).toBe(false);
    const msgs = result.array().map((e) => e.msg);
    expect(msgs).toContain('User ID is required');
  });

  it('fails when userId is not a UUID', async () => {
    const result = await runValidators(createTaskValidator, {
      title: 'Task',
      userId: 'not-a-uuid',
    });
    expect(result.isEmpty()).toBe(false);
    const msgs = result.array().map((e) => e.msg);
    expect(msgs).toContain('User ID must be a valid UUID');
  });

  it('fails when status is an invalid value', async () => {
    const result = await runValidators(createTaskValidator, {
      title: 'Task',
      userId: VALID_UUID,
      status: 'unknown',
    });
    expect(result.isEmpty()).toBe(false);
  });

  it('fails when priority is an invalid value', async () => {
    const result = await runValidators(createTaskValidator, {
      title: 'Task',
      userId: VALID_UUID,
      priority: 'critical',
    });
    expect(result.isEmpty()).toBe(false);
  });

  it('fails when dueDate is not a valid ISO 8601 date', async () => {
    const result = await runValidators(createTaskValidator, {
      title: 'Task',
      userId: VALID_UUID,
      dueDate: 'not-a-date',
    });
    expect(result.isEmpty()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTaskValidator
// ---------------------------------------------------------------------------
describe('updateTaskValidator', () => {
  it('passes with a valid UUID param and a partial body', async () => {
    const result = await runValidators(
      updateTaskValidator,
      { title: 'Updated' },
      { id: VALID_UUID },
    );
    expect(result.isEmpty()).toBe(true);
  });

  it('fails when :id param is not a UUID', async () => {
    const result = await runValidators(
      updateTaskValidator,
      {},
      { id: 'bad-id' },
    );
    expect(result.isEmpty()).toBe(false);
    const msgs = result.array().map((e) => e.msg);
    expect(msgs).toContain('Task ID must be a valid UUID');
  });

  it('fails when an invalid status is provided', async () => {
    const result = await runValidators(
      updateTaskValidator,
      { status: 'done' },
      { id: VALID_UUID },
    );
    expect(result.isEmpty()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// taskIdValidator
// ---------------------------------------------------------------------------
describe('taskIdValidator', () => {
  it('passes with a valid UUID', async () => {
    const result = await runValidators(taskIdValidator, {}, { id: VALID_UUID });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails with a non-UUID value', async () => {
    const result = await runValidators(taskIdValidator, {}, { id: '123' });
    expect(result.isEmpty()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// userIdValidator
// ---------------------------------------------------------------------------
describe('userIdValidator', () => {
  it('passes with a valid UUID', async () => {
    const result = await runValidators(userIdValidator, {}, { userId: VALID_UUID });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails with an invalid userId', async () => {
    const result = await runValidators(userIdValidator, {}, { userId: 'bad' });
    expect(result.isEmpty()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// statusFilterValidator
// ---------------------------------------------------------------------------
describe('statusFilterValidator', () => {
  it('passes when status query param is absent', async () => {
    const result = await runValidators(statusFilterValidator);
    expect(result.isEmpty()).toBe(true);
  });

  it('passes with a valid status query param', async () => {
    const result = await runValidators(statusFilterValidator, {}, {}, { status: 'pending' });
    expect(result.isEmpty()).toBe(true);
  });

  it('fails with an invalid status query param', async () => {
    const result = await runValidators(statusFilterValidator, {}, {}, { status: 'archived' });
    expect(result.isEmpty()).toBe(false);
  });
});
