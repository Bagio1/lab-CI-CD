// ─────────────────────────────────────────────────────────────────────────────
// controllers/task.controller.ts
// Thin HTTP layer: reads req, calls the service, writes res.
// NO business logic lives here – it all stays in task.service.ts.
// Every method follows the same pattern:
//   1. Check validation errors → 400 if any
//   2. Call the service method
//   3. Return the result or a 404/204
//   4. Forward unexpected errors to the central error handler via next(error)
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator'; // reads errors left by validators
import taskService from '../services/task.service';   // the actual business logic
import { TaskStatus } from '../types';

export class TaskController {

  // ── POST /api/tasks ────────────────────────────────────────────────────────────
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      // validationResult collects errors stored by the validator middleware chain
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Return all validation errors so the client knows exactly what to fix
        return res.status(400).json({ errors: errors.array() });
      }

      // Delegate creation to the service; req.body already validated
      const task = await taskService.createTask(req.body);
      return res.status(201).json(task); // 201 Created
    } catch (error) {
      return next(error); // forward to error.middleware.ts
    }
  }

  // ── GET /api/tasks/:id ───────────────────────────────────────────────────────
  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const task = await taskService.getTaskById(req.params.id);
      if (!task) {
        // Service returned null – the task doesn’t exist in the DB
        return res.status(404).json({ message: 'Task not found' });
      }
      return res.json(task); // 200 OK
    } catch (error) {
      return next(error);
    }
  }

  // ── PUT /api/tasks/:id ───────────────────────────────────────────────────────
  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check existence BEFORE updating to give a clear 404 (not a Prisma error)
      const existing = await taskService.getTaskById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updated = await taskService.updateTask(req.params.id, req.body);
      return res.json(updated); // 200 OK with updated task
    } catch (error) {
      return next(error);
    }
  }

  // ── DELETE /api/tasks/:id ───────────────────────────────────────────────────
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Guard: return 404 if task is already gone
      const existing = await taskService.getTaskById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await taskService.deleteTask(req.params.id);
      return res.status(204).send(); // 204 No Content – success with no body
    } catch (error) {
      return next(error);
    }
  }

  // ── GET /api/tasks/user/:userId?status=... ─────────────────────────────────
  async getTasksByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Pull the optional ?status= query param and pass it as a filter
      const { status } = req.query as { status?: TaskStatus };
      const tasks = await taskService.getTasksByUserId(req.params.userId, { status });
      return res.json(tasks);
    } catch (error) {
      return next(error);
    }
  }

  // ── GET /api/tasks/user/:userId/overdue ────────────────────────────────────
  async getOverdueTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Service handles the dueDate < now AND status != completed logic
      const tasks = await taskService.getOverdueTasks(req.params.userId);
      return res.json(tasks);
    } catch (error) {
      return next(error);
    }
  }

  // ── GET /api/tasks/user/:userId/stats ─────────────────────────────────────
  async getTaskStats(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Returns { total, completed, pending, overdue } counts for the user
      const stats = await taskService.getTaskStats(req.params.userId);
      return res.json(stats);
    } catch (error) {
      return next(error);
    }
  }
}

export default new TaskController();
