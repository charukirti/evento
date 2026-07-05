import {
  pgTable,
  uuid,
  timestamp,
  integer,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { eventsTable } from './events';
import { usersTable } from './users';

export const statusEnum = pgEnum('booking_status', ['confirmed', 'cancelled']);

export const bookingsTable = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .references(() => eventsTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    seatsBooked: integer('seats_booked').notNull(),
    status: statusEnum('status').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [unique().on(table.eventId, table.userId)]
);

export type NewBooking = typeof bookingsTable.$inferInsert;
export type Booking = typeof bookingsTable.$inferSelect;
