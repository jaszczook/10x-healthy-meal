import { Request, Response, NextFunction } from 'express';
import { ParseRecipeCommandModel } from '../../types/dto';

export const validateParseRecipeCommand = (req: Request, res: Response, next: NextFunction): void => {
  const { recipe_text } = req.body as ParseRecipeCommandModel;

  if (!recipe_text || typeof recipe_text !== 'string' || recipe_text.trim().length === 0) {
    res.status(400).json({ error: 'Recipe text is required and cannot be empty' });
    return;
  }

  next();
}; 