# API Endpoint Implementation Plan: POST /api/recipes

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia nowych przepisów w systemie. Wymaga uwierzytelnienia użytkownika i przyjmuje złożoną strukturę danych zawierającą tytuł, składniki, kroki przygotowania oraz opcjonalne notatki i kalorie.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /api/recipes
- Parametry:
  - Wymagane:
    - title: string
    - recipe_data.ingredients: Array<{name: string, amount: number, unit: string}>
    - recipe_data.steps: Array<{description: string}>
  - Opcjonalne:
    - recipe_data.notes: string
    - recipe_data.calories: number
- Request Body: CreateRecipeCommandModel

## 3. Wykorzystywane typy
```typescript
// Input
CreateRecipeCommandModel {
  title: string;
  recipe_data: RecipeDataDto;
}

// Output
RecipeDetailDto {
  id: string;
  title: string;
  recipe_data: RecipeDataDto;
  created_at: string;
  updated_at: string;
}

// Nested types
RecipeDataDto {
  ingredients: IngredientDto[];
  steps: StepDto[];
  notes?: string;
  calories?: number;
}
```

## 4. Przepływ danych
1. Odbierz żądanie HTTP POST
2. Zweryfikuj token uwierzytelniający
3. Waliduj dane wejściowe
4. Przetwórz dane do formatu bazy danych
5. Zapisz przepis w bazie danych
6. Zwróć utworzony przepis z ID i timestampami

## 5. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagany token JWT
   - Walidacja tokenu przed przetwarzaniem
   - Sprawdzenie uprawnień użytkownika

2. Walidacja danych:
   - Sanityzacja wszystkich pól tekstowych
   - Walidacja typów danych
   - Sprawdzenie długości pól
   - Walidacja formatu danych JSON

3. Ochrona przed atakami:
   - Limit rozmiaru żądania JSON
   - Rate limiting na endpoint
   - Sanityzacja SQL
   - Ochrona przed XSS

## 6. Obsługa błędów
1. Błędy walidacji (400):
   - Brakujące wymagane pola
   - Nieprawidłowy format danych
   - Nieprawidłowe typy danych
   - Przekroczone limity długości

2. Błędy uwierzytelniania (401):
   - Brak tokenu
   - Nieprawidłowy token
   - Wygaśnięty token

3. Błędy serwera (500):
   - Błędy bazy danych
   - Błędy przetwarzania
   - Nieoczekiwane wyjątki

## 7. Rozważania dotyczące wydajności
1. Optymalizacje:
   - Indeksowanie kolumn w bazie danych
   - Walidacja po stronie klienta
   - Buforowanie odpowiedzi
   - Asynchroniczne przetwarzanie

2. Monitorowanie:
   - Metryki czasu odpowiedzi
   - Liczniki błędów
   - Wykorzystanie zasobów

## 8. Etapy wdrożenia
1. Przygotowanie struktury:
   - Utworzenie endpointu w src/api/recipes
   - Implementacja middleware uwierzytelniania
   - Konfiguracja walidacji

2. Implementacja logiki biznesowej:
   - Utworzenie RecipeService w src/lib/services
   - Implementacja metod CRUD
   - Integracja z Supabase

3. Walidacja i obsługa błędów:
   - Implementacja walidatorów
   - Obsługa błędów
   - Logowanie błędów

4. Testy:
   - Testy jednostkowe
   - Testy integracyjne
   - Testy wydajnościowe

5. Dokumentacja:
   - Dokumentacja API
   - Przykłady użycia
   - Instrukcje wdrożenia

6. Wdrożenie:
   - Code review
   - Testy w środowisku staging
   - Wdrożenie produkcyjne 