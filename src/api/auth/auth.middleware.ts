import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../../lib/supabase/supabase.service';
import { AuthService } from '../../lib/services/auth.service';

// Initialize services
const supabaseService = new SupabaseService();
const authService = new AuthService(supabaseService);

/**
 * Middleware to ensure the user is authenticated.
 * Checks session via AuthService.getSession and returns 401 if not authenticated.
 * Skips authentication check for OPTIONS requests.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Skip authentication check for OPTIONS requests
  if (req.method === 'OPTIONS') {
    next();
    return;
  }

  try {
    // Throws if no active session
    await authService.getSession(req);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authenticated' });
  }
} 