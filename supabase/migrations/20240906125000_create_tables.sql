-- Migration: Create tables for HealthyMeal MVP
-- Description: Creates user_preferences, recipes, and error_logs tables
-- Date: 2024-09-06
-- Author: AI-assisted

-- user preferences table to store user dietary requirements
create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  allergies text[] default '{}',
  intolerances text[] default '{}',
  target_calories integer check (target_calories > 0),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table user_preferences is 'Stores user dietary preferences and restrictions';
comment on column user_preferences.allergies is 'Array of food allergies the user has';
comment on column user_preferences.intolerances is 'Array of food intolerances the user has';
comment on column user_preferences.target_calories is 'Target daily caloric intake for the user';

-- recipes table to store user-created recipes
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title varchar(255) not null,
  recipe_data jsonb not null check (
    jsonb_typeof(recipe_data->'ingredients') = 'array' and
    jsonb_typeof(recipe_data->'steps') = 'array'
  ),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table recipes is 'User-created recipes with ingredients and preparation steps';
comment on column recipes.title is 'Title of the recipe';
comment on column recipes.recipe_data is 'JSON structure containing: ingredients array [{name, amount, unit}], steps array [{description}], notes string, calories number (optional)';

-- error logs for system diagnostics and monitoring
create table error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  created_at timestamp with time zone default now()
);

comment on table error_logs is 'System error logs for diagnostics and monitoring';
comment on column error_logs.user_id is 'ID of the user who encountered the error (nullable for system errors)';
comment on column error_logs.message is 'Error message or details'; 