import {
  pgTable,
  uuid,
  timestamp,
  pgEnum,
  uniqueIndex,
  varchar,
  text,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users';
import { sql } from 'drizzle-orm';

export const organizerRequestsStatusEnum = pgEnum('organizer_request_status', [
  'pending',
  'approved',
  'rejected',
]);

export const organizerRequestsTable = pgTable(
  'organizer_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    status: organizerRequestsStatusEnum('status').default('pending').notNull(),
    organizationName: varchar('organization_name', { length: 60 }),
    bio: text('bio'),
    website: varchar('website'),
    requestedAt: timestamp('requested_at').defaultNow().notNull(),
    reviewedBy: uuid('reviewed_by').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    reviewedAt: timestamp('reviewed_at'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_user_request')
      .on(table.userId)
      .where(sql`${table.status} = 'pending'`),
  ]
);

export type NewOrganizerRequest = typeof organizerRequestsTable.$inferInsert;
export type OrganizerRequest = typeof organizerRequestsTable.$inferSelect;