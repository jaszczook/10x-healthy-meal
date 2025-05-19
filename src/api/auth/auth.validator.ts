// File does not exist yet; creating auth validators
import { Request, Response, NextFunction } from 'express';

// Minimal manual validation without external libraries
export function validateLoginDto(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body;
  if (typeof email !== 'string' || !email.includes('@') ||
      typeof password !== 'string' || password.length < 6) {
    res.status(422).json({ error: 'Invalid login data' });
    return;
  }
  next();
}

export function validateRegisterDto(req: Request, res: Response, next: NextFunction): void {
  const { email, password, redirectUrl } = req.body;
  if (typeof email !== 'string' || !email.includes('@') ||
      typeof password !== 'string' || password.length < 6 ||
      typeof redirectUrl !== 'string') {
    res.status(422).json({ error: 'Invalid registration data' });
    return;
  }
  next();
} 