import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const permissionsTable = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

export type NewPermission = typeof permissionsTable.$inferInsert;
export type Permission = typeof permissionsTable.$inferSelect;
