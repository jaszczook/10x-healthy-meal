-- Migration: Insert example data
-- Description: Populates tables with example data for development and testing
-- Date: 2024-09-06
-- Author: AI-assisted

-- First, create test users in auth.users
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values 
  ('00000000-0000-0000-0000-000000000001', 'test1@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'test2@example.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'test3@example.com', crypt('password123', gen_salt('bf')), now(), now(), now());

-- Insert example user preferences
insert into user_preferences (user_id, allergies, intolerances, target_calories)
values 
  ('00000000-0000-0000-0000-000000000001', array['peanuts', 'shellfish'], array['lactose'], 2000),
  ('00000000-0000-0000-0000-000000000002', array['tree nuts'], array['gluten'], 1800),
  ('00000000-0000-0000-0000-000000000003', array['eggs'], array['fructose'], 2200);

-- Insert example recipes
insert into recipes (user_id, title, recipe_data)
values 
  ('00000000-0000-0000-0000-000000000001', 'Healthy Quinoa Bowl', 
    jsonb_build_object(
      'ingredients', jsonb_build_array(
        jsonb_build_object('name', 'quinoa', 'amount', 1, 'unit', 'cup'),
        jsonb_build_object('name', 'chickpeas', 'amount', 1, 'unit', 'can'),
        jsonb_build_object('name', 'avocado', 'amount', 1, 'unit', 'whole'),
        jsonb_build_object('name', 'olive oil', 'amount', 2, 'unit', 'tbsp')
      ),
      'steps', jsonb_build_array(
        jsonb_build_object('description', 'Cook quinoa according to package instructions'),
        jsonb_build_object('description', 'Drain and rinse chickpeas'),
        jsonb_build_object('description', 'Slice avocado'),
        jsonb_build_object('description', 'Combine all ingredients and drizzle with olive oil')
      ),
      'notes', 'Great for meal prep!',
      'calories', 450
    )
  ),
  ('00000000-0000-0000-0000-000000000002', 'Gluten-Free Pasta Primavera',
    jsonb_build_object(
      'ingredients', jsonb_build_array(
        jsonb_build_object('name', 'gluten-free pasta', 'amount', 8, 'unit', 'oz'),
        jsonb_build_object('name', 'bell peppers', 'amount', 2, 'unit', 'whole'),
        jsonb_build_object('name', 'zucchini', 'amount', 1, 'unit', 'whole'),
        jsonb_build_object('name', 'olive oil', 'amount', 3, 'unit', 'tbsp')
      ),
      'steps', jsonb_build_array(
        jsonb_build_object('description', 'Cook pasta according to package instructions'),
        jsonb_build_object('description', 'Slice vegetables'),
        jsonb_build_object('description', 'Sauté vegetables in olive oil'),
        jsonb_build_object('description', 'Combine with pasta and season to taste')
      ),
      'notes', 'Use any seasonal vegetables you have on hand',
      'calories', 380
    )
  );

-- Insert example error logs
insert into error_logs (user_id, message)
values 
  ('00000000-0000-0000-0000-000000000001', 'Failed to load recipe data: Network timeout'),
  ('00000000-0000-0000-0000-000000000002', 'Error updating user preferences: Invalid calorie value'),
  (null, 'System error: Database connection pool exhausted'); 