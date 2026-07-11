import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { rolesTable, usersTable } from '../../db/schema';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { DatabaseError } from 'pg';

export async function getUser(id: string) {
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
    .where(eq(usersTable.id, id));

  if (!user) {
    throw new NotFoundError('User does not exist');
  }

  return user;
}

export async function deleteUser(id: string) {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, id));
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
