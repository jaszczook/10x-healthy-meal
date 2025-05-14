import express from 'express';
import cors from 'cors';
import healthRoutes from '../src/api/recipes/health.routes';
import recipesRoutes from '../src/api/recipes/recipes.routes';

const app = express();
const port = process.env['PORT'] || 3000;

// Enable CORS for Angular development server
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing JSON bodies
app.use(express.json());

// Mount routes
app.use('/api/health', healthRoutes);
app.use('/api/recipes', recipesRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 