# API Endpoint Implementation Plan: GET /api/recipes

## 1. Przegląd punktu końcowego
Endpoint służący do pobierania paginowanej listy przepisów kulinarnych należących do zalogowanego użytkownika z możliwością filtrowania, sortowania i wyszukiwania tekstowego.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: /api/recipes
- Parametry:
  - Opcjonalne:
    - `page`: Numer strony (domyślnie: 1)
    - `per_page`: Elementów na stronę (domyślnie: 10, max: 50)
    - `sort_by`: Pole sortowania (opcje: title, created_at, updated_at)
    - `sort_direction`: Kierunek sortowania (asc, desc, domyślnie: desc)
    - `search`: Wyszukiwanie tekstowe w tytule przepisu

## 3. Wykorzystywane typy
- **DTO**:
  - `RecipeListItemDto`: Reprezentacja pojedynczego przepisu w liście
  - `RecipesListResponseDto`: Paginowana odpowiedź zawierająca listę przepisów
  - `PaginatedResponse<T>`: Generyczny typ dla paginowanych odpowiedzi
- **Entity**:
  - `RecipeEntity`: Encja przepisu z bazy danych
  - `TypedRecipeEntity`: Encja przepisu z silnie typowanym polem recipe_data

## 4. Szczegóły odpowiedzi
- Kod statusu: 200 OK
- Format odpowiedzi:
  ```typescript
  {
    total: number;            // Całkowita liczba przepisów
    page: number;             // Aktualna strona
    per_page: number;         // Liczba elementów na stronę
    total_pages: number;      // Całkowita liczba stron
    data: RecipeListItemDto[]; // Lista przepisów
  }
  ```
- Przykład odpowiedzi:
  ```json
  {
    "total": 25,
    "page": 1,
    "per_page": 10,
    "total_pages": 3,
    "data": [
      {
        "id": "uuid-1",
        "title": "Chocolate Cake",
        "total_calories": 3500,
        "created_at": "2023-06-01T12:00:00Z",
        "updated_at": "2023-06-01T12:00:00Z"
      },
      // Więcej przepisów...
    ]
  }
  ```
- Kody błędów:
  - 401 Unauthorized: Użytkownik nie jest zalogowany

## 5. Przepływ danych
1. Walidacja parametrów zapytania
2. Pobranie ID zalogowanego użytkownika z kontekstu uwierzytelniania
3. Konstrukcja zapytania do bazy danych z uwzględnieniem:
   - Filtrowania po user_id (tylko przepisy zalogowanego użytkownika)
   - Wyszukiwania tekstowego (jeśli podano parametr search)
   - Sortowania według wybranego pola i kierunku
   - Paginacji (limit i offset)
4. Wykonanie dwóch zapytań do bazy danych:
   - Zliczenie wszystkich rekordów spełniających kryteria filtrowania (bez paginacji)
   - Pobranie paginowanej listy przepisów
5. Mapowanie wyników z bazy danych na DTO
6. Obliczenie total_pages na podstawie total i per_page
7. Złożenie pełnej odpowiedzi zgodnej z typem RecipesListResponseDto
8. Zwrócenie odpowiedzi z kodem statusu 200

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: Wymagane - użytkownik musi być zalogowany
- Autoryzacja: Filtrowanie danych - użytkownik widzi tylko swoje przepisy
- Walidacja danych wejściowych:
  - page: liczba całkowita > 0
  - per_page: liczba całkowita w zakresie 1-50
  - sort_by: tylko dozwolone wartości (title, created_at, updated_at)
  - sort_direction: tylko dozwolone wartości (asc, desc)
- Sanityzacja parametru search: zabezpieczenie przed SQL injection

## 7. Obsługa błędów
- Błędy uwierzytelniania:
  - Brak tokenu JWT: 401 Unauthorized
  - Nieprawidłowy token: 401 Unauthorized
  - Token wygasły: 401 Unauthorized
- Błędy walidacji parametrów:
  - Nieprawidłowe parametry: Zastosowanie wartości domyślnych (zamiast zwracania błędu)
- Błędy bazy danych:
  - Błąd połączenia: 500 Internal Server Error + zapis do tabeli error_logs
  - Błąd zapytania: 500 Internal Server Error + zapis do tabeli error_logs

## 8. Rozważania dotyczące wydajności
- Indeksowanie bazy danych:
  - Indeks na kolumnie user_id (prawdopodobnie już istnieje z powodu klucza obcego)
  - Indeks tekstowy na kolumnie title (jeśli wyszukiwanie jest częste)
  - Indeks na kolumnach używanych do sortowania (created_at, updated_at)
- Paginacja: Ograniczenie maksymalnej liczby elementów na stronę (50)
- Keszowanie:
  - Rozważyć keszowanie odpowiedzi na poziomie HTTP (Cache-Control)
  - Dla częstych zapytań z tymi samymi parametrami, rozważyć keszowanie w aplikacji

## 9. Etapy wdrożenia
1. Utworzenie `RecipesService` w `src/lib/services/recipes.service.ts`:
   - Implementacja metody `getRecipesList` do pobierania paginowanej listy przepisów
   - Logika filtrowania, sortowania i paginacji
   - Mapowanie encji na DTO

2. Utworzenie `RecipesApiController` w `src/api/recipes/recipes.controller.ts`:
   - Endpoint GET /api/recipes
   - Walidacja parametrów zapytania
   - Wywołanie metody `getRecipesList` z serwisu
   - Obsługa błędów i zwracanie odpowiednich kodów statusu

3. Utworzenie `ValidationService` w `src/lib/services/validation.service.ts` (jeśli nie istnieje):
   - Walidacja parametrów zapytania dla endpointu GET /api/recipes
   - Sanityzacja parametru search

4. Utworzenie `ErrorLogService` w `src/lib/services/error-log.service.ts` (jeśli nie istnieje):
   - Metoda do logowania błędów do tabeli error_logs

5. Rejestracja endpointu w `src/main.ts` lub odpowiednim pliku konfiguracyjnym:
   - Konfiguracja routingu
   - Dodanie middleware uwierzytelniania

6. Zdefiniowanie testów jednostkowych dla `RecipesService` i `RecipesApiController`:
   - Sprawdzanie poprawnego filtrowania, sortowania i paginacji
   - Testowanie obsługi błędów

7. Zdefiniowanie testów integracyjnych dla endpointu GET /api/recipes:
   - Testowanie z różnymi kombinacjami parametrów
   - Testy uwierzytelniania i autoryzacji

8. Aktualizacja dokumentacji API (jeśli istnieje) 