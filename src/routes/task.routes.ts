// ─────────────────────────────────────────────────────────────────────────────
// routes/task.routes.ts
// Maps HTTP method + path to the correct middleware chain + controller method.
// Route order matters: more specific paths (/user/:userId/overdue)
// must be registered BEFORE wildcard paths (/:id) to avoid Express
// treating the word "user" as a task ID.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import taskController from '../controllers/task.controller';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  userIdValidator,
  statusFilterValidator,
} from '../validators/task.validator';

// Create a modular router; mounted at /api/tasks in app.ts
const router = Router();

// ── POST /api/tasks ──────────────────────────────────────────────────────────
// 1. Run createTaskValidator chain (validates body fields)
// 2. Hand off to the controller
router.post(
  '/',
  createTaskValidator,
  taskController.createTask.bind(taskController), // bind() keeps `this` correct
);

// ── User-specific sub-routes ─────────────────────────────────────────────────
// IMPORTANT: these must be declared BEFORE /:id routes.
// If /:id came first, Express would match GET /user/xxx and treat "user" as :id.

// GET /api/tasks/user/:userId/overdue – tasks past their deadline
router.get(
  '/user/:userId/overdue',
  userIdValidator,                              // validate :userId is a UUID
  taskController.getOverdueTasks.bind(taskController),
);

// GET /api/tasks/user/:userId/stats – aggregate counts
router.get(
  '/user/:userId/stats',
  userIdValidator,
  taskController.getTaskStats.bind(taskController),
);

// GET /api/tasks/user/:userId?status=pending  – all tasks, optional filter
router.get(
  '/user/:userId',
  [...userIdValidator, ...statusFilterValidator], // spread both validator arrays
  taskController.getTasksByUser.bind(taskController),
);

// ── Generic task routes (by task :id) ────────────────────────────────────────

// GET /api/tasks/:id – single task by UUID
router.get(
  '/:id',
  taskIdValidator,
  taskController.getTask.bind(taskController),
);

// PUT /api/tasks/:id – partial update
router.put(
  '/:id',
  updateTaskValidator,
  taskController.updateTask.bind(taskController),
);

// DELETE /api/tasks/:id – remove task
router.delete(
  '/:id',
  taskIdValidator,
  taskController.deleteTask.bind(taskController),
);

export default router;
