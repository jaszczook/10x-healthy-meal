# Project Structure Guide for AI Agents

This document describes the structure and organization of the 10x-healthy-meal project, which is an Angular-based web application with TypeScript and Angular Material.

## Directory Structure

```
src/
├── api/           # Backend API endpoints and controllers
├── app/          # Frontend application code
│   ├── features/ # Feature modules and components
│   ├── app.component.ts    # Root component
│   ├── app.routes.ts       # Application routing
│   └── app.config.ts       # App configuration
├── db/           # Supabase clients and database interactions
├── environments/ # Environment-specific configuration
├── lib/          # Backend core business logic
├── types/        # TypeScript type definitions and interfaces
├── main.ts       # Main entry point
├── main.server.ts # Server-side rendering entry point
└── styles.scss   # Global styles
```

## Key Directories and Their Purpose

### src/api
Contains backend API-related code, including:
- API endpoint controllers and route definitions
- Request/response handlers
- API middleware
- API documentation
- Input validation
Note: This directory focuses on the HTTP layer and request handling, while the actual business logic resides in `src/lib`

### src/app
The frontend application directory containing:
- Root component and configuration
- Routing setup
- Feature modules and components
- Page layouts and templates
- Frontend services and state management
- UI/UX implementation

### src/lib
Backend core business logic:
- Service implementations
- Business rules and domain logic
- Data processing and transformation
- Core backend functionality
- Reusable backend utilities
Note: This directory contains the actual implementation of business logic that the API endpoints in `src/api` expose

### src/db
Database-related code:
- Supabase client configuration
- Database models and schemas
- Query builders and helpers
- Database utilities

### src/types
Shared TypeScript types used across the application:
- Interface definitions
- Type declarations
- DTOs (Data Transfer Objects)
- Enums and constants

### src/environments
Environment-specific configuration:
- Development settings
- Production settings
- Testing configurations
- Environment variables

## Coding Guidelines

When working with this project structure:

1. **Feature Organization**
   - Place new features in `src/app/features/`
   - Each feature should be a self-contained module
   - Follow Angular's feature module pattern

2. **Type Definitions**
   - Place shared types in `src/types/`
   - Feature-specific types go in their respective feature modules
   - Use consistent naming conventions for interfaces and types

3. **Services and Utilities**
   - Global services go in `src/lib/`
   - Feature-specific services stay within feature modules
   - Utility functions should be grouped by domain

4. **Database Operations**
   - All Supabase interactions go in `src/db/`
   - Keep database logic separate from UI components
   - Use typed queries and responses

5. **API Integration**
   - Keep API-related code in `src/api/`
   - Use strongly typed request/response models
   - Implement proper error handling

## Best Practices

1. **Module Organization**
   - Keep modules focused and single-responsibility
   - Use lazy loading for feature modules
   - Implement proper module separation

2. **Component Structure**
   - Follow Angular's component best practices
   - Use smart/dumb component pattern
   - Implement proper component lifecycle management

3. **State Management**
   - Use services for state management
   - Implement proper data flow patterns
   - Follow reactive programming principles

4. **Error Handling**
   - Implement proper error boundaries
   - Use typed error handling
   - Provide user-friendly error messages

5. **Testing**
   - Place tests alongside the code they test
   - Follow Angular's testing patterns
   - Maintain high test coverage

## Important Notes for AI Agents

1. When modifying code:
   - Respect the existing directory structure
   - Follow the established patterns
   - Maintain type safety
   - Consider SSR implications

2. When creating new features:
   - Use the feature module pattern
   - Place in appropriate directories
   - Include necessary tests
   - Update relevant documentation

3. When handling data:
   - Use proper typing
   - Implement error handling
   - Consider edge cases
   - Follow data flow patterns 