import { eq } from 'drizzle-orm';
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
} from '../../lib/errors';
import { generateAccessToken, generateRefreshToken } from '../../lib/token';
import { DatabaseError } from 'pg';

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
