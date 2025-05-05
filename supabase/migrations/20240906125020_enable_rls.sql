-- Migration: Enable Row Level Security for HealthyMeal MVP
-- Description: Enables RLS on all tables
-- Date: 2024-09-06
-- Author: AI-assisted

-- enable row level security on all tables
alter table user_preferences enable row level security;
alter table recipes enable row level security;
alter table error_logs enable row level security; 