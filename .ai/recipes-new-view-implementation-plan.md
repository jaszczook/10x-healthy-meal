# Plan implementacji widoku tworzenia nowego przepisu

## 1. Przegląd
Widok tworzenia nowego przepisu umożliwia użytkownikom wprowadzenie niesformatowanego tekstu przepisu, który następnie jest analizowany przez AI w celu wygenerowania strukturyzowanego JSON. Widok obsługuje proces analizy, wyświetla stan ładowania i zarządza potencjalnymi błędami.

## 2. Routing widoku
- Ścieżka: `/recipes/new`
- Guard: AuthGuard (wymagane uwierzytelnienie)

## 3. Struktura komponentów
```
RecipeNewView (Container)
├── RecipeInputForm
│   ├── MatCard (instructions)
│   ├── MatTextArea (recipe input)
│   └── MatButton (submit)
├── LoadingIndicator
│   ├── MatProgressBar
│   └── MatButton (cancel)
└── ErrorDisplay
    └── MatSnackBar
```

## 4. Szczegóły komponentów
### RecipeNewView
- Opis komponentu: Główny kontener widoku tworzenia przepisu
- Główne elementy:
  - RecipeInputForm
  - LoadingIndicator
  - ErrorDisplay
- Obsługiwane interakcje:
  - Przekierowanie po sukcesie
  - Obsługa błędów
- Obsługiwana walidacja:
  - Stan uwierzytelnienia
- Typy:
  - RecipeNewViewModel
- Propsy: Brak

### RecipeInputForm
- Opis komponentu: Formularz wprowadzania tekstu przepisu
- Główne elementy:
  - MatCard z instrukcjami
  - MatTextArea dla tekstu przepisu
  - MatButton do wysłania
- Obsługiwane interakcje:
  - Wprowadzanie tekstu
  - Wysyłanie formularza
- Obsługiwana walidacja:
  - Puste pole tekstowe
- Typy:
  - ParseRecipeCommandModel
- Propsy:
  - onSubmit: (text: string) => void
  - isProcessing: boolean

### LoadingIndicator
- Opis komponentu: Wskaźnik postępu podczas przetwarzania
- Główne elementy:
  - MatProgressBar
  - MatButton do anulowania
- Obsługiwane interakcje:
  - Anulowanie przetwarzania
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy:
  - onCancel: () => void

### ErrorDisplay
- Opis komponentu: Wyświetlanie komunikatów o błędach
- Główne elementy:
  - MatSnackBar
- Obsługiwane interakcje:
  - Zamykanie komunikatu
- Obsługiwana walidacja: Brak
- Typy:
  - ValidationError
- Propsy:
  - error: string | null

## 5. Typy
### RecipeNewViewModel
```typescript
interface RecipeNewViewModel {
  isProcessing: boolean;
  error: string | null;
  recipeText: string;
  timeoutId: number | null;
}
```

### ParseRecipeCommandModel (istniejący)
```typescript
interface ParseRecipeCommandModel {
  recipe_text: string;
}
```

### ParsedRecipeDto (istniejący)
```typescript
interface ParsedRecipeDto {
  title: string;
  recipe_data: RecipeDataDto;
}
```

## 6. Zarządzanie stanem
- Signal `isProcessing` do śledzenia stanu przetwarzania
- Signal `error` do zarządzania komunikatami błędów
- Signal `recipeText` do przechowywania tekstu przepisu
- Signal `timeoutId` do zarządzania timeoutem

## 7. Integracja API
- Endpoint: POST /api/recipes/parse
- Request: ParseRecipeCommandModel
- Response: ParsedRecipeDto
- Obsługa kodów błędów:
  - 400: Nieprawidłowe dane
  - 401: Brak uwierzytelnienia
  - 408: Timeout przetwarzania
  - 500: Błąd serwera

## 8. Interakcje użytkownika
1. Wprowadzenie tekstu przepisu
2. Wysłanie formularza
3. Obserwowanie postępu przetwarzania
4. Anulowanie przetwarzania (opcjonalnie)
5. Otrzymanie wyniku lub komunikatu o błędzie

## 9. Warunki i walidacja
- Uwierzytelnienie użytkownika (AuthGuard)
- Niepuste pole tekstowe
- Limit czasowy 60s
- Poprawność odpowiedzi API

## 10. Obsługa błędów
- Puste pole tekstowe: Komunikat w formularzu
- Brak uwierzytelnienia: Przekierowanie do logowania
- Timeout: Komunikat o przekroczeniu czasu
- Błąd serwera: Komunikat o błędzie przetwarzania
- Błąd sieci: Komunikat o problemie z połączeniem

## 11. Kroki implementacji
1. Utworzenie komponentu RecipeNewView
2. Implementacja RecipeInputForm
3. Implementacja LoadingIndicator
4. Implementacja ErrorDisplay
5. Integracja z API
6. Implementacja zarządzania stanem
7. Dodanie obsługi błędów
8. Implementacja timeoutu
9. Testy komponentów
10. Testy integracyjne 