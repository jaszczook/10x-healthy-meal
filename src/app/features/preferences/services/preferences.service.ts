import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserPreferencesDto, UserPreferencesCommandModel } from '../../../../types/dto';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly apiUrl = 'api/users/current/preferences';

  constructor(private readonly http: HttpClient) {}

  getCurrentUserPreferences(): Observable<UserPreferencesDto> {
    console.log('GET request to preferences');
    return this.http.get<UserPreferencesDto>(this.apiUrl).pipe(
      tap(() => console.log('GET request completed'))
    );
  }

  updateCurrentUserPreferences(preferences: UserPreferencesCommandModel): Observable<UserPreferencesDto> {
    console.log('PUT request to preferences', preferences);
    return this.http.put<UserPreferencesDto>(this.apiUrl, preferences).pipe(
      tap(() => console.log('PUT request completed'))
    );
  }
} 