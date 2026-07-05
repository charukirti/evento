import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { rolesTable } from './roles';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  email: varchar('email', { length: 60 }).notNull().unique(),
  password: text('password').notNull(),
  roleId: uuid('role_id')
    .notNull()
    .references(() => rolesTable.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type NewUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
