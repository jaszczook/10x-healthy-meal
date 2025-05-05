-- Migration: Create indexes for HealthyMeal MVP
-- Description: Creates indexes for optimized queries
-- Date: 2024-09-06
-- Author: AI-assisted

-- full-text search index on recipe titles
create index idx_recipes_title on recipes using gin (to_tsvector('english', title));
comment on index idx_recipes_title is 'Full-text search index for recipe titles';

-- indexes for foreign key relationships for better join performance
create index idx_recipes_user_id on recipes(user_id);
comment on index idx_recipes_user_id is 'Index for recipe-user relationship queries';

create index idx_error_logs_user_id on error_logs(user_id);
comment on index idx_error_logs_user_id is 'Index for error logs filtering by user';

-- indexes for timestamp sorting (common operation)
create index idx_recipes_created_at on recipes(created_at desc);
comment on index idx_recipes_created_at is 'Index for querying recipes by creation time';

create index idx_error_logs_created_at on error_logs(created_at desc);
comment on index idx_error_logs_created_at is 'Index for sorting error logs by time'; 