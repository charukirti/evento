import { randomUUIDv7 } from 'bun';
import { env } from '../config/env';
import { sign, type SignOptions } from 'jsonwebtoken';

type RefreshTokenBody = {
  userId: string;
};

type AccessTokenBody = {
  userId: string;
  role: string;
  permissions: string[];
};

export function generateAccessToken({
  userId,
  role,
  permissions,
}: AccessTokenBody) {
  const jti = randomUUIDv7();
  const payload = {
    sub: userId,
    role,
    permissions,
    jti,
  };

  const token = sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRY as SignOptions['expiresIn'],
  });

  return token;
}

export function generateRefreshToken({ userId }: RefreshTokenBody): {
  token: string;
  jti: string;
  expiresAt: Date;
} {
  const jti = randomUUIDv7();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d
  const payload = {
    sub: userId,
    jti,
  };

  const token = sign(payload, env.JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRY as SignOptions['expiresIn'],
  });

  return {
    token,
    jti,
    expiresAt,
  };
}
