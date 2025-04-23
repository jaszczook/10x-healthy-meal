# Dokument wymagań produktu (PRD) - HealthyMeal
## 1. Przegląd produktu
Aplikacja HealthyMeal (MVP) to narzędzie webowe, które umożliwia użytkownikom przechowywanie i personalizację przepisów kulinarnych z wykorzystaniem AI oraz preferencji żywieniowych. Aplikacja pozwala na wklejenie niesformatowanego przepisu, jego przetworzenie na strukturę JSON, edycję, skalowanie porcji i wyświetlenie podsumowania kalorycznego przed finalnym zapisem.

## 2. Problem użytkownika
Dostępne w sieci przepisy często nie spełniają indywidualnych wymagań dietetycznych i alergicznych. Użytkownicy tracą czas na ręczne modyfikacje, nie mają pewności co do wartości odżywczych i kalorii, a proces dostosowania jest żmudny.

## 3. Wymagania funkcjonalne
- system uwierzytelniania użytkowników (rejestracja, logowanie, wylogowanie) z zarządzaniem sesją
- profil użytkownika zawierający preferencje żywieniowe (alergie, nietolerancje, docelowa kaloryczność)
- CRUD przepisów tekstowych:
  - wklejenie niesformatowanego przepisu → analiza AI → struktura JSON ze składnikami, ilościami, jednostkami, krokami, notatkami, kaloriami
  - edycja wszystkich pól JSON
  - zapisywanie, odczytywanie, przeglądanie i usuwanie przepisów
- walidacja jednostek miar według zdefiniowanej listy (`g`, `ml`, `szt.`, `łyżki`, itp.)
- pole `porcje` przyjmujące tylko liczby całkowite od 1 do 16 oraz automatyczne skalowanie składników i kalorii
- ekran podsumowania przepisu z listą składników i łączną wartością kaloryczną przed zapisem
- obsługa błędów AI: timeout 60 s, komunikat „Spróbuj ponownie” i możliwość ponownego przetworzenia
- logowanie błędów AI w tabeli `error_logs` z `user_id` i `timestamp`
- integracja z prostym API kalorycznym, tolerancja estymacji kalorii ±10%

Nie-funkcjonalne
- interfejs webowy zoptymalizowany pod przeglądarkę Chrome w rozdzielczości FullHD
- dostępność i wydajność: AI timeout 60 s, pomiar i raportowanie błędów

## 4. Granice produktu
W zakresie MVP nie będzie:
- importu przepisów z adresu URL
- obsługi multimediów (zdjęcia, wideo)
- udostępniania przepisów innym użytkownikom
- funkcji społecznościowych (komentarze, oceny)
- eksportu/importu JSON
- wersjonowania schematu JSON
- powiadomień e-mail
- onboardingów czy testów użyteczności przed premierą

## 5. Historyjki użytkowników
- ID: US-001  
  Tytuł: Rejestracja i uwierzytelnienie użytkownika  
  Opis: Użytkownik może założyć konto oraz zalogować się, aby korzystać z funkcji aplikacji.  
  Kryteria akceptacji:  
  - przy rejestracji wymagane pola: email, hasło  
  - po rejestracji użytkownik jest automatycznie zalogowany  
  - użytkownik może wypisać się (wylogować) i sesja zostaje zakończona  
  - nieautoryzowany dostęp do stron związanych z przepisami przekierowuje do ekranu logowania

- ID: US-002  
  Tytuł: Zarządzanie preferencjami żywieniowymi  
  Opis: Użytkownik może w profilu ustawić alergie, nietolerancje i docelową kaloryczność.  
  Kryteria akceptacji:  
  - pola alergie i nietolerancje przyjmują wartości z listy wielokrotnego wyboru  
  - docelowa kaloryczność to liczba całkowita >0  
  - profil można edytować wielokrotnie  
  - przy pierwszym tworzeniu przepisu brakująca sekcja przekierowuje do uzupełnienia preferencji

- ID: US-003  
  Tytuł: Wklejenie i parsowanie niesformatowanego przepisu  
  Opis: Użytkownik wkleja przepis w formie tekstu, a system wysyła zapytanie do AI celem wygenerowania JSON.  
  Kryteria akceptacji:  
  - po wklejeniu tekstu i zatwierdzeniu wyświetlany jest interfejs ładowania  
  - po sukcesie AI wyświetla edytowalny JSON ze składnikami, jednostkami, krokami, kaloriami  
  - timeout AI to 60 s, po przekroczeniu wyświetla się komunikat o błędzie

- ID: US-004  
  Tytuł: Obsługa błędów AI i ponowne przetwarzanie  
  Opis: Jeśli AI zwróci błąd lub przekroczony zostanie timeout, użytkownik otrzymuje komunikat i może ponowić próbę.  
  Kryteria akceptacji:  
  - w przypadku błędu lub timeout wyświetla się komunikat „Spróbuj ponownie”  
  - przyciskiem „Ponów” użytkownik uruchamia kolejną sesję AI  
  - każde nieudane wywołanie jest logowane w `error_logs` z `user_id` i `timestamp`

- ID: US-005  
  Tytuł: Edycja wygenerowanego JSON  
  Opis: Użytkownik może modyfikować wszystkie pola JSON przed zapisaniem przepisu.  
  Kryteria akceptacji:  
  - edycja składników, ilości, jednostek, kroków i notatek jest możliwa w formularzu  
  - zmiany są walidowane (ilości >0, jednostki z listy)  
  - po zatwierdzeniu aktualizowany jest podgląd podsumowania

- ID: US-006  
  Tytuł: Walidacja jednostek miar  
  Opis: System sprawdza poprawność wprowadzonych jednostek miar według zdefiniowanej listy.  
  Kryteria akceptacji:  
  - lista dozwolonych jednostek: `g`, `ml`, `szt.`, `łyżki`, `łyżeczki`  
  - przy niepoprawnej jednostce formularz wyświetla komunikat i nie pozwala przejść dalej

- ID: US-007  
  Tytuł: Skalowanie porcji  
  Opis: Użytkownik ustawia liczbę porcji (1–16), a system automatycznie przelicza ilości składników i kalorie.  
  Kryteria akceptacji:  
  - pole `porcje` przyjmuje tylko liczby całkowite od 1 do 16  
  - zmiana wartości powoduje przeliczenie ilości i kalorii w czasie rzeczywistym  
  - przy próbie wpisania wartości spoza zakresu pojawia się komunikat walidacji

- ID: US-008  
  Tytuł: Ekran podsumowania przepisu  
  Opis: Użytkownik widzi listę składników z przeliczonymi ilościami i łączną wartością kaloryczną przed finalnym zapisem.  
  Kryteria akceptacji:  
  - wyświetlana jest tabela składników i suma kalorii  
  - przycisk „Zapisz” dodaje przepis do bazy danych  
  - przycisk „Anuluj” wraca do edycji JSON

- ID: US-009  
  Tytuł: Zapisanie nowego przepisu  
  Opis: Po zatwierdzeniu podsumowania nowy przepis jest zapisywany w bazie i pojawia się na liście przepisów.  
  Kryteria akceptacji:  
  - przy zapisie zdarzenie `recipe_created` jest logowane w bazie  
  - użytkownik widzi potwierdzenie sukcesu  
  - nowy przepis pojawia się w widoku listy

- ID: US-010  
  Tytuł: Przeglądanie zapisanych przepisów  
  Opis: Użytkownik widzi listę wszystkich swoich przepisów, może otworzyć szczegóły.  
  Kryteria akceptacji:  
  - widok listy zawiera tytuł przepisu, datę utworzenia i skrócone podsumowanie kalorii  
  - kliknięcie przepisu otwiera stronę ze szczegółami i możliwością edycji

- ID: US-011  
  Tytuł: Usuwanie przepisu  
  Opis: Użytkownik może usunąć zapisany przepis z potwierdzeniem akcji.  
  Kryteria akceptacji:  
  - przycisk „Usuń” przy każdym przepisie wyświetla okno potwierdzenia  
  - po potwierdzeniu przepis jest usuwany, a lista odświeżana

- ID: US-012  
  Tytuł: Kontrola dostępu do przepisów  
  Opis: Tylko właściciel przepisu może go przeglądać, edytować lub usuwać.  
  Kryteria akceptacji:  
  - próba dostępu do obcego przepisu zwraca kod 403 i komunikat o braku uprawnień  
  - system stosuje reguły RLS w Supabase

## 6. Metryki sukcesu
- 90% aktywnych użytkowników posiada wypełnione preferencje żywieniowe  
- 75% użytkowników generuje przynajmniej 1 przepis tygodniowo  
- czas odpowiedzi AI ≤60 s w 95% przypadków  
- tolerancja estymacji kalorii w próbach manualnych ≤±10%  
- liczba błędów AI (tabela `error_logs`) <5% wszystkich wywołań AI 