import { Router } from 'express';
import { RecipesResolver } from './recipes.resolver';
import { RecipesApiController } from './recipes.controller';
import { RecipesService } from '../../lib/services/recipes.service';
import { ValidationService } from '../../lib/services/validation.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { OpenRouterBackendService } from '../../lib/services/openrouter/openrouter-backend.service';
import { AuthService } from '../../lib/services/auth.service';
import { authMiddleware } from '../auth/auth.middleware';
import { validateParseRecipeCommand } from './recipes.validator';

const router = Router();

// Apply authentication middleware to all recipe endpoints
router.use(authMiddleware);

// Initialize services
const supabaseService = new SupabaseService();
const errorLogService = new ErrorLogService(supabaseService);
const openRouterService = new OpenRouterBackendService();
const authService = new AuthService(supabaseService);
const recipesService = new RecipesService(errorLogService, supabaseService, openRouterService, authService);
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
    const result = await controller.getRecipe(req, req.params.id);
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
    const result = await controller.createRecipe(req, req.body);
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

router.post('/parse', validateParseRecipeCommand, async (req, res) => {
  try {
    const result = await controller.parseRecipe(req, req.body.recipe_text);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else if (error.message === '408 Request Timeout') {
        res.status(408).json({ error: 'AI processing timed out after 60 seconds' });
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
    await controller.deleteRecipe(req, req.params.id);
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

router.put('/:id', async (req, res) => {
  try {
    const result = await controller.updateRecipe(req, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else if (error.message === '404 Not Found') {
        res.status(404).json({ error: 'Recipe not found' });
      } else if (error.message.startsWith('400')) {
        res.status(400).json({ error: error.message.replace('400 ', '') });
      } else if (error.message.includes('403 Forbidden')) {
        res.status(403).json({ error: 'Insufficient permissions' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

router.post('/:id/validate', async (req, res) => {
  try {
    const result = await controller.validateRecipe(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else if (error.message === '404 Not Found') {
        res.status(404).json({ error: 'Recipe not found' });
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

export default router; 