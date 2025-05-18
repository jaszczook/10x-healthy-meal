

Read file: .ai/prd.md

Read file: .ai/api-plan.md

Search files...

Ran tool
# Architektura UI dla HealthyMeal

## 1. Przegląd struktury UI

Aplikacja HealthyMeal będzie zbudowana jako aplikacja webowa SPA z wykorzystaniem Angular 19 i Angular Material. Struktura interfejsu użytkownika będzie oparta na responsywnych kartach i formularzyach, z centralnym układem nawigacyjnym dla zapewnienia spójnego doświadczenia użytkownika. Aplikacja będzie zorganizowana wokół kilku głównych widoków, które obsługują podstawowe funkcje: uwierzytelnianie, zarządzanie preferencjami, przeglądanie przepisów oraz tworzenie i edycję przepisów.

Architektura UI jest zaprojektowana tak, aby wspierać główne przypadki użycia z PRD, ze szczególnym uwzględnieniem procesu dodawania i personalizowania przepisów z wykorzystaniem AI. Interfejs będzie optymalizowany pod przeglądarkę Chrome w rozdzielczości FullHD, zgodnie z wymaganiami niefunkcjonalnymi.

## 2. Lista widoków

### 2.1. Widok logowania/rejestracji
- **Ścieżka:** `/auth`
- **Główny cel:** Umożliwienie użytkownikom rejestracji lub logowania do aplikacji
- **Kluczowe informacje:** Formularz logowania/rejestracji z polami email i hasło
- **Kluczowe komponenty:**
  - Supabase Auth UI zintegrowany z Angular
  - Mat-Card zawierający formularz
  - Przycisk przełączania między logowaniem a rejestracją
- **UX/Dostępność/Bezpieczeństwo:**
  - Wyraźna informacja o wymaganiach dotyczących hasła
  - Komunikaty błędów przy niepoprawnych danych
  - Automatyczne przekierowanie po zalogowaniu
  - Walidacja formularza z komunikatami błędów

### 2.2. Widok preferencji użytkownika
- **Ścieżka:** `/preferences`
- **Główny cel:** Umożliwienie użytkownikowi ustawienia preferencji żywieniowych
- **Kluczowe informacje:** Alergie, nietolerancje, docelowa kaloryczność
- **Kluczowe komponenty:**
  - Mat-Card z formularzem preferencji
  - Mat-Chip-List do wyboru wielu wartości dla alergii i nietolerancji
  - Mat-Input typu number dla docelowej kaloryczności
  - Mat-Button do zapisywania zmian
- **UX/Dostępność/Bezpieczeństwo:**
  - Walidacja liczby kalorii (>0)
  - Informacje pomocnicze o znaczeniu preferencji
  - Potwierdzenie zapisania zmian (MatSnackBar)
  - Dostęp tylko dla zalogowanych użytkowników

### 2.3. Widok główny (dashboard)
- **Ścieżka:** `/dashboard` lub `/` (po zalogowaniu)
- **Główny cel:** Wyświetlenie listy zapisanych przepisów i umożliwienie nawigacji
- **Kluczowe informacje:** Lista przepisów z tytułami, datami utworzenia i skróconym podsumowaniem kalorii
- **Kluczowe komponenty:**
  - Mat-Toolbar z tytułem aplikacji i menu użytkownika
  - Mat-Grid-List z kartami przepisów (Mat-Card)
  - Mat-Paginator do nawigacji między stronami przepisów
  - Floating Action Button (FAB) do dodawania nowego przepisu
  - Kontrolki sortowania i filtrowania
- **UX/Dostępność/Bezpieczeństwo:**
  - Responsywny układ siatki dopasowujący się do rozdzielczości
  - Klawisze ARIA dla dostępności
  - Stan ładowania podczas pobierania danych
  - Zabezpieczenie dostępu tylko dla zalogowanych

### 2.4. Widok tworzenia nowego przepisu
- **Ścieżka:** `/recipes/new`
- **Główny cel:** Umożliwienie wprowadzenia niesformatowanego tekstu przepisu do analizy przez AI
- **Kluczowe informacje:** Pole tekstowe na niesformatowany przepis
- **Kluczowe komponenty:**
  - Mat-Card z instrukcjami
  - Mat-Text-Area dla wklejenia niesformatowanego przepisu
  - Mat-Button do wysłania tekstu do analizy AI
  - Mat-Progress-Bar/Spinner podczas przetwarzania przez AI
- **UX/Dostępność/Bezpieczeństwo:**
  - Wyraźna informacja o oczekiwaniu (60s limit czasowy)
  - Obsługa błędów AI z komunikatem użytkownikowi
  - Możliwość anulowania procesu analizy
  - Komunikat o pustym polu tekstowym przy próbie wysłania

### 2.5. Widok edycji przepisu (po analizie AI)
- **Ścieżka:** `/recipes/edit/new` lub `/recipes/edit/:id`
- **Główny cel:** Edycja struktury przepisu wygenerowanej przez AI lub istniejącego przepisu
- **Kluczowe informacje:** Wszystkie składniki przepisu, jednostki, kroki, notatki, kalorie
- **Kluczowe komponenty:**
  - Mat-Stepper lub Mat-Tab-Group dzielący formularz na sekcje
  - Dynamiczny formularz dla składników z przyciskami dodawania/usuwania
  - Dynamiczny formularz dla kroków przygotowania
  - Mat-Form-Field dla notatek i innych informacji
  - Podświetlanie potencjalnych alergenów
  - Mat-Button do przejścia do podsumowania
- **UX/Dostępność/Bezpieczeństwo:**
  - Inline walidacja formularza
  - Wizualne oznaczenia alergenów zgodnie z preferencjami
  - Automatyczne zapisywanie wersji roboczej
  - Przyciski do dodawania/usuwania elementów listy

### 2.6. Widok podsumowania przepisu
- **Ścieżka:** `/recipes/summary`
- **Główny cel:** Wyświetlenie podsumowania przepisu przed finalnym zapisaniem
- **Kluczowe informacje:** Lista składników, łączna wartość kaloryczna, wszystkie dane przepisu
- **Kluczowe komponenty:**
  - Mat-Card z podsumowaniem
  - Mat-Table wyświetlająca listę składników
  - Wykres lub informacja graficzna o wartości kalorycznej
  - Mat-Button "Zapisz" i Mat-Button "Anuluj"
- **UX/Dostępność/Bezpieczeństwo:**
  - Wyróżnienie alergenów i składników niepasujących do preferencji
  - Dialog potwierdzający zapisanie
  - Informacja o zapisaniu w MatSnackBar
  - Możliwość powrotu do edycji

### 2.7. Widok szczegółów przepisu
- **Ścieżka:** `/recipes/:id`
- **Główny cel:** Wyświetlenie pełnych informacji o zapisanym przepisie
- **Kluczowe informacje:** Wszystkie dane przepisu, opcje edycji i usunięcia
- **Kluczowe komponenty:**
  - Mat-Tab-Group z zakładkami dla składników, kroków, notatek
  - Mat-List dla składników i kroków
  - Mat-Card dla podsumowania kalorii
  - Mat-Button do edycji i Mat-Button do usuwania
- **UX/Dostępność/Bezpieczeństwo:**
  - Responsywny układ dla różnych urządzeń
  - Dialog potwierdzający usunięcie
  - Wizualne oznaczenie alergenów
  - Dostęp tylko dla właściciela przepisu

## 3. Mapa podróży użytkownika

### 3.1. Główny przepływ: Dodawanie nowego przepisu

1. **Rejestracja/logowanie**
   - Użytkownik wchodzi na stronę aplikacji
   - Jeśli nie jest zalogowany, zostaje przekierowany do `/auth`
   - Po poprawnej rejestracji/logowaniu przechodzi do `/dashboard`

2. **Ustawienie preferencji (pierwszy raz)**
   - Jeśli użytkownik nie ma ustawionych preferencji, zostaje przekierowany do `/preferences`
   - Wybiera alergie i nietolerancje oraz ustawia docelową kaloryczność
   - Po zapisaniu preferencji przechodzi do `/dashboard`

3. **Dodawanie nowego przepisu**
   - Z dashboardu użytkownik klika przycisk "Dodaj przepis" (FAB)
   - Zostaje przeniesiony do widoku `/recipes/new`
   - Wkleja niesformatowany tekst przepisu i klika "Analizuj"
   - System wyświetla wskaźnik ładowania podczas przetwarzania AI (maks. 60s)

4. **Edycja przepisu po analizie AI**
   - Po zakończeniu analizy użytkownik jest przenoszony do `/recipes/edit/new`
   - Edytuje dane wygenerowane przez AI (składniki, kroki, notatki)
   - System automatycznie oznacza alergeny zgodnie z preferencjami
   - Po zakończeniu edycji klika "Dalej" lub "Podsumowanie"

5. **Podsumowanie i zapisanie**
   - Przegląda podsumowanie przepisu na `/recipes/summary`
   - Sprawdza listę składników i wartość kaloryczną
   - Jeśli wszystko jest poprawne, klika "Zapisz"
   - System zapisuje przepis i wyświetla potwierdzenie
   - Użytkownik zostaje przekierowany do dashboardu z nowo dodanym przepisem

### 3.2. Alternatywne przepływy

#### 3.2.1. Przeglądanie i edycja istniejącego przepisu
1. Z dashboardu użytkownik wybiera przepis z listy
2. Zostaje przeniesiony do widoku szczegółów `/recipes/:id`
3. Może przejrzeć wszystkie informacje o przepisie
4. W celu edycji klika "Edytuj" i przechodzi do `/recipes/edit/:id`
5. Po zakończeniu edycji przechodzi do podsumowania i zapisuje zmiany

#### 3.2.2. Usuwanie przepisu
1. Z widoku szczegółów przepisu użytkownik klika "Usuń"
2. System wyświetla dialog potwierdzający operację
3. Po potwierdzeniu przepis jest usuwany, a użytkownik wraca do dashboardu

#### 3.2.3. Obsługa błędów AI
1. Jeśli analiza AI przekroczy limit czasu 60s, system wyświetli komunikat o błędzie
2. Użytkownik może spróbować ponownie lub przejść do ręcznego wprowadzania danych w formularzu edycji

## 4. Układ i struktura nawigacji

### 4.1. Nawigacja główna
- **Pasek górny (Mat-Toolbar)** - dostępny na wszystkich chronionych stronach:
  - Logo aplikacji (link do dashboardu)
  - Tytuł aplikacji
  - Przycisk do zarządzania preferencjami użytkownika
  - Menu użytkownika (wylogowanie, profil)

### 4.2. Nawigacja kontekstowa
- **Przyciski nawigacyjne** - umieszczone w odpowiednich miejscach interfejsu:
  - Przyciski "Wstecz" i "Dalej" w formularzach wieloetapowych
  - Przyciski akcji w widokach (Dodaj, Edytuj, Usuń)
  - Floating Action Button (FAB) na dashboardzie do dodawania przepisu

### 4.3. Przekierowania i zabezpieczenia
- Wszystkie chronione trasy (`/dashboard`, `/preferences`, `/recipes/*`) są zabezpieczone Angular Guard
- Próba dostępu do chronionych tras bez uwierzytelnienia przekierowuje do `/auth`
- Po zalogowaniu użytkownik jest automatycznie przekierowywany do dashboardu
- Przy pierwszym logowaniu lub braku preferencji, użytkownik jest kierowany do `/preferences`

## 5. Kluczowe komponenty

### 5.1. AuthComponent
- Zarządzanie procesem uwierzytelniania
- Integracja z Supabase Auth UI
- Obsługa stanów logowania/rejestracji
- Przekierowanie po zalogowaniu

### 5.2. RecipeCardComponent
- Wyświetlanie podstawowych informacji o przepisie na dashboardzie
- Obsługa akcji (przejście do szczegółów, edycja, usunięcie)
- Wyświetlanie skróconych informacji (tytuł, kalorie)

### 5.3. RecipeFormComponent
- Dynamiczny, reaktywny formularz do edycji przepisu
- Zarządzanie listami składników i kroków (dodawanie/usuwanie)
- Obsługa walidacji
- Podświetlanie alergenów

### 5.4. IngredientListComponent
- Wyświetlanie listy składników z ilościami i jednostkami
- Oznaczanie alergenów zgodnie z preferencjami użytkownika
- Sortowanie i filtrowanie składników

### 5.5. PreferencesFormComponent
- Formularz zarządzania preferencjami użytkownika
- Wybór wielu wartości dla alergii i nietolerancji
- Walidacja wartości liczbowych

### 5.6. LoadingIndicatorComponent
- Wskaźnik ładowania podczas operacji asynchronicznych
- Obsługa limitu czasu dla operacji AI
- Informacja o postępie lub szacowanym czasie oczekiwania

### 5.7. ErrorHandlingComponent
- Wyświetlanie komunikatów o błędach
- Obsługa różnych typów błędów (walidacja, sieć, AI)
- Sugerowanie rozwiązań przy błędach

### 5.8. ConfirmDialogComponent
- Dialog potwierdzający operacje krytyczne (usuwanie)
- Możliwość anulowania operacji
- Wyraźne oznaczenie konsekwencji akcji

### 5.9. NavigationComponent
- Pasek nawigacyjny aplikacji
- Menu użytkownika
- Dostęp do kluczowych funkcji aplikacji
