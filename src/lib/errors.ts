import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number; // HTTP stauts code
  public isOperational: boolean; // true: expected error, false: programming error
  public field?: string;
  public code?: string; // Error code for frontend

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    field?: string
  ) {
    super(message); // Pass message to parent error class
    this.statusCode = statusCode;
    this.isOperational = true; // All AppErrors are expected/handled errors
    this.field = field;
    this.code = code;

    if (env.NODE_ENV === 'development') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/** 400 Bad Request: Invalid user input */

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR', field);
  }
}

/** 404 Not Found - Resourse not found */

export class NotFoundError extends AppError {
  constructor(resource: string = 'resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/** 401 Unauthorized: When user is not logged in  */

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication Required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 Forbiden - Logged in but user has no permission */

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 409 Conflict - Resource already exist in DB */

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/** 500 Internal server error - Something went wrong on server side */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

/** Invalid credentials  */

export class InvalidCredentialError extends AppError {
  constructor(message: string) {
    super(message, 400, 'INVALID_CREDENTIALS');
  }
}
