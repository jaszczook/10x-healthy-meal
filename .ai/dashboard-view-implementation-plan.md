# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard jest głównym ekranem aplikacji po zalogowaniu użytkownika. Jego celem jest wyświetlenie listy zapisanych przepisów kulinarnych użytkownika, umożliwienie nawigacji między stronami przepisów, sortowania, filtrowania oraz przejścia do dodawania nowego przepisu lub przeglądania szczegółów istniejącego.

## 2. Routing widoku
- Ścieżka: `/dashboard`
- Dostęp: Wymaga zalogowanego użytkownika. Dostęp do tej ścieżki powinien być chroniony przez `AuthGuard`. Użytkownicy niezalogowani powinni być przekierowywani na stronę logowania. Alternatywnie, może to być również domyślna ścieżka `/` po zalogowaniu.

## 3. Struktura komponentów
```
DashboardPageComponent (Komponent Kontenerowy/Logiki)
│
├── RecipeFiltersComponent (Opcjonalny, komponent prezentacyjny dla filtrów)
│   └── (Kontrolki MatSort, MatInput dla wyszukiwania)
│
├── RecipeListComponent (Komponent Prezentacyjny)
│   └── Mat-Grid-List
│       └── RecipeCardComponent (Komponent Prezentacyjny, powtarzany)
│           └── Mat-Card
│
├── AppPaginatorComponent (Komponent Prezentacyjny, opakowanie na Mat-Paginator)
│   └── Mat-Paginator
│
└── Mat-Fab (Przycisk do dodawania nowego przepisu)
```

## 4. Szczegóły komponentów

### `DashboardPageComponent`
- **Opis komponentu**: Główny komponent zarządzający logiką widoku dashboard. Odpowiedzialny za pobieranie danych o przepisach, obsługę paginacji, sortowania, filtrowania, zarządzanie stanem widoku (ładowanie, błędy) oraz przekazywanie danych do komponentów prezentacyjnych.
- **Główne elementy HTML i komponenty dzieci**:
    - `RecipeFiltersComponent` (opcjonalnie, lub kontrolki filtrów bezpośrednio w szablonie)
    - `RecipeListComponent`
    - `AppPaginatorComponent`
    - `mat-spinner` (lub inny wskaźnik ładowania)
    - Element do wyświetlania błędów
    - `button[mat-fab]` (Floating Action Button)
- **Obsługiwane interakcje/zdarzenia**:
    - Inicjalizacja komponentu (pobranie danych)
    - Zmiana strony w paginatorze (`(pageChange)`)
    - Zmiana kryteriów sortowania (`(sortChange)`)
    - Zmiana terminu wyszukiwania (`(searchChange)`)
    - Kliknięcie przycisku FAB (`(click)`) -> nawigacja do tworzenia przepisu
    - Kliknięcie karty przepisu (przekazane z `RecipeListComponent`) -> nawigacja do szczegółów przepisu
- **Warunki walidacji**:
    - Parametry przekazywane do API (np. `per_page` w dozwolonym zakresie) są zgodne ze specyfikacją API.
- **Typy**:
    - `RecipesListResponseDto`
    - `RecipeListItemDto`
    - `DashboardPageViewModel` (wewnętrzny model stanu oparty na sygnałach)
- **Propsy (wejścia)**: Brak (jest to komponent trasy).

### `RecipeFiltersComponent`
- **Opis komponentu**: Komponent prezentacyjny zawierający kontrolki do sortowania listy przepisów (np. według tytułu, daty utworzenia) oraz pole tekstowe do wyszukiwania przepisów po tytule.
- **Główne elementy HTML i komponenty dzieci**:
    - `mat-form-field` z `mat-select` do wyboru pola sortowania (`sort_by`)
    - `mat-button-toggle-group` lub `mat-select` do wyboru kierunku sortowania (`sort_direction`)
    - `mat-form-field` z `input[matInput]` do wprowadzenia tekstu wyszukiwania (`search`)
- **Obsługiwane interakcje/zdarzenia**:
    - `(filtersChanged)`: Niestandardowe zdarzenie emitujące obiekt z aktualnymi wartościami filtrów (`searchTerm`, `sortBy`, `sortDirection`).
- **Warunki walidacji**:
    - Opcjonalnie, minimalna długość dla `searchTerm` przed wysłaniem (choć główna walidacja po stronie API).
- **Typy**:
    - `SortOption` (dla opcji sortowania)
    - `FilterChangePayload` (dla emitowanego zdarzenia)
- **Propsy (wejścia)**:
    - `initialSortBy: string`
    - `initialSortDirection: 'asc' | 'desc'`
    - `initialSearchTerm: string`
    - `sortOptions: SortOption[]`

### `RecipeListComponent`
- **Opis komponentu**: Komponent prezentacyjny odpowiedzialny za wyświetlanie listy przepisów w formie siatki kart.
- **Główne elementy HTML i komponenty dzieci**:
    - `mat-grid-list`
    - Pętla `@for` iterująca po przepisach i renderująca `RecipeCardComponent` dla każdego z nich.
    - Komunikat "Brak przepisów do wyświetlenia", jeśli lista jest pusta.
- **Obsługiwane interakcje/zdarzenia**:
    - `(recipeClicked)`: Niestandardowe zdarzenie emitujące `id` klikniętego przepisu.
- **Warunki walidacji**: Brak.
- **Typy**:
    - `RecipeListItemDto[]` (jako `recipes`)
- **Propsy (wejścia)**:
    - `recipes: Signal<RecipeListItemDto[]>`: Sygnał z listą przepisów do wyświetlenia.
    - `cols: Signal<number>`: Sygnał z liczbą kolumn dla `mat-grid-list` (dla responsywności).

### `RecipeCardComponent`
- **Opis komponentu**: Komponent prezentacyjny wyświetlający podsumowanie pojedynczego przepisu na karcie `MatCard`.
- **Główne elementy HTML i komponenty dzieci**:
    - `mat-card`
    - `mat-card-header` z `mat-card-title` (tytuł przepisu) i `mat-card-subtitle` (data utworzenia).
    - `mat-card-content` (podsumowanie kalorii).
    - Możliwość dodania `mat-card-actions` z przyciskiem "Zobacz szczegóły", jeśli to preferowane nad kliknięciem całej karty.
- **Obsługiwane interakcje/zdarzenia**:
    - `(click)`: Standardowe zdarzenie kliknięcia, które będzie propagowane do `RecipeListComponent`.
- **Warunki walidacji**: Brak.
- **Typy**:
    - `RecipeListItemDto` (jako `recipe`)
- **Propsy (wejścia)**:
    - `recipe: RecipeListItemDto`: Obiekt przepisu do wyświetlenia.

### `AppPaginatorComponent`
- **Opis komponentu**: Komponent prezentacyjny, opakowujący `MatPaginator` dla spójnego użycia w aplikacji.
- **Główne elementy HTML i komponenty dzieci**:
    - `mat-paginator`
- **Obsługiwane interakcje/zdarzenia**:
    - `(page)`: Standardowe zdarzenie `PageEvent` z `MatPaginator`.
- **Warunki walidacji**: Brak.
- **Typy**:
    - `PageEvent` (z `@angular/material/paginator`)
- **Propsy (wejścia)**:
    - `length: number` (całkowita liczba elementów)
    - `pageSize: number` (liczba elementów na stronie)
    - `pageIndex: number` (indeks bieżącej strony, 0-based)
    - `pageSizeOptions: number[]` (np. `[5, 10, 25, 50]`)
    - `showFirstLastButtons: boolean`

## 5. Typy
- **Istniejące DTO (z `src/types/dto.ts`)**:
    - **`RecipeListItemDto`**:
        - `id: string`
        - `title: string`
        - `total_calories: number | null`
        - `created_at: string | null` (ISO date string)
        - `updated_at: string | null` (ISO date string)
    - **`RecipesListResponseDto extends PaginatedResponse<RecipeListItemDto>`**:
        - `total: number`
        - `page: number`
        - `per_page: number`
        - `total_pages: number`
        - `data: RecipeListItemDto[]`

- **Nowe typy ViewModel (specyficzne dla frontendu)**:
    - **`DashboardPageViewModel`** (stan wewnętrzny `DashboardPageComponent` oparty na sygnałach):
        - `recipesListResponse = signal<RecipesListResponseDto | null>(null)`
        - `recipes = computed(() => recipesListResponse()?.data ?? [])`
        - `totalRecipes = computed(() => recipesListResponse()?.total ?? 0)`
        - `currentPage = signal<number>(1)` (1-indeksowane dla API)
        - `itemsPerPage = signal<number>(10)`
        - `totalPages = computed(() => recipesListResponse()?.total_pages ?? 0)`
        - `sortBy = signal<string>('created_at')` (klucze z `RecipeListItemDto` dozwolone do sortowania)
        - `sortDirection = signal<'asc' | 'desc'>('desc')`
        - `searchTerm = signal<string>('')`
        - `isLoading = signal<boolean>(false)`
        - `error = signal<string | null>(null)`
    - **`SortOption`** (dla `RecipeFiltersComponent`):
        - `value: string` (np. 'title', 'created_at', 'updated_at')
        - `viewValue: string` (np. 'Tytuł', 'Data utworzenia', 'Data modyfikacji')
    - **`FilterChangePayload`** (emitowane przez `RecipeFiltersComponent`):
        - `searchTerm?: string`
        - `sortBy?: string`
        - `sortDirection?: 'asc' | 'desc'`

## 6. Zarządzanie stanem
Stan widoku będzie zarządzany w `DashboardPageComponent` przy użyciu sygnałów Angulara (`signal`, `computed`, `effect`).
- **Sygnały wejściowe dla API**: `currentPage`, `itemsPerPage`, `sortBy`, `sortDirection`, `searchTerm`.
- **Sygnał odpowiedzi API**: `recipesListResponse`.
- **Sygnały pochodne**: `recipes`, `totalRecipes`, `totalPages`.
- **Sygnały stanu UI**: `isLoading`, `error`.
- **Efekt (`effect`)**: Będzie obserwował zmiany w sygnałach wejściowych dla API. Przy każdej zmianie, wywoła metodę pobierającą dane z serwisu `RecipeService`, aktualizując `isLoading`, `recipesListResponse` i `error`.
- Nie przewiduje się potrzeby tworzenia dedykowanego customowego hooka (serwisu z logiką stanu) poza standardowym serwisem (`RecipeService`) do komunikacji z API. Komponent kontenerowy (`DashboardPageComponent`) będzie zarządzał swoim lokalnym stanem widoku.

## 7. Integracja API
- **Endpoint**: `GET /api/recipes`
- **Serwis**: `RecipeService` będzie posiadał metodę, np. `getRecipes(params: GetRecipesApiParams): Observable<RecipesListResponseDto>`.
    ```typescript
    interface GetRecipesApiParams {
      page?: number;
      per_page?: number;
      sort_by?: string; // 'title' | 'created_at' | 'updated_at'
      sort_direction?: 'asc' | 'desc';
      search?: string;
    }
    ```
- **Żądanie**:
    - `DashboardPageComponent` będzie konstruować obiekt `GetRecipesApiParams` na podstawie wartości sygnałów (`currentPage`, `itemsPerPage`, `sortBy`, `sortDirection`, `searchTerm`).
    - Paginator `MatPaginator` używa `pageIndex` (0-indeksowane), więc `params.page = pageIndex + 1`.
- **Odpowiedź**:
    - Spodziewany typ odpowiedzi: `RecipesListResponseDto`.
    - Po otrzymaniu odpowiedzi, `recipesListResponse` zostanie zaktualizowany.
    - W przypadku sukcesu, dane z `recipesListResponse().data` zostaną użyte do wyświetlenia listy. `recipesListResponse().total` dla paginatora.
- **Obsługa ładowania**: Sygnał `isLoading` będzie ustawiany na `true` przed wywołaniem API i na `false` po otrzymaniu odpowiedzi (sukces lub błąd).
- **Obsługa błędów**: Sygnał `error` będzie aktualizowany w przypadku błędu API. Błąd 401 Unauthorized powinien być globalnie obsługiwany przez interceptor HTTP, który przekieruje do logowania.

## 8. Interakcje użytkownika
- **Ładowanie widoku**:
    - Automatyczne pobranie pierwszej strony przepisów z domyślnym sortowaniem.
    - Wyświetlenie wskaźnika ładowania.
- **Paginacja**:
    - Użytkownik klika przyciski nawigacyjne paginatora lub zmienia liczbę elementów na stronie.
    - Aktualizacja sygnałów `currentPage` i/lub `itemsPerPage`.
    - Wywołanie API z nowymi parametrami.
    - Aktualizacja listy przepisów i stanu paginatora.
- **Sortowanie**:
    - Użytkownik wybiera kryterium sortowania i/lub kierunek w `RecipeFiltersComponent`.
    - Aktualizacja sygnałów `sortBy` i `sortDirection`.
    - Wywołanie API.
    - Aktualizacja listy przepisów.
- **Wyszukiwanie**:
    - Użytkownik wpisuje tekst w polu wyszukiwania w `RecipeFiltersComponent`.
    - Aktualizacja sygnału `searchTerm` (zalecane z debouncingiem).
    - Wywołanie API.
    - Aktualizacja listy przepisów.
- **Kliknięcie karty przepisu**:
    - Użytkownik klika na `RecipeCardComponent`.
    - Nawigacja do widoku szczegółów przepisu (`/recipes/:id`).
- **Kliknięcie przycisku FAB**:
    - Użytkownik klika pływający przycisk akcji.
    - Nawigacja do widoku tworzenia nowego przepisu (`/recipes/new` lub podobny).
- **Wyświetlanie stanu braku przepisów**:
    - Jeśli API zwróci pustą listę `data`, komponent `RecipeListComponent` wyświetli odpowiedni komunikat.

## 9. Warunki i walidacja
- **Dostęp do widoku**: Chroniony przez `AuthGuard`. Jeśli użytkownik nie jest zalogowany, następuje przekierowanie na stronę logowania.
- **Parametry API**:
    - `page`: Liczba całkowita > 0. Zapewniane przez logikę komponentu i `MatPaginator`.
    - `per_page`: Liczba całkowita, np. z zakresu 1-50. Kontrolowane przez `pageSizeOptions` w `MatPaginator` i logikę komponentu.
    - `sort_by`: Ciąg znaków odpowiadający dozwolonym polom (np. `title`, `created_at`, `updated_at`). Wybierane z predefiniowanej listy w UI.
    - `sort_direction`: `'asc'` lub `'desc'`. Wybierane z predefiniowanej listy/przełącznika w UI.
- **Wyszukiwanie (`search`)**: Ciąg znaków. Zaleca się debouncing, aby uniknąć nadmiernych żądań API podczas pisania.
- **Format daty**: `created_at` i `updated_at` z API są stringami ISO. W UI będą formatowane przy użyciu `DatePipe` Angulara (np. `recipe.created_at | date:'shortDate'`).
- **Kalorie**: `total_calories` może być `null`. UI powinno to obsłużyć, np. wyświetlając "-" lub "Brak danych".

## 10. Obsługa błędów
- **Błędy API (ogólne)**:
    - Jeśli wywołanie `RecipeService.getRecipes()` zakończy się błędem (np. problem z siecią, błąd serwera 5xx), sygnał `isLoading` jest ustawiany na `false`, a sygnał `error` jest aktualizowany komunikatem błędu.
    - W UI, w miejscu listy przepisów lub w dedykowanym miejscu, wyświetlany jest komunikat o błędzie (np. "Nie udało się załadować przepisów. Spróbuj ponownie później.") wraz z ewentualną opcją ponowienia próby.
- **Brak autoryzacji (401 Unauthorized)**:
    - Powinien być obsługiwany globalnie przez interceptor HTTP. Użytkownik jest przekierowywany na stronę logowania. Komponent `DashboardPageComponent` może nie być nawet aktywowany, jeśli `AuthGuard` zablokuje dostęp.
- **Brak przepisów**:
    - Jeśli API zwróci sukces, ale tablica `data` jest pusta, `RecipeListComponent` wyświetli komunikat (np. "Nie masz jeszcze żadnych przepisów. Kliknij '+' aby dodać swój pierwszy przepis!"). Sygnał `error` pozostaje `null`.
- **Niepoprawne parametry zapytania (4xx)**:
    - Chociaż frontend powinien konstruować poprawne zapytania, jeśli API zwróci błąd 4xx z powodu niepoprawnych parametrów, należy to potraktować jako błąd API i wyświetlić stosowny komunikat.

## 11. Kroki implementacji
1.  **Utworzenie struktury folderów i plików**:
    - `src/app/features/dashboard/`
        - `dashboard-page/dashboard-page.component.ts (.html, .scss)`
        - `components/`
            - `recipe-filters/recipe-filters.component.ts (.html, .scss)` (jeśli wydzielony)
            - `recipe-list/recipe-list.component.ts (.html, .scss)`
            - `recipe-card/recipe-card.component.ts (.html, .scss)`
            - `app-paginator/app-paginator.component.ts (.html, .scss)` (jeśli wydzielony)
        - `dashboard.routes.ts` (lub konfiguracja w głównym routingu)
2.  **Definicja typów ViewModel**: Zdefiniuj `SortOption`, `FilterChangePayload` w odpowiednim pliku (np. `src/app/features/dashboard/types.ts`).
3.  **Implementacja `RecipeService`**: Dodaj metodę `getRecipes(params: GetRecipesApiParams): Observable<RecipesListResponseDto>` komunikującą się z `GET /api/recipes`.
4.  **Implementacja `DashboardPageComponent`**:
    - Wstrzyknij `RecipeService`, `Router`, `BreakpointObserver`.
    - Zdefiniuj sygnały dla stanu (`isLoading`, `error`, parametry API, odpowiedź API).
    - Implementuj `effect` do pobierania danych przy zmianie parametrów API.
    - Implementuj metody obsługi zdarzeń (zmiana strony, sortowania, wyszukiwania, kliknięcie FAB, kliknięcie karty).
    - Implementuj logikę nawigacji.
    - Dodaj `BreakpointObserver` do dynamicznej zmiany liczby kolumn w siatce.
5.  **Implementacja `RecipeCardComponent`**:
    - Przyjmij `recipe: RecipeListItemDto` jako `@Input()`.
    - Wyświetl dane przepisu używając `MatCard`.
    - Użyj `DatePipe` do formatowania dat.
6.  **Implementacja `RecipeListComponent`**:
    - Przyjmij `recipes: Signal<RecipeListItemDto[]>` i `cols: Signal<number>` jako `@Input()`.
    - Użyj `@for` do renderowania `RecipeCardComponent`.
    - Emituj `(recipeClicked)` z `id` przepisu.
    - Wyświetlaj komunikat o braku przepisów.
7.  **Implementacja `RecipeFiltersComponent` (jeśli wydzielony)**:
    - Przyjmij `initialSortBy`, `initialSortDirection`, `initialSearchTerm`, `sortOptions` jako `@Input()`.
    - Użyj kontrolek Angular Material (`mat-select`, `input[matInput]`).
    - Emituj `(filtersChanged)` przy zmianie wartości.
    - Zaimplementuj debouncing dla pola wyszukiwania.
8.  **Implementacja `AppPaginatorComponent` (jeśli wydzielony, lub użyj `MatPaginator` bezpośrednio)**:
    - Przyjmij propsy dla `MatPaginator`.
    - Emituj zdarzenie `(page)`.
9.  **Szablon `DashboardPageComponent.html`**:
    - Zintegruj wszystkie podkomponenty.
    - Dodaj wskaźnik ładowania (`<mat-spinner *ngIf="isLoading()">`).
    - Wyświetlaj komunikaty o błędach (`<div *ngIf="error()">{{ error() }}</div>`).
    - Dodaj FAB.
10. **Routing**: Skonfiguruj trasę `/dashboard` wskazującą na `DashboardPageComponent` i zabezpiecz ją `AuthGuard`.
11. **Styling (SCSS)**: Ostyluj komponenty zgodnie z projektem, używając Angular Material.
12. **Testy Jednostkowe**: Napisz testy dla logiki komponentów (szczególnie `DashboardPageComponent`) i interakcji.
13. **Testy E2E (opcjonalnie)**: Stwórz testy weryfikujące przepływ użytkownika na widoku dashboard.
14. **Dostępność (ARIA)**: Upewnij się, że wszystkie interaktywne elementy są dostępne i mają odpowiednie atrybuty ARIA. 

## 12. Dodatkowe informacje
- **Dodatkowe informacje**:
    - W przypadku wydzielonych komponentów (np. `RecipeFiltersComponent`, `RecipeListComponent`), należy zastosować odpowiednie dekoratory i logikę w celu zarządzania stanem i interakcjami.
    - W przypadku wydzielonych komponentów, należy zastosować odpowiednie dekoratory i logikę w celu zarządzania stanem i interakcjami.
    - W przypadku wydzielonych komponentów, należy zastosować odpowiednie dekoratory i logikę w celu zarządzania stanem i interakcjami.

## 13. Przykładowe zastosowanie
- **Przykładowe zastosowanie**:
    - W przypadku wydzielonych komponentów, należy zastosować odpowiednie dekoratory i logikę w celu zarządzania stanem i interakcjami.
    - W przypadku wydzielonych komponentów, należy zastosować odpowiednie dekoratory i logikę w celu zarządzania stanem i interakcjami.
    - W przypadku wydzielonych komponentów, należy zastosować odpowiednie dekoratory i logikę w celu zarządzania stanem i interakcjami. 