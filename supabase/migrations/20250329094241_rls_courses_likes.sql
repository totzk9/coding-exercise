CREATE POLICY "Enable users to view their own `courses_likes` data only"
ON "public"."courses_likes" FOR SELECT
TO authenticated
USING (
    user_id = (
        SELECT id FROM "public"."users" WHERE auth_user_id = auth.uid()
    )
);