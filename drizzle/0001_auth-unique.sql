DROP INDEX "watch_history_user_title_idx";--> statement-breakpoint
DROP INDEX "watchlist_user_title_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "watch_history_user_title_unique" ON "watch_history" USING btree ("user_id","title_id");--> statement-breakpoint
CREATE UNIQUE INDEX "watchlist_user_title_unique" ON "watchlist" USING btree ("user_id","title_id");