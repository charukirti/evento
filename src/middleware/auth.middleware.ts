
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { tokenBlocklist } from '../lib/token-blocklist';
import { UnauthorizedError } from '../lib/errors';
import type { AccessTokenPayload } from '../lib/types';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No access token provided');
  }

  const accessToken = authHeader.split(' ')[1];

  let decoded: AccessTokenPayload;
  try {
    decoded = jwt.verify(accessToken!, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }

  if (tokenBlocklist.has(decoded.jti)) {
    throw new UnauthorizedError('Access token has been revoked');
  }

  req.user = {
    userId: decoded.sub,
    role: decoded.role,
    permissions: decoded.permissions,
  };

  next();
}