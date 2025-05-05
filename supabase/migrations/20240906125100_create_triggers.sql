-- Migration: Create triggers for HealthyMeal MVP
-- Description: Creates triggers for automatic timestamp updates
-- Date: 2024-09-06
-- Author: AI-assisted

-- function to automatically update the updated_at timestamp
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

comment on function update_modified_column() is 'Trigger function to automatically update updated_at timestamp on row update';

-- apply triggers for timestamp updates
create trigger update_user_preferences_timestamp
before update on user_preferences
for each row execute procedure update_modified_column();

comment on trigger update_user_preferences_timestamp on user_preferences is 'Updates the updated_at timestamp when preferences are modified';

create trigger update_recipes_timestamp
before update on recipes
for each row execute procedure update_modified_column();

comment on trigger update_recipes_timestamp on recipes is 'Updates the updated_at timestamp when recipes are modified'; 