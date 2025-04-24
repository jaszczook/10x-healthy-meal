# 10xHealthyMeal

AI-powered recipe management platform for personalized meal planning and nutritional tracking.

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

HealthyMeal is a web-based tool that helps users store and personalize recipes using AI while considering their dietary preferences. The platform allows users to paste unformatted recipes, which are then processed into structured JSON format, enabling easy editing, portion scaling, and nutritional analysis before final saving.

### Key Features
- User authentication and profile management
- AI-powered recipe parsing and structuring
- Dietary preference tracking (allergies, intolerances, calorie goals)
- Recipe CRUD operations with nutritional analysis
- Calorie estimation with ±10% accuracy tolerance

## Tech Stack

### Frontend
- Angular 19
- TypeScript 5
- Tailwind 4
- Angular Material

### Backend
- Supabase
  - PostgreSQL database
  - Authentication
  - Backend-as-a-Service SDK

### AI Integration
- Openrouter.ai for AI model access
- Support for multiple AI providers (OpenAI, Anthropic, Google)

### Infrastructure
- GitHub Actions for CI/CD
- DigitalOcean for hosting
- Docker containerization

## Getting Started

### Prerequisites
- Node.js (version specified in .nvmrc)
- npm or yarn
- Supabase account
- Openrouter.ai API key

### Installation
1. Clone the repository
```bash
git clone https://github.com/your-username/healthy-meal.git
cd healthy-meal
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

4. Start the development server
```bash
npm start
```

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the application for production
- `npm test` - Run tests
- `npm run lint` - Run linting
- `npm run format` - Format code

## Project Scope

### MVP Features
- User authentication and session management
- Recipe CRUD operations
- AI-powered recipe parsing
- Nutritional preference management
- Calorie tracking and estimation

### Current Limitations
- No URL recipe import
- No media support (images, videos)
- No recipe sharing
- No social features
- No JSON export/import
- No schema versioning
- No email notifications
- No pre-release usability testing

## Project Status

### Development Phase
The project is currently in active development, focusing on implementing core MVP features.

### Success Metrics
- 90% of active users with completed dietary preferences
- 75% weekly recipe generation rate
- AI response time ≤60s in 95% of cases
- Calorie estimation accuracy within ±10%
- AI error rate <5% of all calls

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
