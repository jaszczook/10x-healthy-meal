import { Request } from 'express';
import { UserPreferencesApiController } from './user-preferences.controller';
import { UserPreferencesDto } from '../../types/dto';

export class UserPreferencesResolver {
  constructor(private controller: UserPreferencesApiController) {}

  async resolve(req: Request): Promise<UserPreferencesDto> {
    return this.controller.getCurrentUserPreferences();
  }
} 