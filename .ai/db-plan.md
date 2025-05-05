# PostgreSQL Database Schema for HealthyMeal (MVP)

## 1. Tables

### users
This table is managed by Supabase Auth.
```sql
-- Reference only (managed by Supabase Auth)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  -- Additional fields managed by Supabase Auth
);
```

### user_preferences
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  allergies TEXT[] DEFAULT '{}',
  intolerances TEXT[] DEFAULT '{}',
  target_calories INTEGER CHECK (target_calories > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### recipes
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  recipe_data JSONB NOT NULL CHECK (
    jsonb_typeof(recipe_data->'ingredients') = 'array' AND
    jsonb_typeof(recipe_data->'steps') = 'array'
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON COLUMN recipes.recipe_data IS 'JSON structure containing: ingredients array [{name, amount, unit}], steps array [{description}], notes string, calories number (optional)';
```

### error_logs
```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 2. Relationships

- **users** ←1:1→ **user_preferences**: One-to-one relationship via user_id as primary key in user_preferences
- **users** ←1:n→ **recipes**: One-to-many relationship via user_id in recipes
- **users** ←1:n→ **error_logs**: One-to-many relationship via user_id in error_logs

## 3. Indexes

```sql
-- Full-text search index on recipe titles
CREATE INDEX idx_recipes_title ON recipes USING GIN (to_tsvector('english', title));

-- Index for foreign key relationships
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);

-- Index for timestamp sorting (common operation)
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
```

## 4. Row-Level Security Policies

```sql
-- Enable RLS on tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY user_preferences_select ON user_preferences
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY user_preferences_insert ON user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY user_preferences_update ON user_preferences
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY user_preferences_delete ON user_preferences
  FOR DELETE USING (user_id = auth.uid());

-- Recipes policies
CREATE POLICY recipes_select ON recipes
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY recipes_insert ON recipes
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY recipes_update ON recipes
  FOR UPDATE USING (user_id = auth.uid());
  
CREATE POLICY recipes_delete ON recipes
  FOR DELETE USING (user_id = auth.uid());

-- Error logs policies (only admin access for management)
CREATE POLICY error_logs_select ON error_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

## 5. Triggers

```sql
-- Automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_timestamp
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_recipes_timestamp
BEFORE UPDATE ON recipes
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
```

## 6. Additional Notes

1. **Schema Structure:**
   - The database schema focuses on the MVP requirements without adding complexity for future features.
   - JSONB is used for recipe data to provide flexibility while maintaining structure validation.

2. **Data Validation:**
   - Basic validations are implemented at the database level (target_calories > 0, JSON structure)
   - More complex validations (e.g., ingredient amounts > 0) will be handled at the application level.

3. **Security:**
   - Row-Level Security (RLS) ensures users can only access their own data.
   - Error logs are only accessible to administrators.

4. **Performance Considerations:**
   - GIN index on recipe titles enables efficient full-text search.
   - Regular B-tree indexes on foreign keys and timestamp columns optimize common queries.

5. **Scalability:**
   - The schema is designed to handle the MVP requirements efficiently.
   - Advanced features like partitioning, caching, or versioning are intentionally omitted for MVP but can be added later.

6. **Supabase Integration:**
   - The schema leverages Supabase's built-in authentication system.
   - RLS policies are designed to work with Supabase's auth.uid() function. 