# API Endpoint Implementation Plan: PUT /api/users/current/preferences

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia lub aktualizacji preferencji żywieniowych użytkownika. Obsługuje informacje o alergiach, nietolerancjach i docelowej liczbie kalorii. Endpoint wymaga uwierzytelnienia i zwraca odpowiednie kody statusu w zależności od tego, czy preferencje są tworzone po raz pierwszy (201) czy aktualizowane (200).

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/users/current/preferences`
- Parametry:
  - Wymagane: Brak (wszystkie pola są opcjonalne w body)
- Request Body:
  ```typescript
  {
    allergies?: string[] | null;
    intolerances?: string[] | null;
    target_calories?: number | null;
  }
  ```

## 3. Wykorzystywane typy
```typescript
// Request
interface UserPreferencesCommandModel {
  allergies?: string[] | null;
  intolerances?: string[] | null;
  target_calories?: number | null;
}

// Response
interface UserPreferencesDto {
  allergies: string[] | null;
  intolerances: string[] | null;
  target_calories: number | null;
  created_at: string | null;
  updated_at: string | null;
}
```

## 4. Szczegóły odpowiedzi
- Status Codes:
  - 200 OK: Preferencje zaktualizowane
  - 201 Created: Preferencje utworzone po raz pierwszy
  - 400 Bad Request: Nieprawidłowe dane wejściowe
  - 401 Unauthorized: Brak uwierzytelnienia
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Odbierz żądanie i zweryfikuj token uwierzytelniający
2. Przetwórz i zwaliduj dane wejściowe
3. Sprawdź czy preferencje użytkownika już istnieją
4. Wykonaj operację UPSERT w bazie danych
5. Zwróć zaktualizowane dane z odpowiednimi timestampami

## 6. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagany token JWT
   - Weryfikacja uprawnień użytkownika
2. Walidacja danych:
   - Sanityzacja inputów
   - Walidacja typów danych
   - Sprawdzanie zakresów wartości
3. Ochrona przed atakami:
   - SQL Injection prevention
   - Rate limiting
   - Input sanitization

## 7. Obsługa błędów
1. Walidacja:
   - Nieprawidłowe typy danych (400)
   - Nieprawidłowe wartości (400)
2. Uwierzytelnianie:
   - Brak tokenu (401)
   - Nieprawidłowy token (401)
3. Baza danych:
   - Błędy połączenia (500)
   - Błędy transakcji (500)
4. Logowanie:
   - Użyj ErrorLogDto do strukturyzowanego logowania
   - Zapisz szczegóły błędu w tabeli error_logs

## 8. Rozważania dotyczące wydajności
1. Optymalizacje:
   - Użyj indeksów w bazie danych
   - Implementuj caching dla często używanych preferencji
2. Monitoring:
   - Śledź czasy odpowiedzi
   - Monitoruj użycie zasobów
3. Skalowalność:
   - Przygotuj się na wzrost liczby użytkowników
   - Zoptymalizuj zapytania do bazy danych

## 9. Etapy wdrożenia
1. Przygotowanie środowiska:
   - Utwórz nowy branch
   - Przygotuj środowisko testowe

2. Implementacja serwisu:
   ```typescript
   @Injectable()
   export class UserPreferencesService {
     constructor(
       private readonly db: Database,
       private readonly errorLogger: ErrorLogger
     ) {}

     async upsertPreferences(
       userId: string,
       preferences: UserPreferencesCommandModel
     ): Promise<UserPreferencesDto> {
       // Implementacja
     }
   }
   ```

3. Implementacja kontrolera:
   ```typescript
   @Controller('users/current/preferences')
   export class UserPreferencesController {
     constructor(
       private readonly preferencesService: UserPreferencesService
     ) {}

     @Put()
     async updatePreferences(
       @Body() preferences: UserPreferencesCommandModel,
       @User() user: UserDto
     ): Promise<UserPreferencesDto> {
       // Implementacja
     }
   }
   ```

4. Implementacja walidacji:
   - Utwórz pipe do walidacji danych wejściowych
   - Zaimplementuj custom validatory

5. Testy:
   - Unit tests dla serwisu
   - Integration tests dla endpointu
   - E2E tests dla pełnego flow

6. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja testów

7. Code Review:
   - Przegląd kodu
   - Testy wydajnościowe
   - Security review

8. Deployment:
   - Merge do main branch
   - Deployment na środowisko staging
   - Testy na stagingu
   - Deployment na produkcję 