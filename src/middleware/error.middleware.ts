import { Request, Response, NextFunction } from 'express';

interface PrismaError extends Error {
  code?: string;
}

export function errorHandler(
  err: PrismaError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  console.error('[ErrorHandler]', err.message);

  if (err.code === 'P2025') {
    res.status(404).json({ message: 'Resource not found' });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
}
