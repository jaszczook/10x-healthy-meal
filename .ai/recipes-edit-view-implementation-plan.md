# Plan implementacji widoku edycji/przeglądania przepisu

## 1. Przegląd
Widok edycji/przeglądania przepisu umożliwia użytkownikom edycję struktury przepisu wygenerowanej przez AI lub istniejącego przepisu. Widok oferuje tryb edycji i podglądu, z możliwością przełączania między nimi. Zapewnia pełną funkcjonalność CRUD dla przepisów, z integracją preferencji użytkownika i walidacją danych.

## 2. Routing widoku
- Ścieżka dla nowego przepisu: `/recipes/edit/new`
- Ścieżka dla istniejącego przepisu: `/recipes/:id`
- Guard: `RecipeOwnerGuard` (sprawdza uprawnienia do edycji)

## 3. Struktura komponentów
```
RecipeEditViewComponent (container)
├── RecipeFormComponent
│   ├── IngredientsListComponent
│   └── StepsListComponent
├── RecipeSummaryComponent
└── RecipeViewModeComponent
```

## 4. Szczegóły komponentów

### RecipeEditViewComponent
- Opis: Główny komponent kontenerowy zarządzający stanem i logiką widoku
- Główne elementy:
  - MatStepper dla nawigacji między sekcjami
  - Przyciski akcji (Zapisz, Anuluj, Przełącz tryb)
  - MatSnackBar dla powiadomień
- Obsługiwane interakcje:
  - Przełączanie trybu edycja/podgląd
  - Zapisywanie zmian
  - Anulowanie zmian
- Obsługiwana walidacja:
  - Sprawdzanie uprawnień użytkownika
  - Walidacja formularza przed zapisem
- Typy:
  - RecipeDetailDto
  - RecipeFormViewModel
- Propsy:
  - recipeId?: string
  - isNewRecipe: boolean

### RecipeFormComponent
- Opis: Komponent formularza edycji przepisu
- Główne elementy:
  - MatFormField dla tytułu
  - IngredientsListComponent
  - StepsListComponent
  - MatFormField dla notatek
- Obsługiwane interakcje:
  - Edycja pól formularza
  - Dodawanie/usuwanie składników
  - Dodawanie/usuwanie kroków
- Obsługiwana walidacja:
  - Wymagany tytuł
  - Wymagane składniki
  - Wymagane kroki
  - Ilości > 0
- Typy:
  - RecipeFormViewModel
  - IngredientViewModel
  - StepViewModel
- Propsy:
  - formData: RecipeFormViewModel
  - userPreferences: UserPreferencesDto

### IngredientsListComponent
- Opis: Komponent listy składników z możliwością edycji
- Główne elementy:
  - MatTable dla składników
  - Przyciski dodawania/usuwania
  - MatFormField dla pól edycji
- Obsługiwane interakcje:
  - Dodawanie nowego składnika
  - Usuwanie składnika
  - Edycja składnika
- Obsługiwana walidacja:
  - Wymagana nazwa
  - Ilość > 0
  - Wymagana jednostka
- Typy:
  - IngredientViewModel[]
- Propsy:
  - ingredients: IngredientViewModel[]
  - userPreferences: UserPreferencesDto

### StepsListComponent
- Opis: Komponent listy kroków przygotowania
- Główne elementy:
  - MatList dla kroków
  - Przyciski dodawania/usuwania
  - MatFormField dla opisu
- Obsługiwane interakcje:
  - Dodawanie nowego kroku
  - Usuwanie kroku
  - Edycja kroku
- Obsługiwana walidacja:
  - Wymagany opis
- Typy:
  - StepViewModel[]
- Propsy:
  - steps: StepViewModel[]

### RecipeSummaryComponent
- Opis: Komponent podsumowania przepisu
- Główne elementy:
  - Lista składników
  - Suma kalorii
  - Oznaczenia alergenów
- Obsługiwane interakcje:
  - Brak (tylko podgląd)
- Obsługiwana walidacja:
  - Brak
- Typy:
  - RecipeSummaryViewModel
- Propsy:
  - summary: RecipeSummaryViewModel
  - userPreferences: UserPreferencesDto

### RecipeViewModeComponent
- Opis: Komponent trybu podglądu
- Główne elementy:
  - Sformatowany widok przepisu
  - Podświetlone alergeny
  - Podsumowanie kalorii
- Obsługiwane interakcje:
  - Brak (tylko podgląd)
- Obsługiwana walidacja:
  - Brak
- Typy:
  - RecipeDetailDto
- Propsy:
  - recipe: RecipeDetailDto
  - userPreferences: UserPreferencesDto

## 5. Typy

### RecipeFormViewModel
```typescript
interface RecipeFormViewModel {
  title: string;
  ingredients: IngredientViewModel[];
  steps: StepViewModel[];
  notes?: string;
  calories?: number;
}
```

### IngredientViewModel
```typescript
interface IngredientViewModel {
  name: string;
  amount: number;
  unit: string;
  isAllergen: boolean;
}
```

### StepViewModel
```typescript
interface StepViewModel {
  description: string;
  order: number;
}
```

### RecipeSummaryViewModel
```typescript
interface RecipeSummaryViewModel {
  totalCalories: number;
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    isAllergen: boolean;
  }[];
}
```

## 6. Zarządzanie stanem
- Użycie Angular Signals dla:
  - Stanu formularza (RecipeFormViewModel)
  - Trybu widoku (edycja/podgląd)
  - Stanu walidacji
  - Stanu ładowania API
- Custom hook `useRecipeForm` dla:
  - Inicjalizacji formularza
  - Obsługi zmian
  - Walidacji
  - Zapisywania

## 7. Integracja API
- Endpointy:
  - POST /api/recipes (tworzenie)
  - PUT /api/recipes/:id (aktualizacja)
  - GET /api/recipes/:id (pobieranie)
- Typy żądań:
  - CreateRecipeCommandModel
  - UpdateRecipeCommandModel
- Typy odpowiedzi:
  - RecipeDetailDto
  - ValidationResultDto

## 8. Interakcje użytkownika
1. Edycja przepisu:
   - Modyfikacja tytułu
   - Dodawanie/usuwanie składników
   - Edycja ilości i jednostek
   - Dodawanie/usuwanie kroków
   - Edycja notatek
2. Przełączanie trybów:
   - Przełącznik edycja/podgląd
   - Automatyczne zapisywanie wersji roboczej
3. Zapisywanie:
   - Przycisk "Zapisz"
   - Dialog potwierdzenia
   - Powiadomienie o sukcesie
4. Anulowanie:
   - Przycisk "Anuluj"
   - Dialog potwierdzenia
   - Powrót do listy

## 9. Warunki i walidacja
1. Walidacja formularza:
   - Tytuł: wymagany, min. 3 znaki
   - Składniki: wymagane, min. 1
   - Kroki: wymagane, min. 1
   - Ilości: > 0
2. Walidacja API:
   - Uprawnienia użytkownika
   - Poprawność danych
   - Unikalność tytułu
3. Walidacja biznesowa:
   - Spójność kalorii
   - Oznaczenie alergenów

## 10. Obsługa błędów
1. Błędy sieciowe:
   - Wyświetlanie komunikatu w MatSnackBar
   - Automatyczne ponowienie próby
2. Błędy walidacji:
   - Wyświetlanie błędów inline
   - Podświetlanie nieprawidłowych pól
3. Błędy uprawnień:
   - Przekierowanie do logowania
   - Komunikat o braku uprawnień
4. Błędy API:
   - Obsługa kodów 400, 401, 403, 404
   - Logowanie błędów

## 11. Kroki implementacji
1. Przygotowanie struktury:
   - Utworzenie komponentów
   - Konfiguracja routingu
   - Implementacja guarda
2. Implementacja formularza:
   - Utworzenie RecipeFormComponent
   - Implementacja IngredientsListComponent
   - Implementacja StepsListComponent
3. Implementacja podglądu:
   - Utworzenie RecipeViewModeComponent
   - Implementacja RecipeSummaryComponent
4. Zarządzanie stanem:
   - Implementacja signalów
   - Utworzenie useRecipeForm hooka
5. Integracja API:
   - Implementacja serwisu
   - Obsługa błędów
6. Walidacja:
   - Implementacja walidatorów
   - Integracja z formularzem
7. Testy:
   - Testy jednostkowe
   - Testy integracyjne
   - Testy E2E
8. Optymalizacja:
   - Implementacja OnPush
   - Lazy loading
   - Cachowanie 