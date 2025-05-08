# REST API Plan for HealthyMeal

## 1. Resources
- **Users** - Managed by Supabase Auth
- **User Preferences** - Maps to `user_preferences` table
- **Recipes** - Maps to `recipes` table
- **Error Logs** - Maps to `error_logs` table (admin access only)

## 2. Endpoints

### Authentication
*Handled directly by Supabase Auth SDK on the frontend*

### User Preferences

#### GET /api/users/current/preferences
- **Description**: Retrieve current user's dietary preferences
- **Authentication**: Required
- **Response Body**:
  ```json
  {
    "allergies": ["peanuts", "dairy"],
    "intolerances": ["gluten"],
    "target_calories": 2000,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized: Not authenticated
  - 404 Not Found: Preferences not yet created

#### PUT /api/users/current/preferences
- **Description**: Create or update user's dietary preferences
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "allergies": ["peanuts", "dairy"],
    "intolerances": ["gluten"],
    "target_calories": 2000
  }
  ```
- **Response Body**:
  ```json
  {
    "allergies": ["peanuts", "dairy"],
    "intolerances": ["gluten"],
    "target_calories": 2000,
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-02T14:30:00Z"
  }
  ```
- **Success Codes**: 
  - 200 OK: Preferences updated
  - 201 Created: Preferences created for the first time
- **Error Codes**: 
  - 400 Bad Request: Invalid data
  - 401 Unauthorized: Not authenticated

### Recipes

#### GET /api/recipes
- **Description**: Get list of user's recipes with pagination, filtering, and sorting
- **Authentication**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `per_page`: Items per page (default: 10, max: 50)
  - `sort_by`: Sort field (options: title, created_at, updated_at)
  - `sort_direction`: Sort direction (asc, desc)
  - `search`: Text search in title
- **Response Body**:
  ```json
  {
    "total": 25,
    "page": 1,
    "per_page": 10,
    "total_pages": 3,
    "data": [
      {
        "id": "uuid-1",
        "title": "Chocolate Cake",
        "total_calories": 3500,
        "created_at": "2023-06-01T12:00:00Z",
        "updated_at": "2023-06-01T12:00:00Z"
      },
      // More recipes...
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized: Not authenticated

#### GET /api/recipes/:id
- **Description**: Get detailed information about a specific recipe
- **Authentication**: Required
- **Response Body**:
  ```json
  {
    "id": "uuid-1",
    "title": "Chocolate Cake",
    "recipe_data": {
      "ingredients": [
        {"name": "flour", "amount": 2, "unit": "cups"},
        {"name": "sugar", "amount": 1.5, "unit": "cups"},
        // More ingredients...
      ],
      "steps": [
        {"description": "Preheat oven to 350F"},
        {"description": "Mix dry ingredients"},
        // More steps...
      ],
      "notes": "Best served with ice cream",
      "calories": 3500
    },
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized: Not authenticated
  - 403 Forbidden: Not authorized to access this recipe
  - 404 Not Found: Recipe not found

#### POST /api/recipes
- **Description**: Create a new recipe
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "Chocolate Cake",
    "recipe_data": {
      "ingredients": [
        {"name": "flour", "amount": 2, "unit": "cups"},
        {"name": "sugar", "amount": 1.5, "unit": "cups"},
        // More ingredients...
      ],
      "steps": [
        {"description": "Preheat oven to 350F"},
        {"description": "Mix dry ingredients"},
        // More steps...
      ],
      "notes": "Best served with ice cream",
      "calories": 3500
    }
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "newly-generated-uuid",
    "title": "Chocolate Cake",
    "recipe_data": {
      // Same as request
    },
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 
  - 400 Bad Request: Invalid data
  - 401 Unauthorized: Not authenticated

#### PUT /api/recipes/:id
- **Description**: Update an existing recipe
- **Authentication**: Required
- **Request Body**: *Same as POST /api/recipes*
- **Response Body**: *Same as GET /api/recipes/:id*
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 400 Bad Request: Invalid data
  - 401 Unauthorized: Not authenticated
  - 403 Forbidden: Not authorized to update this recipe
  - 404 Not Found: Recipe not found

#### DELETE /api/recipes/:id
- **Description**: Delete a recipe
- **Authentication**: Required
- **Response Body**: Empty
- **Success Codes**: 204 No Content
- **Error Codes**: 
  - 401 Unauthorized: Not authenticated
  - 403 Forbidden: Not authorized to delete this recipe
  - 404 Not Found: Recipe not found

#### POST /api/recipes/parse
- **Description**: Parse a plain text recipe into structured JSON using AI
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "recipe_text": "Plain text recipe content..."
  }
  ```
- **Response Body**:
  ```json
  {
    "title": "Detected Recipe Title",
    "recipe_data": {
      "ingredients": [
        {"name": "detected ingredient", "amount": 2, "unit": "cups"},
        // More ingredients...
      ],
      "steps": [
        {"description": "Detected step 1"},
        // More steps...
      ],
      "notes": "Any detected notes",
      "calories": 1500
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 400 Bad Request: Invalid data or empty text
  - 401 Unauthorized: Not authenticated
  - 408 Request Timeout: AI processing timed out (> 60s)
  - 500 Internal Server Error: AI processing failed

#### POST /api/recipes/:id/validate
- **Description**: Validate recipe JSON structure without saving
- **Authentication**: Required
- **Request Body**: *Same as recipe_data in POST /api/recipes*
- **Response Body**:
  ```json
  {
    "valid": true,
    "errors": [] 
  }
  ```
  Or if invalid:
  ```json
  {
    "valid": false,
    "errors": [
      {
        "field": "ingredients[0].amount",
        "message": "Amount must be greater than 0"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized: Not authenticated

### Error Logs (Admin Only)

#### GET /api/admin/error-logs
- **Description**: Retrieve error logs (admin access only)
- **Authentication**: Required with admin role
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `per_page`: Items per page (default: 20, max: 100)
  - `start_date`: Filter by start date
  - `end_date`: Filter by end date
  - `user_id`: Filter by user ID
- **Response Body**:
  ```json
  {
    "total": 120,
    "page": 1,
    "per_page": 20,
    "total_pages": 6,
    "data": [
      {
        "id": "uuid-1",
        "user_id": "user-uuid-1",
        "message": "AI request timed out",
        "created_at": "2023-06-01T12:00:00Z"
      },
      // More logs...
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized: Not authenticated
  - 403 Forbidden: Not authorized (not an admin)

## 3. Authentication and Authorization

### Authentication
- **Mechanism**: JWT-based authentication provided by Supabase Auth
- **Implementation Details**:
  - Frontend uses Supabase's client SDK for signup/login/logout
  - Backend validates JWT tokens on all protected endpoints
  - Tokens are passed in Authorization header with Bearer scheme

### Authorization
- **Mechanism**: Row Level Security (RLS) in Supabase
- **Implementation Details**:
  - Recipes: Users can only access their own recipes
  - User Preferences: Users can only access their own preferences
  - Error Logs: Only admin users can access

## 4. Validation and Business Logic

### Validation Rules

#### User Preferences
- `allergies` and `intolerances` must be arrays (can be empty)
- `target_calories` must be a positive integer (greater than 0)

#### Recipes
- `title` is required and must be a string between 1-255 characters
- `recipe_data` must be a valid JSON with:
  - `ingredients` must be an array containing at least one item
  - Each ingredient must have `name` (string), `amount` (number > 0), and `unit` (string)
  - `steps` must be an array containing at least one item
  - Each step must have a `description` (string)
  - `notes` is optional (string)
  - `calories` is optional (number >= 0)

### Business Logic Implementation

#### AI Recipe Parsing
- When a plain text recipe is submitted to `/api/recipes/parse`:
  1. Validate that text is not empty
  2. Send to OpenRouter.ai for AI processing
  3. Set 60-second timeout
  4. On success, return structured JSON
  5. On failure or timeout, log error and return appropriate error message

#### Recipe Access Control
- All recipe endpoints enforce access control through Supabase RLS
- Only recipe owners can view, edit, or delete their recipes
- Attempting to access another user's recipe returns 403 Forbidden

#### Error Logging
- All API errors, especially AI-related errors, are logged to the `error_logs` table
- Logs include user ID, error message, and timestamp
- Admin endpoints are available for monitoring errors 