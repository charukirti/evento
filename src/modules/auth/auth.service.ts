import { and, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../../db/db';
import {
  permissionsTable,
  refreshTokenTable,
  rolePermissionsTable,
  rolesTable,
  usersTable,
} from '../../db/schema';
import type { RegisterInput, LoginInput } from './auth.schema';
import {
  ConflictError,
  InternalServerError,
  InvalidCredentialError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors';
import { generateAccessToken, generateRefreshToken } from '../../lib/token';
import { DatabaseError } from 'pg';
import { env } from '../../config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from '../../lib/types';
import { tokenBlocklist } from '../../lib/token-blocklist';

export async function register(data: RegisterInput) {
  const { name, email, password } = data;

  const hashedPassword = await Bun.password.hash(password);

  const [userRole] = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.name, 'user'));

  if (!userRole) {
    throw new NotFoundError('User role not found');
  }

  const rolePermissions = await db
    .select({ name: permissionsTable.name })
    .from(rolePermissionsTable)
    .innerJoin(
      permissionsTable,
      eq(rolePermissionsTable.permissionId, permissionsTable.id)
    )
    .where(eq(rolePermissionsTable.roleId, userRole.id));

  const permissions = rolePermissions.map((rp) => rp.name);

  const { user, accessToken, refreshToken, expiresAt } = await db.transaction(
    async (tx) => {
      let user;

      try {
        [user] = await tx
          .insert(usersTable)
          .values({
            name,
            email,
            password: hashedPassword,
            roleId: userRole.id,
          })
          .returning({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          });
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.cause instanceof DatabaseError &&
          error.cause.code === '23505'
        ) {
          throw new ConflictError('An account with this email already exists');
        }
        throw error;
      }

      if (!user) {
        throw new InternalServerError('Failed to create user');
      }

      const {
        jti,
        token: refreshToken,
        expiresAt,
      } = generateRefreshToken({ userId: user.id });

      const accessToken = generateAccessToken({
        userId: user.id,
        role: userRole.name,
        permissions,
      });

      await tx.insert(refreshTokenTable).values({
        jti,
        expiresAt,
        userId: user.id,
        familyId: crypto.randomUUID(),
      });

      return { user, accessToken, refreshToken, expiresAt };
    }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole.name,
    },
    accessToken,
    refreshToken,
    expiresAt,
  };
}

export async function login(data: LoginInput) {
  const { email, password } = data;

  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      password: usersTable.password,
      roleId: usersTable.roleId,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) {
    throw new InvalidCredentialError('Invalid credentials');
  }

  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    throw new InvalidCredentialError('Invalid credentials');
  }

  const [userRole] = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.id, user.roleId));

  if (!userRole) {
    throw new NotFoundError('User role not found');
  }

  const rolePermissions = await db
    .select({ name: permissionsTable.name })
    .from(rolePermissionsTable)
    .innerJoin(
      permissionsTable,
      eq(rolePermissionsTable.permissionId, permissionsTable.id)
    )
    .where(eq(rolePermissionsTable.roleId, userRole.id));

  const permissions = rolePermissions.map((rp) => rp.name);

  const {
    jti,
    token: refreshToken,
    expiresAt,
  } = generateRefreshToken({
    userId: user.id,
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    role: userRole.name,
    permissions,
  });

  await db.insert(refreshTokenTable).values({
    jti,
    expiresAt,
    userId: user.id,
    familyId: crypto.randomUUID(),
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole.name,
    },
    accessToken,
    refreshToken,
    expiresAt,
  };
}

export async function rotateRefreshToken(oldRefreshToken: string) {
  let decode: RefreshTokenPayload;
  try {
    decode = jwt.verify(
      oldRefreshToken,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const { jti, sub: userId } = decode;

  const [existingToken] = await db
    .select()
    .from(refreshTokenTable)
    .where(
      and(eq(refreshTokenTable.jti, jti), eq(refreshTokenTable.userId, userId))
    );

  if (!existingToken) {
    throw new UnauthorizedError('Refresh token not found');
  }

  if (existingToken.isRevoked) {
    await db
      .update(refreshTokenTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokenTable.familyId, existingToken.familyId));
    throw new UnauthorizedError(
      'Refresh token reuse detected, refresh token has been revoked'
    );
  }

  await db
    .update(refreshTokenTable)
    .set({ isRevoked: true })
    .where(eq(refreshTokenTable.id, existingToken.id));

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    throw new NotFoundError('User');
  }

  const [userRole] = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.id, user.roleId));

  if (!userRole) {
    throw new NotFoundError('User role');
  }

  const rolePermissions = await db
    .select({ name: permissionsTable.name })
    .from(rolePermissionsTable)
    .innerJoin(
      permissionsTable,
      eq(rolePermissionsTable.permissionId, permissionsTable.id)
    )
    .where(eq(rolePermissionsTable.roleId, userRole.id));

  const permissions = rolePermissions.map((rp) => rp.name);

  const accessToken = generateAccessToken({
    userId: user.id,
    role: userRole.name,
    permissions,
  });

  const {
    jti: newJti,
    token: newRefreshToken,
    expiresAt,
  } = generateRefreshToken({ userId: user.id });

  await db.insert(refreshTokenTable).values({
    jti: newJti,
    expiresAt,
    userId: user.id,
    familyId: existingToken.familyId,
  });

  return { accessToken, refreshToken: newRefreshToken, expiresAt };
}

export async function logout(accessToken: string, refreshToken: string) {
  try {
    const decodedAccessToken = jwt.verify(
      accessToken,
      env.JWT_ACCESS_SECRET
    ) as AccessTokenPayload;

    tokenBlocklist.add(decodedAccessToken.jti);
  } catch {
    // access token invalid or expired — safe to ignore, logout still proceeds
  }

  try {
    const decodedRefreshToken = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;

    await db
      .update(refreshTokenTable)
      .set({ isRevoked: true })
      .where(eq(refreshTokenTable.jti, decodedRefreshToken.jti));
  } catch {
    // refresh token invalid or expired — safe to ignore, logout still proceeds
  }
}
