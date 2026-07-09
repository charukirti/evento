import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError, NotFoundError } from '../lib/errors';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string | undefined;
  stack?: string | undefined;
  field?: string | undefined;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (env.NODE_ENV === 'development') {
    console.error({
      message: err.message,
      stack: err.stack,
      name: err.name,
      url: req.url,
      method: req.method,
      cause: err.cause
    });
  }

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
      field: err.field,
    };

    if (env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  const response: ErrorResponse = {
    success: false,
    message: 'Internal Server Error',
  };

  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new NotFoundError(
    `Cannot find ${req.originalUrl} on this server`
  );
  next(error);
}
