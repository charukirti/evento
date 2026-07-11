import {
  pgTable,
  varchar,
  numeric,
  integer,
  uuid,
  timestamp,
  text,
  pgEnum,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizersTable } from './organizer';

export const eventCategoryEnum = pgEnum('event_category', [
  'music',
  'tech',
  'sports',
  'arts',
  'food',
  'business',
  'other',
]);
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'cancelled',
  'completed',
]);
export const eventsTable = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title').notNull(),
    description: text('description').notNull(),
    category: eventCategoryEnum('category').notNull(),
    location: varchar('location').notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    status: eventStatusEnum('status').notNull().default('draft'),
    totalSeats: integer('total_seats').notNull(),
    availableSeats: integer('available_seats').notNull(),
    posterUrl: varchar('poster_url'),
    organizerId: uuid('organizer_id')
      .references(() => organizersTable.userId, { onDelete: 'restrict' })
      .notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    check('seat_zero_check', sql`${table.availableSeats} >= 0`),
    check('seat_max_check', sql`${table.availableSeats} <= ${table.totalSeats}`),
    check('time_check', sql`${table.endTime} > ${table.startTime}`)
  ]
);

export type NewEvent = typeof eventsTable.$inferInsert;
export type Event = typeof eventsTable.$inferSelect;
