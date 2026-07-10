import type { AccessTokenPayload } from '../lib/token';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<AccessTokenPayload, 'sub' | 'jti'> & { userId: string };
    }
  }
}

export {};