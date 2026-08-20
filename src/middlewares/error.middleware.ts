import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import type { ApiResponse } from '../types/api.types';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} was not found.`));
}

function getDatabaseError(error: unknown): AppError | undefined {
  if (!error || typeof error !== 'object' || !('code' in error) || typeof error.code !== 'string') {
    return undefined;
  }

  switch (error.code) {
    case '23505':
      return new AppError(409, 'A record with the same unique value already exists.');
    case '23503':
      return new AppError(409, 'This record is still referenced by another record.');
    case '23514':
      return new AppError(400, 'Database constraint validation failed.');
    default:
      return undefined;
  }
}

export const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res: Response<ApiResponse<never>>,
  _next,
): void => {
  const handledError = error instanceof AppError ? error : getDatabaseError(error);
  const statusCode = handledError?.statusCode ?? 500;
  const message = handledError?.message ?? 'Internal server error.';

  if (!handledError) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
