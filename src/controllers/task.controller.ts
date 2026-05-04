import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import taskService from '../services/task.service';
import { TaskStatus } from '../types';

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const task = await taskService.createTask(req.body);
      return res.status(201).json(task);
    } catch (error) {
      return next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const task = await taskService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.json(task);
    } catch (error) {
      return next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await taskService.getTaskById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updated = await taskService.updateTask(req.params.id, req.body);
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await taskService.getTaskById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await taskService.deleteTask(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async getTasksByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.query as { status?: TaskStatus };
      const tasks = await taskService.getTasksByUserId(req.params.userId, { status });
      return res.json(tasks);
    } catch (error) {
      return next(error);
    }
  }

  async getOverdueTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const tasks = await taskService.getOverdueTasks(req.params.userId);
      return res.json(tasks);
    } catch (error) {
      return next(error);
    }
  }

  async getTaskStats(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const stats = await taskService.getTaskStats(req.params.userId);
      return res.json(stats);
    } catch (error) {
      return next(error);
    }
  }
}

export default new TaskController();
