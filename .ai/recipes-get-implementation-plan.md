# API Endpoint Implementation Plan: GET /api/recipes/:id

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania szczegółowych informacji o konkretnym przepisie. Wymaga uwierzytelnienia i zwraca pełne dane przepisu, w tym listę składników, kroki przygotowania, notatki i kalorie.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: /api/recipes/:id
- Parametry:
  - Wymagane: 
    - id (path parameter): UUID przepisu
  - Opcjonalne: brak
- Request Body: brak

## 3. Wykorzystywane typy
```typescript
// Główne DTO
RecipeDetailDto {
  id: string;
  title: string;
  recipe_data: RecipeDataDto;
  created_at: string | null;
  updated_at: string | null;
}

// Wspierające DTO
RecipeDataDto {
  ingredients: IngredientDto[];
  steps: StepDto[];
  notes?: string;
  calories?: number;
}

IngredientDto {
  name: string;
  amount: number;
  unit: string;
}

StepDto {
  description: string;
}
```

## 4. Szczegóły odpowiedzi
- Status: 200 OK
- Response Body: RecipeDetailDto
- Error Responses:
  - 401 Unauthorized: Brak uwierzytelnienia
  - 403 Forbidden: Brak uprawnień do przepisu
  - 404 Not Found: Przepis nie istnieje
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Odbierz żądanie w kontrolerze API
2. Zweryfikuj token uwierzytelniający
3. Wyodrębnij ID przepisu z parametrów ścieżki
4. Wywołaj serwis przepisów z ID
5. Serwis wykonuje zapytanie do bazy danych przez Supabase
6. RLS automatycznie weryfikuje uprawnienia użytkownika
7. Zwróć dane przepisu lub odpowiedni kod błędu

## 6. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wymagany token JWT
   - Weryfikacja tokenu przez middleware

2. Autoryzacja:
   - Wykorzystanie RLS w bazie danych
   - Weryfikacja własności przepisu

3. Walidacja danych:
   - Sprawdzenie formatu UUID
   - Walidacja struktury danych przepisu

## 7. Obsługa błędów
1. 401 Unauthorized:
   - Brak tokenu
   - Nieprawidłowy token
   - Wygasły token

2. 403 Forbidden:
   - Użytkownik próbuje uzyskać dostęp do przepisu innego użytkownika

3. 404 Not Found:
   - Przepis nie istnieje
   - Logowanie do error_logs

4. 500 Internal Server Error:
   - Błędy bazy danych
   - Logowanie do error_logs

## 8. Rozważania dotyczące wydajności
1. Optymalizacje:
   - Wykorzystanie indeksów bazy danych
   - Cachowanie często używanych przepisów
   - Minimalizacja liczby zapytań do bazy

2. Monitorowanie:
   - Śledzenie czasu odpowiedzi
   - Monitorowanie użycia pamięci
   - Logowanie wolnych zapytań

## 9. Etapy wdrożenia
1. Utworzenie serwisu przepisów:
   ```typescript
   // src/lib/services/recipe.service.ts
   export class RecipeService {
     constructor(private supabase: SupabaseClient) {}
     
     async getRecipeById(id: string): Promise<RecipeDetailDto> {
       // Implementacja
     }
   }
   ```

2. Implementacja kontrolera API:
   ```typescript
   // src/api/controllers/recipe.controller.ts
   export class RecipeController {
     constructor(private recipeService: RecipeService) {}
     
     async getRecipe(req: Request, res: Response) {
       // Implementacja
     }
   }
   ```

3. Konfiguracja routingu:
   ```typescript
   // src/api/routes/recipe.routes.ts
   router.get('/:id', authMiddleware, recipeController.getRecipe);
   ```

4. Implementacja middleware uwierzytelniania:
   ```typescript
   // src/api/middleware/auth.middleware.ts
   export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
     // Implementacja
   };
   ```

5. Testy:
   - Testy jednostkowe serwisu
   - Testy integracyjne endpointu
   - Testy bezpieczeństwa
   - Testy wydajności

6. Dokumentacja:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia
   - Dokumentacja obsługi błędów 