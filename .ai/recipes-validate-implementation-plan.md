# API Endpoint Implementation Plan: Recipe Validation

## 1. Przegląd punktu końcowego
Endpoint służy do walidacji struktury JSON przepisu bez zapisywania go w bazie danych. Jest to przydatne do wstępnej weryfikacji poprawności danych przed faktycznym zapisem przepisu.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /api/recipes/:id/validate
- Parametry:
  - Wymagane:
    - id (UUID): identyfikator przepisu
    - recipe_data (JSON): dane przepisu do walidacji
  - Opcjonalne: brak
- Request Body:
  ```typescript
  {
    ingredients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    steps: Array<{
      description: string;
    }>;
    notes?: string;
    calories?: number;
  }
  ```

## 3. Wykorzystywane typy
```typescript
// DTOs
interface RecipeDataDto {
  ingredients: IngredientDto[];
  steps: StepDto[];
  notes?: string;
  calories?: number;
}

interface ValidationResultDto {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}
```

## 4. Szczegóły odpowiedzi
- Status 200 OK:
  ```json
  {
    "valid": true,
    "errors": []
  }
  ```
  lub
  ```json
  {
    "valid": false,
    "errors": [
      {
        "field": "ingredients[0].amount",
        "message": "Amount must be greater than 0"
      }
    ]
  }
  ```
- Status 401 Unauthorized: Brak autoryzacji
- Status 400 Bad Request: Nieprawidłowa struktura żądania
- Status 404 Not Found: Przepis nie istnieje
- Status 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Odbierz żądanie i zweryfikuj token autoryzacji
2. Sprawdź istnienie przepisu o podanym ID
3. Zweryfikuj uprawnienia użytkownika do przepisu
4. Przetwórz dane wejściowe do struktury RecipeDataDto
5. Wykonaj walidację struktury i reguł biznesowych
6. Zapisz błędy walidacji w logach (jeśli występują)
7. Zwróć wynik walidacji

## 6. Względy bezpieczeństwa
- Wymagana autoryzacja przez token JWT
- Walidacja uprawnień użytkownika do przepisu
- Sanityzacja danych wejściowych
- Walidacja typów i struktur danych
- Ochrona przed atakami typu SQL injection
- Limitowanie rozmiaru żądania
- Walidacja formatu UUID

## 7. Obsługa błędów
- 401 Unauthorized:
  - Brak tokenu autoryzacji
  - Nieprawidłowy token
  - Wygaśnięty token
- 400 Bad Request:
  - Nieprawidłowa struktura JSON
  - Brakujące wymagane pola
  - Nieprawidłowe typy danych
- 404 Not Found:
  - Przepis o podanym ID nie istnieje
- 500 Internal Server Error:
  - Błędy bazy danych
  - Błędy serwera
  - Nieoczekiwane wyjątki

## 8. Rozważania dotyczące wydajności
- Implementacja cache'owania wyników walidacji
- Optymalizacja zapytań do bazy danych
- Asynchroniczne logowanie błędów
- Limitowanie rozmiaru żądania
- Kompresja odpowiedzi

## 9. Etapy wdrożenia
1. Utworzenie serwisu walidacji:
   - Stworzenie RecipeValidationService w src/lib/services
   - Implementacja metod walidacji struktury
   - Implementacja metod walidacji reguł biznesowych

2. Implementacja kontrolera:
   - Utworzenie endpointu w src/api/recipes
   - Implementacja obsługi żądania
   - Integracja z serwisem walidacji

3. Implementacja middleware:
   - Middleware autoryzacji
   - Middleware walidacji danych wejściowych
   - Middleware obsługi błędów

4. Implementacja logowania:
   - Integracja z systemem logowania błędów
   - Implementacja formatowania logów
   - Konfiguracja poziomów logowania

5. Testy:
   - Testy jednostkowe serwisu
   - Testy integracyjne endpointu
   - Testy wydajnościowe
   - Testy bezpieczeństwa

6. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dokumentacja kodu
   - Przykłady użycia

7. Optymalizacja:
   - Implementacja cache'owania
   - Optymalizacja zapytań
   - Testy obciążeniowe

8. Wdrożenie:
   - Code review
   - Testy w środowisku staging
   - Wdrożenie na produkcję
   - Monitoring 