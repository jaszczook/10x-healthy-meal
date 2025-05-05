-- Migration: Create RLS policies for user_preferences
-- Description: Creates granular Row Level Security policies for user_preferences table
-- Date: 2024-09-06
-- Author: AI-assisted

-- authenticated users can only see their own preferences
create policy "Authenticated users can view their own preferences" on user_preferences
  for select
  to authenticated
  using (user_id = auth.uid());

-- anon users cannot select user preferences  
create policy "Anonymous users cannot view user preferences" on user_preferences
  for select
  to anon
  using (false);

-- authenticated users can insert their own preferences
create policy "Authenticated users can create their own preferences" on user_preferences
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- anon users cannot insert user preferences
create policy "Anonymous users cannot create user preferences" on user_preferences
  for insert
  to anon
  with check (false);

-- authenticated users can update their own preferences
create policy "Authenticated users can update their own preferences" on user_preferences
  for update
  to authenticated
  using (user_id = auth.uid());

-- anon users cannot update user preferences
create policy "Anonymous users cannot update user preferences" on user_preferences
  for update
  to anon
  using (false);

-- authenticated users can delete their own preferences
create policy "Authenticated users can delete their own preferences" on user_preferences
  for delete
  to authenticated
  using (user_id = auth.uid());

-- anon users cannot delete user preferences
create policy "Anonymous users cannot delete user preferences" on user_preferences
  for delete
  to anon
  using (false); 