-- Migration: Create RLS policies for error_logs
-- Description: Creates granular Row Level Security policies for error_logs table
-- Date: 2024-09-06
-- Author: AI-assisted

-- only administrators can view error logs
-- this policy refers to the 'role' claim in the JWT
create policy "Admins can view error logs" on error_logs
  for select
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin');

-- anon users cannot select error logs
create policy "Anonymous users cannot view error logs" on error_logs
  for select
  to anon
  using (false);

-- system can insert error logs for any user
-- note: insert will be performed by service role in the application
create policy "System can create error logs" on error_logs
  for insert
  to authenticated
  with check (true);

-- anon users cannot insert error logs
create policy "Anonymous users cannot create error logs" on error_logs
  for insert
  to anon
  with check (false);

-- only administrators can update error logs
create policy "Admins can update error logs" on error_logs
  for update
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin');

-- anon users cannot update error logs
create policy "Anonymous users cannot update error logs" on error_logs
  for update
  to anon
  using (false);

-- only administrators can delete error logs
create policy "Admins can delete error logs" on error_logs
  for delete
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin');

-- anon users cannot delete error logs
create policy "Anonymous users cannot delete error logs" on error_logs
  for delete
  to anon
  using (false); 