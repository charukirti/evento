ALTER TABLE "events" DROP CONSTRAINT "events_organizer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_organizers_user_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("user_id") ON DELETE restrict ON UPDATE no action;