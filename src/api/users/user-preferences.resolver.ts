import { Request } from 'express';
import { UserPreferencesApiController } from './user-preferences.controller';
import { UserPreferencesDto } from '../../types/dto';

export class UserPreferencesResolver {
  constructor(private controller: UserPreferencesApiController) {}

  async resolveGet(req: Request): Promise<UserPreferencesDto> {
    return this.controller.getCurrentUserPreferences(req);
  }

  async resolvePut(req: Request): Promise<UserPreferencesDto> {
    const preferences = req.body;
    return this.controller.updatePreferences(req, preferences);
  }
} 