import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../lib/errors';

export function requirePermission(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      throw new ForbiddenError(
        `Missing required permission: ${requiredPermission}`
      );
    }

    next();
  };
}
