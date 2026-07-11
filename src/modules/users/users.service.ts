import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import {
  organizerRequestsTable,
  organizersTable,
  rolesTable,
  usersTable,
} from '../../db/schema';
import {
  NotFoundError,
  ConflictError,
  InternalServerError,
} from '../../lib/errors';
import { DatabaseError } from 'pg';
import type { RequestOrganizerInput } from './users.schema';

export async function getUser(userId: string) {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: rolesTable.name,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .innerJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
    .where(eq(usersTable.id, userId));

  if (!user) {
    throw new NotFoundError('User does not exist');
  }

  return user;
}

export async function deleteUser(userId: string) {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, userId));
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.cause instanceof DatabaseError &&
      error.cause.code === '23503'
    ) {
      throw new ConflictError(
        'Cannot delete account while you have active events'
      );
    }
    throw error;
  }
}

export async function requestRoleChange(
  userId: string,
  data: RequestOrganizerInput
) {
  const { organizationName, bio, website } = data;

  const [existingOrganizer] = await db
    .select()
    .from(organizersTable)
    .where(eq(organizersTable.userId, userId));

  if (existingOrganizer) {
    throw new ConflictError('You are already an organizer');
  }

  try {
    const [request] = await db
      .insert(organizerRequestsTable)
      .values({ organizationName, bio, website, userId })
      .returning({
        requestId: organizerRequestsTable.id,
        requestUserId: organizerRequestsTable.userId,
        requestOrganizerName: organizerRequestsTable.organizationName,
      });

    if (!request) {
      throw new InternalServerError('Failed to create request');
    }

    return request;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.cause instanceof DatabaseError &&
      error.cause.code === '23505'
    ) {
      throw new ConflictError('You already have a pending organizer request');
    }

    throw error;
  }
}
