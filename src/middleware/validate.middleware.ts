import z from 'zod';
import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../lib/errors';

interface RequestValidators {
  body?: z.ZodType;
  params?: z.ZodType;
}

export function validate(validators: RequestValidators) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.body) {
        validators.body.parse(req.body);
      }
      if (validators.params) {
        validators.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        if (!firstIssue) {
          return next(new Error('Validation error'));
        }

        const field = firstIssue.path.join('.') || undefined;

        let message;

        if (firstIssue.code === 'invalid_type' && firstIssue.path.length > 0) {
          const fieldName = firstIssue.path.join('.');
          message = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        } else {
          message = firstIssue?.message;
        }

        return next(new ValidationError(message!, field));
      }

      next(error);
    }
  };
}
