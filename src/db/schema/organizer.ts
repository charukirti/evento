import { pgTable, text, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const organizersTable = pgTable('organizers', {
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .primaryKey(),
  organizationName: varchar('organization_name', { length: 60 }).notNull(),
  bio: text('bio').notNull(),
  website: varchar('website'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export type NewOrganizerData = typeof organizersTable.$inferInsert;
export type Organizer = typeof organizersTable.$inferSelect;
