# API Endpoint Implementation Plan: DELETE /api/recipes/:id

## 1. Przegląd punktu końcowego
Endpoint służy do usuwania przepisu z systemu. Wymaga uwierzytelnienia i autoryzacji użytkownika, który musi być właścicielem przepisu. Po pomyślnym usunięciu zwraca kod 204 bez treści odpowiedzi.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/recipes/:id`
- Parametry:
  - Wymagane: 
    - id (UUID) - identyfikator przepisu do usunięcia
  - Opcjonalne: brak
- Request Body: brak
- Headers:
  - Authorization: Bearer token

## 3. Wykorzystywane typy
- `RecipeDetailDto` - do weryfikacji istnienia przepisu
- `ErrorLogDto` - do logowania błędów

## 4. Szczegóły odpowiedzi
- Success Response:
  - Status: 204 No Content
  - Body: brak
- Error Responses:
  - 401 Unauthorized: Brak uwierzytelnienia
  - 403 Forbidden: Brak uprawnień do usunięcia przepisu
  - 404 Not Found: Przepis nie istnieje
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Odbierz żądanie DELETE z parametrem id
2. Zweryfikuj token uwierzytelniający
3. Pobierz przepis z bazy danych
4. Sprawdź czy przepis istnieje
5. Zweryfikuj czy użytkownik jest właścicielem przepisu
6. Usuń przepis z bazy danych
7. Zwróć odpowiedź 204

## 6. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagany token JWT w nagłówku Authorization
   - Weryfikacja ważności tokenu

2. Autoryzacja:
   - Sprawdzenie czy użytkownik jest właścicielem przepisu
   - Porównanie user_id z tokenu z user_id przepisu

3. Walidacja danych:
   - Weryfikacja formatu UUID
   - Sprawdzenie istnienia przepisu

4. Bezpieczeństwo bazy danych:
   - Wykorzystanie Supabase do bezpiecznego połączenia
   - Parametryzowane zapytania

## 7. Obsługa błędów
1. 401 Unauthorized:
   - Brak tokenu
   - Nieprawidłowy token
   - Wygaśnięty token

2. 403 Forbidden:
   - Użytkownik nie jest właścicielem przepisu
   - Logowanie do ErrorLogDto

3. 404 Not Found:
   - Przepis o podanym ID nie istnieje
   - Logowanie do ErrorLogDto

4. 500 Internal Server Error:
   - Błędy połączenia z bazą danych
   - Nieoczekiwane błędy serwera
   - Logowanie do ErrorLogDto

## 8. Rozważania dotyczące wydajności
1. Optymalizacje:
   - Wykorzystanie indeksów w bazie danych
   - Minimalna liczba zapytań do bazy
   - Efektywne sprawdzanie uprawnień

2. Monitoring:
   - Śledzenie czasu odpowiedzi
   - Monitorowanie błędów
   - Analiza wzorców użycia

## 9. Etapy wdrożenia
1. Implementacja endpointu w `src/api/recipes/delete.ts`:
   - Utworzenie handlera DELETE
   - Dodanie middleware uwierzytelniania
   - Implementacja logiki usuwania

2. Rozszerzenie `RecipeService` w `src/lib/recipes/recipe.service.ts`:
   - Dodanie metody deleteRecipe
   - Implementacja logiki biznesowej
   - Obsługa błędów

3. Implementacja walidacji:
   - Walidacja UUID
   - Sprawdzanie uprawnień
   - Obsługa błędów

4. Testy:
   - Testy jednostkowe
   - Testy integracyjne
   - Testy wydajnościowe

5. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja błędów

6. Wdrożenie:
   - Code review
   - Testy w środowisku staging
   - Wdrożenie produkcyjne 