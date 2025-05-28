# Plan implementacji widoku preferencji użytkownika

## 1. Przegląd
Widok preferencji użytkownika umożliwia zarządzanie preferencjami żywieniowymi, w tym alergiami, nietolerancjami i docelową kalorycznością. Jest to kluczowy element aplikacji, wymagany przed utworzeniem pierwszego przepisu.

## 2. Routing widoku
- Ścieżka: `/preferences`
- Guard: `AuthGuard` (wymagane zalogowanie)

## 3. Struktura komponentów
```
PreferencesPageComponent
└── PreferencesFormComponent
    ├── MultiSelectComponent (allergies)
    ├── MultiSelectComponent (intolerances)
    └── MatInput (target calories)
```

## 4. Szczegóły komponentów

### PreferencesPageComponent
- Opis: Główny komponent widoku, zarządza stanem i komunikacją z API
- Główne elementy:
  - MatCard jako kontener
  - PreferencesFormComponent
  - MatProgressBar (stan ładowania)
  - MatSnackBar (powiadomienia)
- Obsługiwane interakcje:
  - Inicjalizacja danych
  - Obsługa błędów
  - Wyświetlanie powiadomień
- Typy:
  - PreferencesViewModel
  - PreferencesFormState
- Propsy: brak

### PreferencesFormComponent
- Opis: Formularz preferencji z walidacją i obsługą zapisu
- Główne elementy:
  - ReactiveFormModule
  - MultiSelectComponent (2x)
  - MatInput (target calories)
  - MatButton (zapisz)
- Obsługiwane interakcje:
  - Wprowadzanie danych
  - Walidacja formularza
  - Zapisywanie zmian
- Obsługiwana walidacja:
  - Target calories > 0
  - Wymagane pola (opcjonalne)
- Typy:
  - UserPreferencesDto
  - UserPreferencesCommandModel
- Propsy:
  - initialData: UserPreferencesDto
  - onSubmit: EventEmitter<UserPreferencesCommandModel>

### MultiSelectComponent
- Opis: Reużywalny komponent do wyboru wielu wartości
- Główne elementy:
  - MatChipList
  - MatChip
  - MatAutocomplete
- Obsługiwane interakcje:
  - Wybór wartości
  - Usuwanie wartości
  - Filtrowanie opcji
- Typy:
  - string[]
- Propsy:
  - label: string
  - options: string[]
  - value: string[]
  - onChange: EventEmitter<string[]>

## 5. Typy

### PreferencesViewModel
```typescript
interface PreferencesViewModel {
  allergies: string[];
  intolerances: string[];
  target_calories: number;
  created_at: string;
  updated_at: string;
}
```

### PreferencesFormState
```typescript
interface PreferencesFormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

## 6. Zarządzanie stanem
- Signal<PreferencesViewModel> dla danych formularza
- Signal<PreferencesFormState> dla stanu formularza
- Signal<boolean> dla stanu ładowania
- Signal<string | null> dla błędów

## 7. Integracja API
- GET /api/users/current/preferences
  - Wywołanie przy inicjalizacji komponentu
  - Obsługa odpowiedzi i błędów
- PUT /api/users/current/preferences
  - Wywołanie przy zapisie formularza
  - Obsługa odpowiedzi i błędów

## 8. Interakcje użytkownika
1. Wybór alergii:
   - Otwarcie listy
   - Wybór wartości
   - Usunięcie wartości
2. Wybór nietolerancji:
   - Otwarcie listy
   - Wybór wartości
   - Usunięcie wartości
3. Wprowadzenie kalorii:
   - Wprowadzenie wartości
   - Walidacja
4. Zapisywanie:
   - Kliknięcie przycisku
   - Potwierdzenie sukcesu

## 9. Warunki i walidacja
- Target calories:
  - Wartość > 0
  - Liczba całkowita
  - Walidacja w czasie rzeczywistym
- Alergie i nietolerancje:
  - Lista wartości z predefiniowanego zestawu
  - Możliwość wyboru wielu wartości

## 10. Obsługa błędów
- Błędy sieciowe:
  - Wyświetlenie komunikatu
  - Możliwość ponowienia
- Błędy walidacji:
  - Wyświetlenie pod formularzem
  - Podświetlenie pól
- Błędy autoryzacji:
  - Przekierowanie do logowania

## 11. Kroki implementacji
1. Utworzenie komponentów:
   - PreferencesPageComponent
   - PreferencesFormComponent
   - MultiSelectComponent
2. Implementacja typów i interfejsów
3. Implementacja formularza z walidacją
4. Integracja z API
5. Implementacja obsługi błędów
6. Dodanie powiadomień
7. Testy jednostkowe
8. Testy integracyjne 