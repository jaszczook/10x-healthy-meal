import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserPreferencesDto, UserPreferencesCommandModel } from '../../../../types/dto';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly apiUrl = 'api/users/current/preferences';

  constructor(private readonly http: HttpClient) {}

  getCurrentUserPreferences(): Observable<UserPreferencesDto> {
    return this.http.get<UserPreferencesDto>(this.apiUrl);
  }

  updateCurrentUserPreferences(preferences: UserPreferencesCommandModel): Observable<UserPreferencesDto> {
    return this.http.put<UserPreferencesDto>(this.apiUrl, preferences);
  }
} 