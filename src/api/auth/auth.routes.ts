import { Router } from 'express';
import { AuthController } from './auth.controller';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { AuthService } from '../../lib/services/auth.service';
import { ErrorLogService } from '../../lib/services/error-log.service';
import { validateLoginDto, validateRegisterDto } from './auth.validator';

const router = Router();

// Initialize services and controller
const supabaseService = new SupabaseService();
const errorLogService = new ErrorLogService(supabaseService);
const authService = new AuthService(supabaseService);
const controller = new AuthController(authService, errorLogService);

// Public routes
router.post('/login', validateLoginDto, (req, res) => controller.login(req, res));
router.post('/register', validateRegisterDto, (req, res) => controller.register(req, res));

// Protected routes (cookie-based session)
router.get('/session', (req, res) => controller.getSession(req, res));
router.post('/logout', (req, res) => controller.logout(req, res));

export default router; 