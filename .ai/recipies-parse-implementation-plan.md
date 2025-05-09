# API Endpoint Implementation Plan: POST /api/recipes/parse

## 1. Przegląd punktu końcowego
Endpoint służy do parsowania tekstu przepisu kulinarnego do ustrukturyzowanego formatu JSON przy użyciu AI. Użytkownik wysyła surowy tekst przepisu, a system wykorzystuje model AI (OpenRouter.ai) do analizy tekstu i zwrócenia wykrytego tytułu przepisu, listy składników, kroków przygotowania, notatek oraz szacowanej liczby kalorii.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/recipes/parse`
- Parametry:
  - Wymagane: Brak parametrów URL
  - Opcjonalne: Brak parametrów URL
- Request Body:
  ```json
  {
    "recipe_text": "Plain text recipe content..."
  }
  ```
- Nagłówki:
  - `Authorization`: Bearer token JWT do uwierzytelniania
  - `Content-Type`: application/json

## 3. Wykorzystywane typy
- **DTO**:
  - `ParseRecipeCommandModel`: Model komend dla wejściowych danych przepisu (tekst przepisu)
  - `ParsedRecipeDto`: Model odpowiedzi zawierający sparsowane dane przepisu
  - `RecipeDataDto`: Model danych przepisu (składniki, kroki, notatki, kalorie)
  - `IngredientDto`: Model dla pojedynczego składnika
  - `StepDto`: Model dla pojedynczego kroku
  - `ValidationResultDto`: Model dla wyników walidacji (jeśli implementowana opcjonalna walidacja)
  - `ErrorLogDto`: Model dla logowania błędów

## 4. Szczegóły odpowiedzi
- Struktura odpowiedzi:
  ```json
  {
    "title": "Detected Recipe Title",
    "recipe_data": {
      "ingredients": [
        {"name": "detected ingredient", "amount": 2, "unit": "cups"},
        // Więcej składników...
      ],
      "steps": [
        {"description": "Detected step 1"},
        // Więcej kroków...
      ],
      "notes": "Any detected notes",
      "calories": 1500
    }
  }
  ```
- Kody statusu:
  - 200 OK: Przepis został pomyślnie sparsowany
  - 400 Bad Request: Nieprawidłowe dane lub pusty tekst
  - 401 Unauthorized: Brak uwierzytelnienia
  - 408 Request Timeout: Przetwarzanie AI przekroczyło limit czasu (> 60s)
  - 500 Internal Server Error: Przetwarzanie AI nie powiodło się

## 5. Przepływ danych
1. Kontroler odbiera żądanie POST z tekstem przepisu
2. Walidacja wejściowego tekstu przepisu (czy nie jest pusty)
3. Wywołanie serwisu do komunikacji z API OpenRouter.ai
4. Przesłanie tekstu przepisu do modelu AI z określonym promptem
5. Oczekiwanie na odpowiedź z limitem czasowym 60 sekund
6. Przetworzenie odpowiedzi AI na strukturę `ParsedRecipeDto`
7. Zwrócenie odpowiedzi do klienta

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymagane uwierzytelnienie JWT za pomocą Supabase
- **Autoryzacja**: Endpoint jest dostępny dla wszystkich uwierzytelnionych użytkowników
- **Walidacja danych**:
  - Sprawdzenie, czy pole `recipe_text` nie jest puste
  - Weryfikacja poprawności odpowiedzi od modelu AI
  - Sanityzacja danych wejściowych i wyjściowych
- **Limity zapytań**: Implementacja limitów zapytań API dla uniknięcia nadużyć
- **Obsługa kosztów API AI**: Monitorowanie i ograniczanie kosztów związanych z wywołaniami API AI

## 7. Obsługa błędów
- **Puste dane wejściowe**:
  - Status: 400 Bad Request
  - Komunikat: "Recipe text cannot be empty"
- **Błąd uwierzytelnienia**:
  - Status: 401 Unauthorized
  - Komunikat: "Authentication required"
- **Limit czasu AI**:
  - Status: 408 Request Timeout
  - Komunikat: "AI processing timed out after 60 seconds"
  - Zapis błędu do tabeli `error_logs`
- **Błąd przetwarzania AI**:
  - Status: 500 Internal Server Error
  - Komunikat: "AI processing failed: [szczegóły błędu]"
  - Zapis błędu do tabeli `error_logs`
- **Nieprawidłowa odpowiedź AI**:
  - Status: 500 Internal Server Error
  - Komunikat: "Invalid AI response format"
  - Zapis błędu do tabeli `error_logs`

## 8. Rozważania dotyczące wydajności
- **Limit czasu**: Ustawienie limitu czasu 60 sekund dla przetwarzania AI
- **Buforowanie**: Rozważenie cachowania odpowiedzi dla identycznych zapytań
- **Optymalizacja prompta**: Dostosowanie prompta AI do minimalizacji czasu przetwarzania
- **Asynchroniczne przetwarzanie**: Implementacja opcji asynchronicznego przetwarzania dla długich przepisów
- **Monitorowanie czasu odpowiedzi**: Monitorowanie czasu odpowiedzi API w celu optymalizacji

## 9. Etapy wdrożenia

### 1. Przygotowanie struktury usługi
1. Utworzenie serwisu `AIService` w folderze `src/lib/services` do obsługi komunikacji z OpenRouter.ai
2. Implementacja metody `parseRecipe(recipeText: string): Promise<ParsedRecipeDto>`
3. Utworzenie konfiguracji dla połączenia z OpenRouter.ai (klucz API, limit czasu, itp.)

### 2. Implementacja kontrolera
1. Utworzenie kontrolera `RecipeController` w odpowiedniej lokalizacji
2. Implementacja metody `parseRecipe(body: ParseRecipeCommandModel): Promise<ParsedRecipeDto>`
3. Implementacja walidacji danych wejściowych i obsługi błędów

### 3. Implementacja prompta AI
1. Utworzenie dokumentu zawierającego prompt dla modelu AI
2. Optymalizacja prompta pod kątem dokładnego wyodrębniania wymaganych informacji
3. Testowanie prompta na różnych przykładach przepisów

### 4. Implementacja logowania błędów
1. Utworzenie serwisu `ErrorLogService` do zapisywania błędów w tabeli `error_logs`
2. Integracja z kontrolerem w celu logowania błędów związanych z AI

### 5. Testy jednostkowe
1. Testy jednostkowe dla walidacji danych wejściowych
2. Testy jednostkowe dla przetwarzania odpowiedzi AI
3. Testy mock dla integracji z OpenRouter.ai

### 6. Testy integracyjne
1. Testy end-to-end dla całego przepływu
2. Testy scenariuszy błędów (limit czasu, błędne odpowiedzi AI)
3. Testy wydajnościowe dla dużych przepisów

### 7. Dokumentacja i wdrożenie
1. Aktualizacja dokumentacji API
2. Implementacja limitów zapytań i monitorowania
3. Wdrożenie na środowisko testowe
4. Przeprowadzenie testów akceptacyjnych
5. Wdrożenie na środowisko produkcyjne 