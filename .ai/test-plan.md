Search files...
Ran tool
Ran tool
Ran tool
Ran tool
Read file: package.json
Teraz przeprowadzę dogłębną analizę projektu i utworzę kompleksowy plan testów:

<analiza_projektu>

## 1. Kluczowe komponenty projektu wynikające z analizy kodu:

### Frontend (Angular):
- **AuthModule**: Komponenty do logowania, rejestracji, resetowania hasła
- **DashboardModule**: Główny widok z listą przepisów, filtrami i paginacją
- **RecipesModule**: Zarządzanie przepisami (tworzenie, edycja, szczegóły, usuwanie)
- **PreferencesModule**: Zarządzanie preferencjami użytkownika (alergie, nietolerancje, kalorie)
- **NavigationComponent**: Pasek nawigacyjny i menu użytkownika
- **AuthGuard**: Zabezpieczenie tras wymagających autoryzacji

### Backend (Express.js + TypeScript):
- **API Endpoints**: `/api/recipes`, `/api/users`, `/api/auth`, `/api/health`
- **Core Services**: Logika biznesowa w katalogu `src/lib/services`
- **Database Integration**: Supabase client w `src/db`
- **Interceptors**: Middleware dla autoryzacji i błędów

### Kluczowe funkcjonalności:
- Autentykacja i autoryzacja użytkowników
- CRUD przepisów kulinarnych
- Zarządzanie preferencjami żywieniowymi
- Integracja z AI (Openrouter.ai) do generowania przepisów
- Filtrowanie i sortowanie przepisów
- Walidacja składników względem alergii użytkownika

## 2. Specyfika stosu technologicznego i jego wpływ na strategię testowania:

### Angular 19:
- **Standalone Components**: Wymaga testowania izolacji komponentów
- **Signals**: Nowa reaktywność - potrzeba testów reaktywnych aktualizacji
- **Angular Material**: Testy UI komponentów bibliotecznych
- **SSR Support**: Testy renderowania po stronie serwera

### TypeScript 5:
- **Type Safety**: Testy walidacji typów w build time
- **Strong Typing**: Skupienie na testach kontraktów API

### Express.js Backend:
- **REST API**: Testy integracyjne endpoint'ów
- **Middleware**: Testy walidacji, autoryzacji, CORS
- **Error Handling**: Testy scenariuszy błędów HTTP

### Supabase:
- **Database Operations**: Testy CRUD z rzeczywistą bazą danych
- **Auth Integration**: Testy tokeny JWT, sesji użytkowników
- **Real-time Features**: Testy subskrypcji i aktualizacji w czasie rzeczywistym

### AI Integration (Openrouter.ai):
- **External API**: Testy mocków i integracji z zewnętrznym API
- **Rate Limiting**: Testy ograniczeń zapytań
- **Error Handling**: Testy timeoutów i błędów AI

## 3. Priorytety testowe bazujące na strukturze repozytorium:

### Wysoki priorytet:
1. **Autentykacja i autoryzacja** - krytyczna dla bezpieczeństwa
2. **CRUD przepisów** - główna funkcjonalność aplikacji
3. **Zarządzanie preferencjami** - wpływa na bezpieczeństwo zdrowotne
4. **API Endpoints** - kluczowe dla komunikacji frontend-backend

### Średni priorytet:
1. **UI Components** - wpływa na user experience
2. **Filtrowanie i sortowanie** - ważne dla użyteczności
3. **Walidacja formularzy** - zapewnia jakość danych

### Niski priorytet:
1. **Stylowanie i responsywność** - estetyczne aspekty
2. **Optymalizacja wydajności** - po zapewnieniu funkcjonalności

## 4. Potencjalne obszary ryzyka wymagające szczególnej uwagi w testach:

### Bezpieczeństwo:
- **Injection Attacks**: SQL injection, XSS w formularach przepisów
- **Authorization Bypass**: Dostęp do cudzych przepisów/preferencji
- **JWT Token Validation**: Poprawność walidacji tokenów autoryzacyjnych

### Integracja z AI:
- **API Rate Limits**: Przekroczenie limitów Openrouter.ai
- **Response Parsing**: Nieprawidłowe odpowiedzi z AI mogące crashować aplikację
- **Timeout Handling**: Długie odpowiedzi AI mogące zawiesić interfejs

### Zarządzanie danymi:
- **Concurrent Updates**: Konflikty przy jednoczesnej edycji przepisów
- **Data Corruption**: Utrata danych podczas błędów sieciowych
- **Migration Safety**: Zmiany w schemacie bazy danych

### User Experience:
- **Form Validation**: Błędne walidacje mogące frustrować użytkowników
- **Loading States**: Brak informacji o postępie długich operacji
- **Error Messages**: Niezrozumiałe komunikaty błędów dla użytkowników

</analiza_projektu>

<plan_testów>

# Plan Testów - Aplikacja HealthyMeal
**Wersja**: 1.0  
**Data**: Grudzień 2024  
**Autor**: QA Team  

## 1. Wprowadzenie i cele testowania

### 1.1 Cel dokumentu
Niniejszy dokument definiuje kompleksowy plan testów dla aplikacji HealthyMeal - platformy do zarządzania zdrowymi przepisami kulinarnymi z integracją AI.

### 1.2 Cele testowania
- Zapewnienie poprawności funkcjonalności core'owych (autentykacja, CRUD przepisów, preferencje)
- Weryfikacja bezpieczeństwa aplikacji i ochrony danych użytkowników
- Walidacja integracji z zewnętrznymi serwisami (Supabase, Openrouter.ai)
- Potwierdzenie kompatybilności i responsywności interfejsu użytkownika
- Sprawdzenie wydajności aplikacji w różnych scenariuszach obciążenia

### 1.3 Zakres produktu
Aplikacja HealthyMeal składa się z:
- Frontend: Angular 19 z Angular Material
- Backend: Express.js z TypeScript
- Baza danych: Supabase
- Integracja AI: Openrouter.ai
- Hosting: DigitalOcean z Docker

## 2. Zakres testów

### 2.1 Funkcjonalności w zakresie testów
- **Moduł autentykacji**: Logowanie, rejestracja, reset hasła
- **Zarządzanie przepisami**: Tworzenie, edycja, przeglądanie, usuwanie
- **Preferencje użytkownika**: Alergie, nietolerancje, cele kaloryczne
- **Dashboard**: Filtrowanie, sortowanie, paginacja przepisów
- **Integracja AI**: Generowanie przepisów na podstawie preferencji
- **API REST**: Wszystkie endpoint'y backendu
- **Bezpieczeństwo**: Autoryzacja, walidacja danych wejściowych

### 2.2 Funkcjonalności poza zakresem testów
- Zewnętrzne API Openrouter.ai (tylko mockowanie)
- Infrastruktura DigitalOcean (tylko testy smoke'owe)
- Migracje bazy danych Supabase (oddzielny proces)

## 3. Typy testów do przeprowadzenia

### 3.1 Testy jednostkowe (Unit Tests)
**Cel**: Weryfikacja izolowanych jednostek kodu  
**Narzędzie**: Jasmine + Karma  
**Pokrycie**: Minimum 80% dla logiki biznesowej  

**Obszary**:
- Services Angular (`src/app/core/services/`)
- Business logic (`src/lib/services/`)
- Utility functions
- Pipes i filtry
- Guard'y i interceptory

### 3.2 Testy integracyjne (Integration Tests)
**Cel**: Weryfikacja współpracy między komponentami  
**Narzędzie**: Jasmine + Angular Testing Utilities  

**Obszary**:
- Komunikacja component → service
- Integracja z Supabase
- API endpoints z rzeczywistą bazą danych testową
- Routing i navigation
- Form validation flows

### 3.3 Testy End-to-End (E2E Tests)
**Cel**: Weryfikacja pełnych scenariuszy użytkownika  
**Narzędzie**: Cypress  

**Obszary**:
- Kompletne user journeys
- Cross-browser compatibility
- Responsive design
- Performance testing

### 3.4 Testy API (API Tests)
**Cel**: Weryfikacja REST API  
**Narzędzie**: Postman + Newman/Jest  

**Obszary**:
- CRUD operations
- Authentication flows
- Error handling
- Rate limiting
- Data validation

### 3.5 Testy bezpieczeństwa (Security Tests)
**Cel**: Weryfikacja bezpieczeństwa aplikacji  
**Narzędzie**: OWASP ZAP + manualne testy  

**Obszary**:
- SQL Injection
- XSS attacks
- CSRF protection
- JWT token validation
- Authorization bypass

### 3.6 Testy wydajnościowe (Performance Tests)
**Cel**: Weryfikacja wydajności pod obciążeniem  
**Narzędzie**: Artillery.io  

**Obszary**:
- Load testing API endpoints
- Stress testing bazy danych
- Frontend performance metrics
- AI API response times

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autentykacja użytkowników

#### TC-AUTH-001: Logowanie z prawidłowymi danymi
- **Warunki wstępne**: Użytkownik zarejestrowany w systemie
- **Kroki**:
  1. Otwórz stronę `/auth/login`
  2. Wprowadź prawidłowy email i hasło
  3. Kliknij "Zaloguj się"
- **Oczekiwany rezultat**: Przekierowanie do dashboard'u, wyświetlenie nawigacji użytkownika

#### TC-AUTH-002: Logowanie z nieprawidłowymi danymi
- **Warunki wstępne**: Strona logowania otwarta
- **Kroki**:
  1. Wprowadź nieprawidłowy email lub hasło
  2. Kliknij "Zaloguj się"
- **Oczekiwany rezultat**: Wyświetlenie błędu "Invalid credentials", pozostanie na stronie logowania

#### TC-AUTH-003: Rejestracja nowego użytkownika
- **Kroki**:
  1. Otwórz `/auth/register`
  2. Wypełnij formularz rejestracji
  3. Potwierdź hasło
  4. Kliknij "Zarejestruj się"
- **Oczekiwany rezultat**: Wysłanie email'a potwierdzającego, komunikat o konieczności potwierdzenia

### 4.2 Zarządzanie przepisami

#### TC-RECIPE-001: Tworzenie nowego przepisu
- **Warunki wstępne**: Użytkownik zalogowany
- **Kroki**:
  1. Przejdź do `/recipes/new`
  2. Wypełnij tytuł przepisu
  3. Dodaj składniki z ilościami
  4. Dodaj kroki przygotowania
  5. Kliknij "Zapisz przepis"
- **Oczekiwany rezultat**: Przepis zapisany, przekierowanie do widoku szczegółów

#### TC-RECIPE-002: Edycja istniejącego przepisu
- **Warunki wstępne**: Użytkownik ma co najmniej jeden przepis
- **Kroki**:
  1. Otwórz szczegóły przepisu
  2. Kliknij "Edytuj"
  3. Zmodyfikuj składniki lub kroki
  4. Zapisz zmiany
- **Oczekiwany rezultat**: Zmiany zapisane, aktualizacja widoku szczegółów

#### TC-RECIPE-003: Usuwanie przepisu
- **Warunki wstępne**: Użytkownik ma co najmniej jeden przepis
- **Kroki**:
  1. Otwórz szczegóły przepisu
  2. Kliknij "Usuń"
  3. Potwierdź usunięcie w dialogu
- **Oczekiwany rezultat**: Przepis usunięty, przekierowanie do dashboard'u

### 4.3 Zarządzanie preferencjami

#### TC-PREF-001: Ustawienie preferencji żywieniowych
- **Warunki wstępne**: Użytkownik zalogowany
- **Kroki**:
  1. Przejdź do `/preferences`
  2. Ustaw cel kaloryczny
  3. Wybierz alergie z listy
  4. Wybierz nietolerancje
  5. Zapisz preferencje
- **Oczekiwany rezultat**: Preferencje zapisane, komunikat potwierdzający

#### TC-PREF-002: Walidacja składników względem alergii
- **Warunki wstępne**: Użytkownik ma ustawione alergie
- **Kroki**:
  1. Stwórz przepis zawierający alergen
  2. Sprawdź widok składników
- **Oczekiwany rezultat**: Alergeny wyróżnione wizualnie, ostrzeżenie

### 4.4 Integracja AI

#### TC-AI-001: Generowanie przepisu przez AI
- **Warunki wstępne**: Użytkownik zalogowany, API AI dostępne
- **Kroki**:
  1. Kliknij "Wygeneruj przepis AI"
  2. Wprowadź opis pożądanego dania
  3. Poczekaj na odpowiedź AI
- **Oczekiwany rezultat**: Wygenerowany przepis z składnikami i krokami

#### TC-AI-002: Obsługa błędów API AI
- **Warunki wstępne**: API AI niedostępne (mock)
- **Kroki**:
  1. Spróbuj wygenerować przepis
- **Oczekiwany rezultat**: Komunikat o błędzie, możliwość ponowienia próby

## 5. Środowisko testowe

### 5.1 Środowiska
- **Development**: Lokalne środowisko deweloperskie
- **Testing**: Dedykowane środowisko testowe z bazą testową
- **Staging**: Replika produkcji do testów akceptacyjnych
- **Production**: Środowisko produkcyjne (tylko smoke tests)

### 5.2 Dane testowe
- **Użytkownicy testowi**: Różne role i stany kont
- **Przepisy testowe**: Zróżnicowane pod względem złożoności
- **Preferencje testowe**: Pokrywające różne przypadki alergii

### 5.3 Konfiguracja bazy danych
- Automatyczne tworzenie/usuwanie bazy testowej
- Seed data dla podstawowych scenariuszy
- Izolacja testów - każdy test z czystym stanem

## 6. Narzędzia do testowania

### 6.1 Frontend Testing
- **Unit Tests**: Jasmine + Karma
- **Component Tests**: Angular Testing Utilities
- **E2E Tests**: Cypress
- **Visual Regression**: Percy (opcjonalnie)

### 6.2 Backend Testing  
- **Unit Tests**: Jest
- **Integration Tests**: Supertest
- **API Tests**: Postman + Newman
- **Database Tests**: Supabase Test Client

### 6.3 Performance & Security
- **Load Testing**: Artillery.io
- **Security Scanning**: OWASP ZAP
- **Code Quality**: SonarQube
- **Coverage**: Istanbul/NYC

### 6.4 CI/CD Integration
- **GitHub Actions**: Automatyczne uruchamianie testów
- **Test Reports**: Integracja z GitHub/Slack
- **Quality Gates**: Blokowanie deploymentu przy niedostatecznym pokryciu

## 7. Harmonogram testów

### 7.1 Faza 1: Testy jednostkowe (Tydzień 1-2)
- Implementacja testów jednostkowych dla services
- Testy business logic w `src/lib`
- Osiągnięcie 80% pokrycia kodu

### 7.2 Faza 2: Testy integracyjne (Tydzień 2-3)
- Testy API endpoints
- Integracja z Supabase
- Testy komunikacji frontend-backend

### 7.3 Faza 3: Testy E2E (Tydzień 3-4)
- Implementacja głównych user journeys
- Testy cross-browser
- Testy responsywności

### 7.4 Faza 4: Testy bezpieczeństwa i wydajności (Tydzień 4-5)
- Security testing
- Performance testing
- Load testing

### 7.5 Faza 5: Testy akceptacyjne (Tydzień 5)
- User Acceptance Testing
- Smoke tests na staging
- Final regression testing

## 8. Kryteria akceptacji testów

### 8.1 Kryteria funkcjonalne
- ✅ Wszystkie scenariusze testowe wysokiego priorytetu zaliczone
- ✅ 0 krytycznych bugów
- ✅ Maksymalnie 5 średnich bugów
- ✅ Wszystkie główne user journeys działają poprawnie

### 8.2 Kryteria techniczne
- ✅ Pokrycie kodu testami jednostkowymi >= 80%
- ✅ Wszystkie testy API przechodzą
- ✅ Czas odpowiedzi API < 500ms dla 95% requestów
- ✅ Brak luk bezpieczeństwa o wysokim priorytecie

### 8.3 Kryteria wydajnościowe
- ✅ Czas ładowania strony < 3 sekundy
- ✅ Aplikacja wytrzymuje 100 jednoczesnych użytkowników
- ✅ AI API odpowiada w < 10 sekund w 95% przypadków

## 9. Role i odpowiedzialności w procesie testowania

### 9.1 QA Engineer (Lead)
- Koordynacja planu testów
- Review scenariuszy testowych
- Wykonywanie testów manualnych wysokiego ryzyka
- Raportowanie do Project Manager

### 9.2 Frontend Developer
- Implementacja testów jednostkowych dla komponentów
- Code review testów frontend
- Wsparcie w debugowaniu błędów UI

### 9.3 Backend Developer  
- Implementacja testów jednostkowych API
- Testy integracyjne z bazą danych
- Performance profiling backend services

### 9.4 DevOps Engineer
- Konfiguracja środowisk testowych
- Integracja testów z CI/CD
- Monitoring testów wydajnościowych

### 9.5 Product Owner
- Akceptacja kryteriów testowych
- Priorytetyzacja bugów
- Final acceptance testing

## 10. Procedury raportowania błędów

### 10.1 Klasyfikacja błędów

**Krytyczne (Critical)**:
- Brak możliwości logowania
- Utrata danych użytkownika
- Luki bezpieczeństwa
- **SLA**: Naprawa w ciągu 24h

**Wysokie (High)**:
- Błędy funkcjonalności podstawowych
- Problemy z integracją AI
- Błędy walidacji danych
- **SLA**: Naprawa w ciągu 72h

**Średnie (Medium)**:
- Błędy UI/UX
- Problemy z wydajnością
- Błędy walidacji formularzy
- **SLA**: Naprawa w ciągu 1 tygodnia  

**Niskie (Low)**:
- Błędy kosmetyczne
- Problemy z responsywnością
- Drobne problemy tekstowe
- **SLA**: Naprawa w następnym sprincie

### 10.2 Template raportu błędu

```
**ID**: BUG-YYYY-MM-DD-XXX
**Tytuł**: [Zwięzły opis problemu]
**Priorytet**: Critical/High/Medium/Low
**Środowisko**: Development/Testing/Staging/Production
**Browser**: Chrome/Firefox/Safari + wersja
**Kroki reprodukcji**:
1. [Krok 1]
2. [Krok 2]
3. [Krok 3]
**Oczekiwany rezultat**: [Co powinno się stać]
**Aktualny rezultat**: [Co faktycznie się dzieje]
**Screenshots/Logi**: [Załączniki]
**Dodatkowe informacje**: [Kontekst, obejścia]
```

### 10.3 Workflow błędów
1. **Zgłoszenie** → QA Engineer tworzy ticket w Jira/GitHub Issues
2. **Triaging** → Product Owner ustala priorytet
3. **Przypisanie** → Tech Lead przypisuje developera
4. **Rozwój** → Developer implementuje fix
5. **Code Review** → Peer review + QA review
6. **Testing** → QA weryfikuje fix na środowisku testowym
7. **Deployment** → DevOps wdraża na staging/production
8. **Verification** → Final verification na środowisku docelowym
9. **Closed** → Ticket zamknięty po pomyślnej weryfikacji

### 10.4 Komunikacja
- **Daily Standup**: Status bugów krytycznych i wysokich
- **Weekly Report**: Podsumowanie metryk jakości
- **Slack Notifications**: Automatyczne powiadomienia o nowych bugach krytycznych
- **Monthly Review**: Analiza trendów i improvement areas

---

**Ten plan testów powinien być regularnie aktualizowany w miarę rozwoju projektu i zmieniających się wymagań.**

</plan_testów>

Teraz zapiszę ten plan jako plik `.ai/test-plan.md`:
Read file: .ai/test-plan.md
Plik nie istnieje, więc utworzę go z kompletnym planem testów. Oto szczegółowy plan testów dla projektu HealthyMeal:

Stworzyłem kompleksowy plan testów dla aplikacji HealthyMeal, który uwzględnia:

## Kluczowe elementy planu:

### 1. **Analiza projektu**
- Zidentyfikowałem główne moduły: Auth, Dashboard, Recipes, Preferences
- Uwzględniłem specyfikę Angular 19 z signals i standalone components
- Przeanalizowałem integrację z Supabase i AI (Openrouter.ai)

### 2. **Strategia testowania wielopoziomowa**
- **Testy jednostkowe** (Jasmine/Karma) - 80% pokrycia dla logiki biznesowej
- **Testy integracyjne** - komunikacja komponentów i API
- **Testy E2E** (Cypress) - pełne scenariusze użytkownika
- **Testy bezpieczeństwa** (OWASP ZAP) - SQL injection, XSS, autoryzacja
- **Testy wydajnościowe** (Artillery.io) - load testing

### 3. **Priorytety testowe**
- **Wysokie**: Autentykacja, CRUD przepisów, zarządzanie preferencjami
- **Średnie**: UI/UX, filtrowanie, walidacja formularzy
- **Niskie**: Stylowanie, responsywność

### 4. **Scenariusze testowe**
Szczegółowe przypadki testowe dla:
- Logowania/rejestracji z różnymi danymi
- Operacji CRUD na przepisach
- Zarządzania preferencjami żywieniowymi
- Integracji z AI i obsługi błędów

### 5. **Obszary ryzyka**
- Bezpieczeństwo (injection attacks, authorization bypass)
- Integracja AI (rate limits, timeouts, parsing błędów)
- Concurrent updates i data corruption
- User experience (validation, loading states)

### 6. **Organizacja procesu**
- 5-tygodniowy harmonogram implementacji
- Jasne role i odpowiedzialności zespołu
- Procedury raportowania błędów z SLA
- Kryteria akceptacji technicznej i funkcjonalnej

Plan jest dostosowany do specyfiki fullstack aplikacji Angular/Express z integracją AI i skupia się na krytycznych aspektach bezpieczeństwa i user experience w aplikacji zarządzającej danymi zdrowotnymi.