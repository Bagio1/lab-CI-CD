// ─────────────────────────────────────────────────────────────────────────────
// validators/task.validator.ts
// express-validator chains that run BEFORE the controller logic.
// Each exported array is attached directly to the route definition.
// If any rule fails, the controller reads errors via validationResult(req).
// ─────────────────────────────────────────────────────────────────────────────
import { body, param, query } from 'express-validator';
// body()  – validates fields inside req.body (POST / PUT payloads)
// param() – validates URL path parameters like :id or :userId
// query() – validates URL query string parameters like ?status=

// ── POST /api/tasks ──────────────────────────────────────────────────────────
// Rules for the request body when creating a brand-new task.
export const createTaskValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')           // must not be blank
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters'),
  body('description')
    .optional()                                            // field may be absent
    .isString().withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])         // only these 3 values allowed
    .withMessage('Status must be pending, in_progress, or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'), // e.g. 2025-06-01T00:00:00Z
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isUUID().withMessage('User ID must be a valid UUID'), // prevents SQL injection via malformed IDs
];

// ── PUT /api/tasks/:id ───────────────────────────────────────────────────────
// Validates the :id path param AND any optional fields in the body.
// All body fields are optional because this is a partial update.
export const updateTaskValidator = [
  param('id')
    .isUUID().withMessage('Task ID must be a valid UUID'), // :id must be a real UUID
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

// ── Routes with :id param ────────────────────────────────────────────────────
// Used by GET /api/tasks/:id and DELETE /api/tasks/:id
export const taskIdValidator = [
  param('id')
    .isUUID().withMessage('Task ID must be a valid UUID'),
];

// ── Routes with :userId param ────────────────────────────────────────────────
// Used by /api/tasks/user/:userId and its sub-routes
export const userIdValidator = [
  param('userId')
    .isUUID().withMessage('User ID must be a valid UUID'),
];

// ── Optional ?status= query param ────────────────────────────────────────────
// Used with GET /api/tasks/user/:userId?status=pending
export const statusFilterValidator = [
  query('status')
    .optional()                                              // filter is not required
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be pending, in_progress, or completed'),
];
