# Plan implementacji usługi OpenRouter

## 1. Opis usługi
Usługa `OpenRouterService` umożliwia integrację z API OpenRouter w celu generowania odpowiedzi opartych na LLM w ramach czatu. Została zaprojektowana w TypeScript i działa w warstwie backendu (Express.js), z możliwością wywoływania z poziomu frontendu (Angular 19).

**Kluczowe zadania usługi:**
- Przygotowanie i walidacja komunikatów (systemowego i użytkownika)
- Konfiguracja modelu (nazwa, parametry)
- Generowanie `response_format` w postaci JSON Schema
- Wysyłka żądań HTTP do OpenRouter API
- Obsługa odpowiedzi i błędów

---

## 2. Opis konstruktora
```ts
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;        // Domyślnie: https://openrouter.ai/api/chat/completions
  timeoutMs?: number;      // Domyślnie: 30000
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) throw new Error("Brak klucza API OpenRouter");
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://openrouter.ai/api/chat/completions';
    this.timeoutMs = config.timeoutMs ?? 30000;
  }
}
```

**Opis parametrów konstruktora:**
- `apiKey`: klucz autoryzacyjny dla OpenRouter
- `baseUrl`: URL endpointu (możliwość zmiany na środowiska testowe)
- `timeoutMs`: limit czasu oczekiwania na odpowiedź API

---

## 3. Publiczne metody i pola

### Metoda: `sendChat`  
```ts
interface ChatMessage { role: 'system' | 'user'; content: string; }
interface ChatOptions {
  modelName?: string;            // np. 'gpt-4o-mini'
  modelParams?: Record<string, any>; // np. { temperature: 0.7, top_p: 0.9, max_tokens: 150 }
}
interface ChatResponse { [key: string]: any; }

class OpenRouterService {
  // ... konstruktor ...

  async sendChat(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    const payload = {
      model: options.modelName ?? 'gpt-4o-mini',
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'chat_response_schema',
          strict: true,
          schema: {
            reply: { type: 'string' },
            sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] }
          }
        }
      },
      parameters: options.modelParams ?? { temperature: 0.7, top_p: 0.9, max_tokens: 150 }
    };

    // Wywołanie HTTP (axios/fetch)
    return this.executeRequest(payload);
  }
}
```

**Wyjaśnienie elementów żądania:**
1. Komunikat systemowy i użytkownika podajemy w tablicy `messages`:
   - `{ role: 'system', content: 'You are a helpful assistant.' }`
   - `{ role: 'user', content: 'Cześć, jak mogę Ci pomóc?' }`
2. `response_format` określa, że oczekujemy ściśle określonego schematu JSON:
   ```ts
   {
     type: 'json_schema',
     json_schema: {
       name: 'chat_response_schema',
       strict: true,
       schema: {
         reply: { type: 'string' },
         sentiment: { type: 'string', enum: ['positive','neutral','negative'] }
       }
     }
   }
   ```
3. `model`: nazwa modelu (np. `'gpt-4o-mini'` lub inny wspierany przez OpenRouter)
4. `parameters`: dodatkowe parametry modelu (np. `temperature`, `top_p`, `max_tokens`)

---

## 4. Prywatne metody i pola

- `private async executeRequest(payload: any): Promise<any>`  
  Wysyła żądanie HTTP do OpenRouter API, obsługuje nagłówki (`Authorization: Bearer <apiKey>`), timeout oraz parsowanie odpowiedzi.
  - Retry z backoffem w razie `429` lub błędów sieciowych.

- `private validateSchema(response: any): void`  
  Waliduje odpowiedź przy pomocy biblioteki JSON Schema.

- `private handleError(error: any): never`  
  Rozpoznaje typ błędu (HTTP, sieć, JSON) i wyrzuca dedykowaną klasę błędu.


---

## 5. Obsługa błędów
Potencjalne scenariusze i podejście do obsługi:

1. Błąd sieci (timeout, brak połączenia)  
   _Rozwiązanie:_ retry z backoffem, limit prób, log i przekazanie błędu.
2. Nieprawidłowy API key (401 Unauthorized)  
   _Rozwiązanie:_ natychmiastowy błąd, informacja o konieczności zaktualizowania klucza.
3. Przekroczenie limitu (429 Too Many Requests)  
   _Rozwiązanie:_ exponential backoff, później odrzucenie z opisem "Rate limit exceeded".
4. Nieprawidłowa struktura odpowiedzi (422 Unprocessable Entity)  
   _Rozwiązanie:_ walidacja JSON Schema, rzucenie błędu walidacji.
5. Inne kody HTTP (>=500)  
   _Rozwiązanie:_ retry, fallback do mechanizmu degradacji lub informacja "Service temporarily unavailable".
6. Błędy parsowania JSON  
   _Rozwiązanie:_ obsługa wyjątku `SyntaxError`, logowanie surowej odpowiedzi.

---

## 6. Kwestie bezpieczeństwa

- Przechowywanie klucza API w zmiennych środowiskowych (`.env`) i niecommitowanie go do repozytorium.
- Wymuszanie HTTPS dla całej komunikacji.
- Walidacja i sanitizacja komunikatów od użytkownika (unikanie injection).
- Ograniczenie rate limitu po stronie serwera (np. `express-rate-limit`).
- Obsługa CORS zgodnie z polityką aplikacji.
- Maskowanie w logach wrażliwych danych (API key, pełne payloady).

---

## 7. Plan wdrożenia krok po kroku

1. **Instalacja zależności:**
   ```bash
   npm install axios dotenv jsonschema
   ```
2. **Konfiguracja środowiska:**
   - Utwórz plik `.env` w katalogu głównym:
     ```dotenv
     OPENROUTER_API_KEY=twój_klucz_api
     OPENROUTER_BASE_URL=https://openrouter.ai/api/chat/completions
     ```
3. **Struktura plików:**
   ```
   src/
   └─ lib/
      └─ openrouter/
         ├─ openrouter.service.ts
         ├─ openrouter.types.ts
         └─ openrouter.config.ts
   src/types/openrouter.ts
   ```
4. **Implementacja konfiguracji (`openrouter.config.ts`)**
5. **Dodanie typów w `src/types/openrouter.ts`**
6. **Implementacja serwisu w `openrouter.service.ts`:**
   - Konstruktor i pola prywatne
   - `sendChat` i wzorowanie payloadu (system, user, response_format, model, parameters)
   - Prywatne metody `executeRequest`, `validateSchema`, `handleError`
7. **Testy jednostkowe:**
   - `__tests__/openrouter.service.spec.ts` – mockowanie axios i sprawdzenie scenariuszy sukcesu/błędów.
8. **Integracja z Express:**
   - Utwórz trasę `POST /api/chat` w `src/lib/routes/chat.ts`, która wywołuje `OpenRouterService.sendChat`.
9. **Frontend (Angular 19):**
   - Wygeneruj serwis: `ng generate service lib/openrouter-client`
   - Użyj `HttpClient` do wywołania endpointu Express.
   - Dodaj komponent czatu (`ChatComponent`) w Angular Material + Tailwind.
10. **CI/CD:**
    - Dodaj sekrety (`OPENROUTER_API_KEY`) do GitHub Actions.
    - Zaktualizuj pipeline, aby budować i testować serwis.
11. **Deploy:**
    - Zbuduj obraz Docker z backendem i frontendem.
    - Wdróż na DigitalOcean. 