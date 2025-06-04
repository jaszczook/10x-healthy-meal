import { Router } from 'express';
import { RecipesResolver } from './recipes.resolver';
import { RecipesApiController } from './recipes.controller';
import { RecipesService } from '../../lib/services/recipes.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// Apply authentication middleware to all recipe endpoints
router.use(authMiddleware);

// Initialize services
const supabaseService = new SupabaseService();
const errorLogService = new ErrorLogService(supabaseService);
const recipesService = new RecipesService(errorLogService, supabaseService);
const validationService = new ValidationService();

// Initialize controller and resolver
const controller = new RecipesApiController(
  recipesService,
  validationService,
  errorLogService,
  supabaseService
);
const resolver = new RecipesResolver(controller);

router.get('/', async (req, res) => {
  try {
    const result = await resolver.resolve(req);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === '401 Unauthorized') {
      res.status(401).json({ error: 'Not authenticated' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await controller.getRecipe(req.params.id);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else if (error.message === '404 Not Found') {
        res.status(404).json({ error: 'Recipe not found' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await controller.createRecipe(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else if (error.message.startsWith('400')) {
        res.status(400).json({ error: error.message.replace('400 ', '') });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await controller.deleteRecipe(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else if (error.message === '404 Not Found') {
        res.status(404).json({ error: 'Recipe not found' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router; 