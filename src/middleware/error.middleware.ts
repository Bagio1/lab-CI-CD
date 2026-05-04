// ─────────────────────────────────────────────────────────────────────────────
// middleware/error.middleware.ts
// Express "error-handling middleware" – a function with 4 parameters (err, req, res, next).
// Express recognises it as an error handler ONLY when it has exactly 4 params.
// It must be app.use()-d AFTER all routes so only unhandled errors reach it.
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';

// Extend the standard Error to include a Prisma error code.
// Prisma error codes reference:
//   P2025 – Record not found (thrown when update/delete targets a missing row)
interface PrismaError extends Error {
  code?: string;
}

// The leading underscore on _req and _next signals they are intentionally unused.
// ESLint ignores them because of the argsIgnorePattern: "^_" rule.
export function errorHandler(
  err: PrismaError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Log every unhandled error so it shows up in Docker logs / server output
  console.error('[ErrorHandler]', err.message);

  // Handle "record not found" from Prisma (e.g. delete/update on missing row)
  if (err.code === 'P2025') {
    res.status(404).json({ message: 'Resource not found' });
    return;
  }

  // Catch-all: hide internal details from clients (security best practice)
  res.status(500).json({ message: 'Internal server error' });
}
