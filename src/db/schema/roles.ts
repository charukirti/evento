import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const rolesTable = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
});

export type NewRole = typeof rolesTable.$inferInsert;
export type Role = typeof rolesTable.$inferSelect;
