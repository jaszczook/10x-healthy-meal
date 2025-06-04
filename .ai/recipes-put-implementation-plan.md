# API Endpoint Implementation Plan: PUT /api/recipes/:id

## 1. Przegląd punktu końcowego
Endpoint służy do aktualizacji istniejącego przepisu w systemie. Wymaga uwierzytelnienia i autoryzacji, gdzie użytkownik może aktualizować tylko swoje własne przepisy. Endpoint zwraca zaktualizowany przepis w formacie identycznym jak GET /api/recipes/:id.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: /api/recipes/:id
- Parametry:
  - Wymagane:
    - id (UUID): identyfikator przepisu do aktualizacji
  - Opcjonalne: brak
- Request Body: UpdateRecipeCommandModel
  ```typescript
  {
    title: string;
    recipe_data: {
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
  }
  ```

## 3. Wykorzystywane typy
- UpdateRecipeCommandModel: model danych wejściowych
- RecipeDetailDto: model odpowiedzi
- ValidationResultDto: model wyników walidacji
- ValidationError: model błędów walidacji

## 4. Szczegóły odpowiedzi
- Status: 200 OK
- Response Body: RecipeDetailDto
  ```typescript
  {
    id: string;
    title: string;
    recipe_data: RecipeDataDto;
    created_at: string | null;
    updated_at: string | null;
  }
  ```
- Kody błędów:
  - 400: Nieprawidłowe dane wejściowe
  - 401: Brak uwierzytelnienia
  - 403: Brak uprawnień do aktualizacji przepisu
  - 404: Przepis nie znaleziony

## 5. Przepływ danych
1. Odbierz żądanie PUT z parametrem id i danymi przepisu
2. Zweryfikuj token uwierzytelniający
3. Pobierz przepis z bazy danych
4. Sprawdź uprawnienia użytkownika
5. Zweryfikuj dane wejściowe
6. Zaktualizuj przepis w bazie danych
7. Zwróć zaktualizowany przepis

## 6. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagany token JWT
   - Weryfikacja ważności tokenu
2. Autoryzacja:
   - Sprawdzenie czy użytkownik jest właścicielem przepisu
   - Walidacja uprawnień przed aktualizacją
3. Walidacja danych:
   - Sprawdzenie struktury recipe_data
   - Walidacja wymaganych pól
   - Sanityzacja danych wejściowych
4. Bezpieczeństwo bazy danych:
   - Użycie Supabase do bezpiecznych zapytań
   - Parametryzowane zapytania

## 7. Obsługa błędów
1. Błędy walidacji (400):
   - Nieprawidłowa struktura recipe_data
   - Brak wymaganych pól
   - Nieprawidłowe typy danych
2. Błędy autoryzacji (401/403):
   - Brak tokenu
   - Nieprawidłowy token
   - Brak uprawnień
3. Błędy zasobów (404):
   - Przepis nie istnieje
4. Błędy serwera (500):
   - Błędy bazy danych
   - Nieoczekiwane błędy

## 8. Rozważania dotyczące wydajności
1. Optymalizacje:
   - Użycie indeksów w bazie danych
   - Efektywne zapytania Supabase
   - Buforowanie odpowiedzi
2. Monitorowanie:
   - Logowanie czasu odpowiedzi
   - Śledzenie błędów
   - Metryki wydajności

## 9. Etapy wdrożenia
1. Implementacja kontrolera:
   - Utworzenie metody PUT w RecipeController
   - Implementacja walidacji parametrów
   - Obsługa błędów

2. Implementacja serwisu:
   - Rozszerzenie RecipeService o metodę update
   - Implementacja logiki biznesowej
   - Obsługa transakcji

3. Implementacja walidacji:
   - Utworzenie walidatora dla UpdateRecipeCommandModel
   - Implementacja reguł walidacji
   - Obsługa błędów walidacji

4. Implementacja autoryzacji:
   - Rozszerzenie guarda autoryzacji
   - Implementacja sprawdzania uprawnień
   - Obsługa błędów autoryzacji

5. Testy:
   - Testy jednostkowe
   - Testy integracyjne
   - Testy wydajnościowe

6. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja błędów

7. Wdrożenie:
   - Code review
   - Testy w środowisku staging
   - Wdrożenie produkcyjne 