import type { Request, Response } from 'express';
import type { LoginInput, RegisterInput } from './auth.schema';
import { login, register } from './auth.service';
import { env } from '../../config/env';

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
