import { Router } from 'express';
import { UserPreferencesApiController } from './user-preferences.controller';
import { UserPreferencesResolver } from './user-preferences.resolver';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { ValidationService } from '../../lib/services/validation.service';
import { UserPreferencesService } from '../../lib/services/user-preferences.service';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { AuthService } from '../../lib/services/auth.service';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();

// Apply authentication middleware to all user preferences endpoints
router.use(authMiddleware);

// Initialize services
const supabaseService = new SupabaseService();
const errorLogService = new ErrorLogService(supabaseService);
const authService = new AuthService(supabaseService);
const userPreferencesService = new UserPreferencesService(errorLogService, supabaseService, authService);
const validationService = new ValidationService();

// Initialize controller and resolver
const controller = new UserPreferencesApiController(
  userPreferencesService,
  validationService,
  errorLogService,
  supabaseService,
  authService
);
const resolver = new UserPreferencesResolver(controller);

// Define routes
router.get('/current/preferences', async (req, res) => {
  try {
    const preferences = await resolver.resolveGet(req);
    res.json(preferences);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

router.put('/current/preferences', async (req, res) => {
  try {
    const result = await resolver.resolvePut(req);
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === '401 Unauthorized') {
        res.status(401).json({ error: 'Not authenticated' });
      } else if (error.message.includes('must be')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

export default router; 