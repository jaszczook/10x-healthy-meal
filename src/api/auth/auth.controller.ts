import { Request, Response } from 'express';
import { AuthService } from '../../lib/services/auth.service';
import { ErrorLogService } from '../../lib/services/error-log.service';

export class AuthController {
  constructor(
    private authService: AuthService,
    private errorLogService: ErrorLogService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { session, user } = await this.authService.signInWithPassword(email, password);
      this.setSessionCookies(res, session);
      res.json({ user });
    } catch (error: any) {
      await this.handleAuthError(error, res);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, redirectUrl } = req.body;
      await this.authService.signUp(email, password, redirectUrl);
      res.status(201).json({ message: 'Verification email sent' });
    } catch (error: any) {
      await this.handleAuthError(error, res);
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await this.authService.getSession(req);
      res.json({ session });
    } catch (error: any) {
      await this.handleAuthError(error, res);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      await this.authService.signOut();
      this.clearSessionCookies(res);
      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      await this.handleAuthError(error, res);
    }
  }

  private setSessionCookies(res: Response, session: any): void {
    const cookieDomain = process.env['COOKIE_DOMAIN'] || 'localhost';
    res.cookie('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: cookieDomain,
      maxAge: 3600 * 1000
    });
    res.cookie('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: cookieDomain,
      maxAge: 7 * 24 * 3600 * 1000
    });
  }

  private clearSessionCookies(res: Response): void {
    const cookieDomain = process.env['COOKIE_DOMAIN'] || 'localhost';
    res.clearCookie('sb-access-token', { domain: cookieDomain });
    res.clearCookie('sb-refresh-token', { domain: cookieDomain });
  }

  private async handleAuthError(error: any, res: Response): Promise<void> {
    await this.errorLogService.logError('auth_error', error);
    const statusCode = this.mapErrorToStatusCode(error);
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({ error: message });
  }

  private mapErrorToStatusCode(error: any): number {
    switch (error.message) {
      case 'Invalid login credentials':
        return 401;
      case 'User not found':
        return 404;
      case 'User already registered':
        return 409;
      case 'Invalid data':
        return 422;
      default:
        return 500;
    }
  }
} 