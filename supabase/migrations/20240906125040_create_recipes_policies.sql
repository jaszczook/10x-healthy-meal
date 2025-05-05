-- Migration: Create RLS policies for recipes
-- Description: Creates granular Row Level Security policies for recipes table
-- Date: 2024-09-06
-- Author: AI-assisted

-- authenticated users can only see their own recipes
create policy "Authenticated users can view their own recipes" on recipes
  for select
  to authenticated
  using (user_id = auth.uid());

-- anon users cannot select recipes
create policy "Anonymous users cannot view recipes" on recipes
  for select
  to anon
  using (false);

-- authenticated users can insert their own recipes
create policy "Authenticated users can create their own recipes" on recipes
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- anon users cannot insert recipes
create policy "Anonymous users cannot create recipes" on recipes
  for insert
  to anon
  with check (false);

-- authenticated users can update their own recipes
create policy "Authenticated users can update their own recipes" on recipes
  for update
  to authenticated
  using (user_id = auth.uid());

-- anon users cannot update recipes
create policy "Anonymous users cannot update recipes" on recipes
  for update
  to anon
  using (false);

-- authenticated users can delete their own recipes
create policy "Authenticated users can delete their own recipes" on recipes
  for delete
  to authenticated
  using (user_id = auth.uid());

-- anon users cannot delete recipes
create policy "Anonymous users cannot delete recipes" on recipes
  for delete
  to anon
  using (false); 