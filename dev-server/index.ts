import express from 'express';
import mealRoutes from '../src/routes';

const app = express();
const port = process.env['PORT'] || 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// Mount routes
app.use('/api', mealRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 