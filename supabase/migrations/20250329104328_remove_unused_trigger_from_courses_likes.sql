-- Reason: This removes the update_timestamps_trigger from courses_likes.
-- The table does not use an `updated_at` column and should not include one, as it should only be inserted or deleted.
-- Keeping the trigger causes a runtime error during inserts or updates: "record 'new' has no field 'updated_at'".
-- Since the column is unnecessary and unused, the correct fix is to remove the trigger rather than add the column.

DROP TRIGGER IF EXISTS update_timestamps_trigger 
ON "public"."courses_likes";