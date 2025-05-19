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

export default router; 