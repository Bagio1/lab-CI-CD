import { Router } from 'express';
import taskController from '../controllers/task.controller';

// CI demo: intentional unused variable – triggers @typescript-eslint/no-unused-vars error
const unusedDemoVar = 'this will break lint';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  userIdValidator,
  statusFilterValidator,
} from '../validators/task.validator';

const router = Router();

router.post(
  '/',
  createTaskValidator,
  taskController.createTask.bind(taskController),
);

// Keep user routes above /:id so Express does not treat "user" as a task id.
router.get(
  '/user/:userId/overdue',
  userIdValidator,
  taskController.getOverdueTasks.bind(taskController),
);

router.get(
  '/user/:userId/stats',
  userIdValidator,
  taskController.getTaskStats.bind(taskController),
);

router.get(
  '/user/:userId',
  [...userIdValidator, ...statusFilterValidator],
  taskController.getTasksByUser.bind(taskController),
);

router.get(
  '/:id',
  taskIdValidator,
  taskController.getTask.bind(taskController),
);

router.put(
  '/:id',
  updateTaskValidator,
  taskController.updateTask.bind(taskController),
);

router.delete(
  '/:id',
  taskIdValidator,
  taskController.deleteTask.bind(taskController),
);

export default router;
