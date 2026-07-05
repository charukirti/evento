import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const refreshTokenTable = pgTable('refresh_token', {
  id: uuid('id').primaryKey().defaultRandom(),
  jti: text('jti').notNull().unique(),
  userId: uuid('user_id').references(() => usersTable.id, {onDelete: 'cascade'}).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export type NewRefreshToken = typeof refreshTokenTable.$inferInsert;
export type RefreshToken = typeof refreshTokenTable.$inferSelect;