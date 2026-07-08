ALTER TABLE "bookings" DROP CONSTRAINT "bookings_event_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "total_price" numeric(10, 2) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_booking" ON "bookings" USING btree ("event_id","user_id") WHERE "bookings"."status" = 'confirmed';--> statement-breakpoint
CREATE INDEX "idx_bookings_user" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_event" ON "bookings" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_bookings_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_refresh_token_user" ON "refresh_token" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role_id";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "seats_booked_positive" CHECK ("bookings"."seats_booked" > 0);