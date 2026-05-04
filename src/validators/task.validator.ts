import { body, param, query } from 'express-validator';

export const createTaskValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be pending, in_progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isUUID().withMessage('User ID must be a valid UUID'),
];

export const updateTaskValidator = [
  param('id')
    .isUUID().withMessage('Task ID must be a valid UUID'),
  body('title')
    .optional()
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be pending, in_progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
];

export const taskIdValidator = [
  param('id')
    .isUUID().withMessage('Task ID must be a valid UUID'),
];

export const userIdValidator = [
  param('userId')
    .isUUID().withMessage('User ID must be a valid UUID'),
];

export const statusFilterValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be pending, in_progress, or completed'),
];
