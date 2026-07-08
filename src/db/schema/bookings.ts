import {
  pgTable,
  uuid,
  timestamp,
  integer,
  pgEnum,
  uniqueIndex,
  check,
  index,
  numeric,
} from 'drizzle-orm/pg-core';
import { eventsTable } from './events';
import { usersTable } from './users';
import { sql } from 'drizzle-orm';

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
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('unique_active_booking')
      .on(table.eventId, table.userId)
      .where(sql`${table.status} = 'confirmed'`),
    check('seats_booked_positive', sql`${table.seatsBooked} > 0`),
    index('idx_bookings_user').on(table.userId),
    index('idx_bookings_event').on(table.eventId),
    index('idx_bookings_status').on(table.status),
  ]
);

export type NewBooking = typeof bookingsTable.$inferInsert;
export type Booking = typeof bookingsTable.$inferSelect;
