import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly authStateSubject = new BehaviorSubject<AuthState | null>(null);
  readonly authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.checkSession().subscribe();
  }

  login(email: string, password: string): Observable<AuthState> {
    return this.http.post<AuthState>('/api/auth/login', { email, password }).pipe(
      tap(state => {
        this.authStateSubject.next(state);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => {
        this.authStateSubject.next(null);
        this.router.navigate(['/auth']);
      })
    );
  }

  private checkSession(): Observable<AuthState> {
    return this.http.get<AuthState>('/api/auth/session').pipe(
      tap(state => this.authStateSubject.next(state))
    );
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value?.user || null;
  }
} 