# Specyfikacja architektury autentykacji dla HealthyMeal

## 1. Architektura interfejsu użytkownika

### 1.1. Komponenty autentykacji

#### AuthModule (Lazy-loaded)
```typescript
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  declarations: [
    AuthPageComponent,
    LoginFormComponent,
    RegisterFormComponent,
    PasswordResetFormComponent
  ]
})
export class AuthModule {}
```

#### Struktura komponentów
- **AuthPageComponent** (`/auth`)
  - Kontener dla formularzy autentykacji
  - Zarządzanie stanem widoku (login/register/reset)
  - Integracja z Supabase Auth UI
  - Obsługa przekierowań po zalogowaniu

- **LoginFormComponent**
  - Formularz logowania (email + hasło)
  - Walidacja pól
  - Obsługa błędów logowania
  - Link do resetowania hasła

- **RegisterFormComponent**
  - Formularz rejestracji (email + hasło + potwierdzenie)
  - Walidacja złożoności hasła
  - Walidacja zgodności haseł
  - Obsługa błędów rejestracji

- **PasswordResetFormComponent**
  - Formularz resetowania hasła
  - Dwuetapowy proces (żądanie + reset)
  - Walidacja nowego hasła
  - Komunikaty potwierdzające

### 1.2. Routing i Guards

```typescript
const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [NonAuthGuard]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // chronione ścieżki aplikacji
    ]
  }
];
```

### 1.3. Obsługa błędów i komunikatów

- Centralna obsługa błędów przez `ErrorInterceptor`
- Automatyczne przekierowanie do `/auth` przy błędzie 401
- Wyświetlanie komunikatów przez `MatSnackBar`
- Walidacja formularzy z natychmiastową informacją zwrotną

### 1.4. Serwisy frontendowe

#### AuthService
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  // Stan zalogowania
  private readonly authStateSubject = new BehaviorSubject<AuthState | null>(null);
  readonly authState$ = this.authStateSubject.asObservable();
  
  constructor() {
    // Inicjalne sprawdzenie sesji
    this.checkSession().catch(console.error);
  }
  
  // Metody autentykacji
  async login(email: string, password: string): Promise<void> {
    try {
      await this.http.post('/api/auth/login', { email, password }).toPromise();
      await this.checkSession();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      await this.http.post('/api/auth/register', { 
        email, 
        password,
        redirectUrl: `${window.location.origin}/auth/callback`
      }).toPromise();
      this.router.navigate(['/auth/verify-email']);
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.http.post('/api/auth/reset-password', { 
        email,
        redirectUrl: `${window.location.origin}/auth/reset-password`
      }).toPromise();
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      await this.http.post('/api/auth/update-password', { 
        password: newPassword 
      }).toPromise();
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.http.post('/api/auth/logout', {}).toPromise();
      this.authStateSubject.next(null);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.handleAuthError(error);
    }
  }
  
  // Pomocnicze metody
  private async checkSession(): Promise<void> {
    try {
      const response = await this.http.get<AuthState>('/api/auth/session').toPromise();
      this.authStateSubject.next(response);
    } catch {
      this.authStateSubject.next(null);
    }
  }

  private handleAuthError(error: any): void {
    // Mapowanie błędów na przyjazne komunikaty
    const message = this.mapErrorToMessage(error);
    throw new Error(message);
  }

  private mapErrorToMessage(error: any): string {
    const statusCode = error?.status;
    switch (statusCode) {
      case 401:
        return 'Nieprawidłowe dane logowania';
      case 404:
        return 'Użytkownik nie istnieje';
      case 409:
        return 'Email jest już zajęty';
      case 422:
        return 'Nieprawidłowe dane';
      default:
        return 'Wystąpił błąd podczas operacji';
    }
  }

  // Gettery stanu
  isAuthenticated(): boolean {
    return this.authStateSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value?.user || null;
  }
}
```

### 1.5. Interceptory HTTP

#### AuthInterceptor
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Ciasteczka są automatycznie dołączane do żądań
    // Nie musimy ręcznie dodawać tokenów
    return next.handle(req);
  }
}
```

### 1.6. Guards

#### AuthGuard
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> {
    // Sprawdzanie stanu autentykacji
    // Przekierowanie do /auth jeśli niezalogowany
  }
}
```

#### NonAuthGuard
```typescript
@Injectable({ providedIn: 'root' })
export class NonAuthGuard implements CanActivate {
  canActivate(): boolean | Promise<boolean> {
    // Blokowanie dostępu do /auth dla zalogowanych
    // Przekierowanie do / jeśli zalogowany
  }
}
```

## 2. Logika backendowa

### 2.1. Endpointy Express

#### Autentykacja
```typescript
// auth.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthController } from '../controllers/auth.controller';
import { validateLoginDto, validateRegisterDto } from '../validators/auth.validator';

const router = Router();
const controller = new AuthController();

// Endpointy publiczne
router.post('/login', validateLoginDto, controller.login);
router.post('/register', validateRegisterDto, controller.register);
router.post('/reset-password', controller.resetPassword);
router.get('/verify-email', controller.verifyEmail);

// Endpointy chronione
router.use(authMiddleware);
router.get('/session', controller.getSession);
router.post('/logout', controller.logout);
router.post('/update-password', controller.updatePassword);

export default router;
```

### 2.2. Kontrolery

#### AuthController
```typescript
// auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ErrorLogService } from '../services/error-log.service';

export class AuthController {
  private authService: AuthService;
  private errorLogService: ErrorLogService;

  constructor() {
    this.authService = new AuthService();
    this.errorLogService = new ErrorLogService();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { session } = await this.authService.signInWithPassword(email, password);
      
      // Ustawienie ciasteczek sesji
      this.setSessionCookies(res, session);
      
      res.json({ user: session.user });
    } catch (error) {
      await this.handleAuthError(error, res);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, redirectUrl } = req.body;
      await this.authService.signUp(email, password, redirectUrl);
      res.status(201).json({ message: 'Verification email sent' });
    } catch (error) {
      await this.handleAuthError(error, res);
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await this.authService.getSession(req);
      res.json({ session });
    } catch (error) {
      await this.handleAuthError(error, res);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      await this.authService.signOut(req);
      this.clearSessionCookies(res);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      await this.handleAuthError(error, res);
    }
  }

  private setSessionCookies(res: Response, session: any): void {
    res.cookie('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 3600 * 1000 // 1 godzina
    });
    
    res.cookie('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000 // 7 dni
    });
  }

  private clearSessionCookies(res: Response): void {
    res.clearCookie('sb-access-token');
    res.clearCookie('sb-refresh-token');
  }

  private async handleAuthError(error: any, res: Response): Promise<void> {
    await this.errorLogService.logError('auth_error', error);
    
    const statusCode = this.mapErrorToStatusCode(error);
    res.status(statusCode).json({
      error: this.mapErrorToMessage(error)
    });
  }

  private mapErrorToStatusCode(error: any): number {
    // Mapowanie błędów Supabase na kody HTTP
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
```

### 2.3. Serwisy backendowe

#### AuthService
```typescript
// auth.service.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string, redirectUrl: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) throw error;
    return data;
  }

  async getSession(req: Request) {
    // Odczytanie sesji z ciasteczek
    const { data: { session }, error } = await this.supabase.auth.getSession();
    
    if (error) throw error;
    if (!session) throw new Error('No active session');
    
    return session;
  }

  async signOut(req: Request) {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }
}
```

### 2.4. Walidatory

```typescript
// validators/auth.validator.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków')
});

const registerSchema = loginSchema.extend({
  redirectUrl: z.string().url('Nieprawidłowy URL przekierowania')
});

export const validateLoginDto = (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(422).json({ error: 'Nieprawidłowe dane wejściowe' });
  }
};

export const validateRegisterDto = (req: Request, res: Response, next: NextFunction) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(422).json({ error: 'Nieprawidłowe dane wejściowe' });
  }
};
```

## 3. System autentykacji Supabase

### 3.1. Konfiguracja Supabase Auth

```typescript
// environment.ts
export const environment = {
  production: false,
  supabaseUrl: 'SUPABASE_URL',
  supabaseKey: 'SUPABASE_ANON_KEY',
  authConfig: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: undefined // Wyłączamy localStorage na rzecz ciasteczek
  }
};
```

### 3.2. Konfiguracja ciasteczek Supabase

```sql
-- supabase/config.toml
[auth]
# Konfiguracja ciasteczek sesji
cookie_options = {
  http_only = true,
  same_site = "lax",
  secure = true,
  max_age = 3600
}

# Domena dla ciasteczek
site_url = "https://your-domain.com"
additional_redirect_urls = ["https://your-domain.com/*"]
```

### 3.3. Polityki bezpieczeństwa Supabase

#### RLS dla user_preferences
```sql
-- Tylko właściciel może odczytać swoje preferencje
create policy "Users can read own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

-- Tylko właściciel może aktualizować swoje preferencje
create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);
```

#### RLS dla recipes
```sql
-- Tylko właściciel może zarządzać swoimi przepisami
create policy "Users can manage own recipes"
  on recipes for all
  using (auth.uid() = user_id);
```

### 3.4. Obsługa sesji

- Automatyczne odświeżanie tokenów co 1 godzinę
- Przechowywanie sesji w localStorage
- Czyszczenie sesji przy wylogowaniu
- Obsługa wygaśnięcia sesji

## 4. Scenariusze użycia

### 4.1. Rejestracja nowego użytkownika

1. Użytkownik wchodzi na `/auth` i wybiera rejestrację
2. Wypełnia formularz (email + hasło)
3. System waliduje dane:
   - Email w poprawnym formacie
   - Hasło spełnia wymogi bezpieczeństwa
4. Po walidacji:
   - Tworzenie konta w Supabase Auth
   - Automatyczne logowanie
   - Przekierowanie do `/preferences`

### 4.2. Logowanie

1. Użytkownik wchodzi na `/auth`
2. Wprowadza dane logowania
3. System:
   - Weryfikuje dane w Supabase Auth
   - Zapisuje token JWT
   - Aktualizuje stan AuthService
4. Przekierowanie do ostatniej strony lub `/dashboard`

### 4.3. Resetowanie hasła

1. Użytkownik klika "Zapomniałem hasła"
2. Wprowadza email
3. System:
   - Wysyła email z linkiem do resetu
   - Wyświetla komunikat potwierdzający
4. Po kliknięciu w link:
   - Walidacja tokena resetu
   - Formularz nowego hasła
   - Aktualizacja hasła w Supabase

### 4.4. Wylogowanie

1. Użytkownik klika wyloguj
2. System:
   - Usuwa tokeny
   - Czyści stan AuthService
   - Wywołuje logout w Supabase
3. Przekierowanie do `/auth`

## 5. Bezpieczeństwo

### 5.1. Zabezpieczenia frontendowe

- Brak przechowywania wrażliwych danych w localStorage
- Wykorzystanie httpOnly cookies dla sesji
- Automatyczna ochrona CSRF
- Walidacja danych wejściowych
- Sanityzacja danych użytkownika
- Ochrona przed XSS

### 5.2. Zabezpieczenia backendowe

- Automatyczna weryfikacja sesji przez Supabase
- Bezpieczne ciasteczka (httpOnly, secure, SameSite)
- Rate limiting dla endpointów auth
- Logowanie nieudanych prób logowania
- Blokada konta po zbyt wielu próbach

### 5.3. Konfiguracja Supabase

- Minimalna długość hasła: 8 znaków
- Wymagane znaki specjalne w haśle
- Limit prób logowania: 5 na godzinę
- Czas życia tokena JWT: 1 godzina

## 6. Obsługa błędów

### 6.1. Mapowanie błędów Supabase

```typescript
const authErrorMap = {
  'auth/invalid-email': 'Nieprawidłowy adres email',
  'auth/wrong-password': 'Nieprawidłowe hasło',
  'auth/email-already-in-use': 'Email jest już zajęty',
  'auth/weak-password': 'Hasło jest zbyt słabe',
  // ...
};
```

### 6.2. Logowanie błędów

```typescript
@Injectable({ providedIn: 'root' })
export class AuthErrorService {
  async logAuthError(error: any, userId?: string): Promise<void> {
    await this.supabase
      .from('error_logs')
      .insert({
        user_id: userId,
        message: error.message,
        type: 'auth_error'
      });
  }
}
``` 