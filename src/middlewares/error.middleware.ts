import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import type { ApiResponse } from '../types/api.types';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} was not found.`));
}

export const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res: Response<ApiResponse<never>>,
  _next,
): void => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const message = isAppError ? error.message : 'Internal server error.';

  if (!isAppError) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
