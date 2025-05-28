import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, firstValueFrom, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
}

interface AuthState {
  user?: User;
  session?: {
    user: User;
    access_token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly authStateSubject = new BehaviorSubject<AuthState | null>(null);
  readonly authState$ = this.authStateSubject.asObservable();
  readonly isLoggedIn$ = this.authState$.pipe(
    map(state => {
      const user = state?.user || state?.session?.user;
      return !!user && user.role === 'authenticated';
    })
  );
  private authInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        const state = await firstValueFrom(this.checkSession());
        this.authStateSubject.next(state);
      } catch (error) {
        this.authStateSubject.next(null);
      } finally {
        this.authInitialized = true;
      }
    })();

    return this.initializationPromise;
  }

  login(email: string, password: string): Observable<AuthState> {
    return this.http.post<AuthState>('/api/auth/login', { email, password }).pipe(
      tap(state => {
        this.authStateSubject.next(state);
        this.authInitialized = true;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => {
        this.authStateSubject.next(null);
        this.router.navigate(['/auth']);
      }),
      catchError(error => {
        console.error('Logout failed:', error);
        // Even if the server request fails, we should still clear the local state
        this.authStateSubject.next(null);
        this.router.navigate(['/auth']);
        return of(void 0);
      })
    );
  }

  private checkSession(): Observable<AuthState> {
    return this.http.get<AuthState>('/api/auth/session');
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authInitialized) {
      await this.initializeAuth();
    }
    const state = this.authStateSubject.value;
    const user = state?.user || state?.session?.user;
    return !!user && user.role === 'authenticated';
  }

  getCurrentUser(): User | null {
    const state = this.authStateSubject.value;
    return state?.user || state?.session?.user || null;
  }
} 