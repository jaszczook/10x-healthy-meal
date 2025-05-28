# API Endpoint Implementation Plan: GET /api/users/current/preferences

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania preferencji żywieniowych aktualnie zalogowanego użytkownika. Zwraca informacje o alergiach, nietolerancjach, docelowej liczbie kalorii oraz metadane dotyczące utworzenia i aktualizacji.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: /api/users/current/preferences
- Parametry:
  - Wymagane: Brak (używa ID użytkownika z sesji)
  - Opcjonalne: Brak
- Request Body: Brak

## 3. Wykorzystywane typy
```typescript
interface UserPreferencesDto {
  allergies: string[] | null;
  intolerances: string[] | null;
  target_calories: number | null;
  created_at: string | null;
  updated_at: string | null;
}
```

## 4. Szczegóły odpowiedzi
- Status: 200 OK
- Response Body: UserPreferencesDto
- Error Responses:
  - 401 Unauthorized: Brak autoryzacji
  - 404 Not Found: Brak preferencji dla użytkownika
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Middleware autoryzacyjny weryfikuje token JWT
2. Controller wywołuje UserPreferencesService
3. Service pobiera ID użytkownika z sesji
4. Service wykonuje zapytanie do bazy danych
5. Dane są mapowane do DTO
6. Controller zwraca odpowiedź

## 6. Względy bezpieczeństwa
- Wymagana autoryzacja przez JWT
- Walidacja tokenu JWT
- Sprawdzenie czy użytkownik ma dostęp do swoich preferencji
- Sanityzacja danych wyjściowych
- Implementacja rate limitingu
- Walidacja typów danych

## 7. Obsługa błędów
- 401: Logowanie błędu z informacją o nieautoryzowanym dostępie
- 404: Logowanie błędu z informacją o braku preferencji
- 500: Logowanie błędu z pełnym stack trace
- Wszystkie błędy są logowane do tabeli error_logs

## 8. Rozważania dotyczące wydajności
- Implementacja cache'owania odpowiedzi
- Optymalizacja zapytań do bazy danych
- Użycie indeksów w bazie danych
- Implementacja paginacji jeśli będzie potrzebna w przyszłości

## 9. Etapy wdrożenia
1. Utworzenie UserPreferencesService
   ```typescript
   @Injectable()
   export class UserPreferencesService {
     constructor(
       private readonly db: Database,
       private readonly auth: AuthService
     ) {}

     async getCurrentUserPreferences(): Promise<UserPreferencesDto> {
       // Implementacja
     }
   }
   ```

2. Implementacja kontrolera
   ```typescript
   @Controller('users/current/preferences')
   export class UserPreferencesController {
     constructor(
       private readonly userPreferencesService: UserPreferencesService
     ) {}

     @Get()
     @UseGuards(AuthGuard)
     async getCurrentUserPreferences(): Promise<UserPreferencesDto> {
       // Implementacja
     }
   }
   ```

3. Implementacja middleware autoryzacyjnego
   ```typescript
   @Injectable()
   export class AuthGuard implements CanActivate {
     // Implementacja
   }
   ```

4. Implementacja obsługi błędów
   ```typescript
   @Catch()
   export class GlobalExceptionFilter implements ExceptionFilter {
     // Implementacja
   }
   ```

5. Implementacja logowania błędów
   ```typescript
   @Injectable()
   export class ErrorLoggingService {
     // Implementacja
   }
   ```

6. Testy jednostkowe
   - Testy dla UserPreferencesService
   - Testy dla UserPreferencesController
   - Testy dla AuthGuard
   - Testy dla obsługi błędów

7. Testy integracyjne
   - Testy przepływu danych
   - Testy autoryzacji
   - Testy obsługi błędów

8. Dokumentacja
   - Dokumentacja API
   - Dokumentacja kodu
   - Przykłady użycia 