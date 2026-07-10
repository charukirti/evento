import type { Request, Response } from 'express';
import type { LoginInput, RegisterInput } from './auth.schema';
import { login, logout, register, rotateRefreshToken } from './auth.service';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../lib/errors';

export async function registerController(
  req: Request<{}, {}, RegisterInput>,
  res: Response
) {
  const { name, email, password } = req.body;

  const { user, accessToken, refreshToken, expiresAt } = await register({
    name,
    email,
    password,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      accessToken,
    },
  });
}

export async function loginController(
  req: Request<{}, {}, LoginInput>,
  res: Response
) {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken, expiresAt } = await login({
    email,
    password,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
  });

  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: {
      user,
      accessToken,
    },
  });
}

export async function rotateRefreshTokenController(
  req: Request,
  res: Response
) {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new UnauthorizedError('No refresh token provided');
  }

  const { accessToken, refreshToken, expiresAt } =
    await rotateRefreshToken(token);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
  });

  return res.status(200).json({
    success: true,
    message: 'Rotated refresh token successfully',
    data: accessToken,
  });
}

export async function logoutController(req: Request, res: Response) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthorizedError('No access token provided');
  }

  const accessToken = authHeader.split(' ')[1];
  const refreshToken = req.cookies.refreshToken;

  await logout(accessToken!, refreshToken);

  res.clearCookie('refreshToken');

  return res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
}
