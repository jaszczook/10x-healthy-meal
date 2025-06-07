# Plan implementacji widoku szczegółów przepisu

## 1. Przegląd
Widok szczegółów przepisu umożliwia użytkownikom przeglądanie pełnych informacji o zapisanym przepisie, w tym składników, kroków przygotowania, notatek oraz wartości kalorycznej. Widok zapewnia również możliwość usunięcia przepisu z potwierdzeniem akcji.

## 2. Routing widoku
- Ścieżka: `/recipes/:id`
- Parametr: `id` - identyfikator przepisu
- Guard: `AuthGuard` - weryfikacja autentykacji
- Resolver: `RecipeResolver` - pobranie danych przepisu

## 3. Struktura komponentów
```
RecipeDetailsComponent (container)
├── RecipeSummaryComponent (podsumowanie)
├── RecipeTabsComponent (nawigacja)
│   ├── IngredientsListComponent (składniki)
│   ├── StepsListComponent (kroki)
│   └── NotesComponent (notatki)
└── DeleteConfirmationDialogComponent (dialog usuwania)
```

## 4. Szczegóły komponentów

### RecipeDetailsComponent
- Opis: Główny komponent kontenerowy zarządzający stanem i logiką widoku
- Główne elementy:
  - Mat-Card jako kontener
  - RecipeSummaryComponent
  - RecipeTabsComponent
  - Mat-Button do usuwania
- Obsługiwane interakcje:
  - Inicjalizacja danych
  - Obsługa usuwania
  - Obsługa błędów
- Obsługiwana walidacja:
  - Sprawdzenie uprawnień użytkownika
  - Weryfikacja istnienia przepisu
- Typy:
  - RecipeDetailDto
  - RecipeViewModel
- Propsy:
  - recipeId: string

### RecipeSummaryComponent
- Opis: Wyświetla podsumowanie przepisu
- Główne elementy:
  - Mat-Card
  - Mat-List
- Obsługiwane interakcje:
  - Wyświetlanie tytułu
  - Wyświetlanie kalorii
  - Wyświetlanie dat
- Typy:
  - RecipeDetailDto
- Propsy:
  - recipe: RecipeDetailDto

### RecipeTabsComponent
- Opis: Zarządza zakładkami z różnymi sekcjami przepisu
- Główne elementy:
  - Mat-Tab-Group
  - Mat-Tab
- Obsługiwane interakcje:
  - Przełączanie zakładek
- Typy:
  - TabState
- Propsy:
  - recipe: RecipeDetailDto

### IngredientsListComponent
- Opis: Wyświetla listę składników
- Główne elementy:
  - Mat-List
  - Mat-List-Item
- Obsługiwane interakcje:
  - Wyświetlanie składników
  - Oznaczanie alergenów
- Typy:
  - IngredientDto[]
- Propsy:
  - ingredients: IngredientDto[]
  - userPreferences: UserPreferencesDto

### StepsListComponent
- Opis: Wyświetla kroki przygotowania
- Główne elementy:
  - Mat-List
  - Mat-List-Item
- Obsługiwane interakcje:
  - Wyświetlanie kroków
- Typy:
  - StepDto[]
- Propsy:
  - steps: StepDto[]

### NotesComponent
- Opis: Wyświetla notatki do przepisu
- Główne elementy:
  - Mat-Card
  - Mat-Card-Content
- Obsługiwane interakcje:
  - Wyświetlanie notatek
- Typy:
  - string
- Propsy:
  - notes: string

### DeleteConfirmationDialogComponent
- Opis: Dialog potwierdzający usunięcie przepisu
- Główne elementy:
  - Mat-Dialog
  - Mat-Dialog-Content
  - Mat-Dialog-Actions
- Obsługiwane interakcje:
  - Potwierdzenie usunięcia
  - Anulowanie
- Typy:
  - DeleteConfirmationState
- Propsy:
  - recipeTitle: string

## 5. Typy

### RecipeViewModel
```typescript
interface RecipeViewModel {
  id: string;
  title: string;
  recipeData: {
    ingredients: IngredientDto[];
    steps: StepDto[];
    notes?: string;
    calories?: number;
  };
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
}
```

### TabState
```typescript
interface TabState {
  activeTab: 'ingredients' | 'steps' | 'notes';
}
```

### DeleteConfirmationState
```typescript
interface DeleteConfirmationState {
  isOpen: boolean;
  recipeId: string;
  recipeTitle: string;
}
```

## 6. Zarządzanie stanem
- Użycie Angular Signals do zarządzania stanem
- Główne sygnały:
  - recipe: Signal<RecipeViewModel | null>
  - loading: Signal<boolean>
  - error: Signal<string | null>
  - tabState: Signal<TabState>
  - deleteState: Signal<DeleteConfirmationState>

## 7. Integracja API
- GET /api/recipes/:id
  - Typ odpowiedzi: RecipeDetailDto
  - Obsługa błędów: 401, 403, 404
- DELETE /api/recipes/:id
  - Typ odpowiedzi: void
  - Obsługa błędów: 401, 403, 404

## 8. Interakcje użytkownika
1. Przełączanie zakładek
   - Zmiana aktywnej zakładki
   - Aktualizacja widoku
2. Usuwanie przepisu
   - Kliknięcie przycisku usuwania
   - Wyświetlenie dialogu potwierdzenia
   - Potwierdzenie/Anulowanie
   - Przekierowanie do listy przepisów

## 9. Warunki i walidacja
1. Autentykacja
   - Weryfikacja przez AuthGuard
   - Przekierowanie do logowania
2. Autoryzacja
   - Sprawdzenie właściciela przepisu
   - Ukrycie przycisków edycji/usuwania
3. Dane przepisu
   - Weryfikacja istnienia przepisu
   - Obsługa brakujących pól

## 10. Obsługa błędów
1. Błędy sieciowe
   - Wyświetlenie komunikatu
   - Możliwość ponowienia
2. Błędy autoryzacji
   - Przekierowanie do logowania
3. Błędy usuwania
   - Wyświetlenie komunikatu
   - Zachowanie stanu

## 11. Kroki implementacji
1. Utworzenie komponentów
   - Generowanie komponentów przez Angular CLI
   - Implementacja podstawowej struktury
2. Implementacja routingu
   - Konfiguracja ścieżki
   - Dodanie guarda i resolvera
3. Implementacja komponentów
   - RecipeDetailsComponent
   - RecipeSummaryComponent
   - RecipeTabsComponent
   - IngredientsListComponent
   - StepsListComponent
   - NotesComponent
   - DeleteConfirmationDialogComponent
4. Implementacja zarządzania stanem
   - Utworzenie sygnałów
   - Implementacja logiki
5. Implementacja integracji API
   - Serwis do komunikacji
   - Obsługa błędów
6. Implementacja interakcji
   - Obsługa zdarzeń
   - Aktualizacja stanu
7. Testy
   - Testy jednostkowe
   - Testy integracyjne
8. Optymalizacja
   - Lazy loading
   - Change detection
9. Dokumentacja
   - Komentarze kodu
   - Dokumentacja komponentów 