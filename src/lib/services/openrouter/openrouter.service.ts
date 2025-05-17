import { Injectable, inject, InjectionToken, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, from } from 'rxjs';
import { retryWhen, mergeMap, catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  OpenRouterConfig,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  OpenRouterRequestPayload,
  OpenRouterError
} from '../../../types/openrouter';

export const OPENROUTER_CONFIG = new InjectionToken<OpenRouterConfig>('OPENROUTER_CONFIG');

@Injectable({
  providedIn: 'root'
})
export class OpenRouterService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(OPENROUTER_CONFIG, { optional: true });

  private readonly apiKey = signal(this.initializeConfig().apiKey);
  private readonly baseUrl = signal(this.initializeConfig().baseUrl ?? 'https://openrouter.ai/api/chat/completions');
  private readonly timeoutMs = signal(this.initializeConfig().timeoutMs ?? 30000);
  private readonly maxRetries = 3;
  private readonly initialRetryDelay = 1000;

  private initializeConfig(): OpenRouterConfig {
    const defaultConfig: OpenRouterConfig = {
      apiKey: environment.openRouterApiKey,
      baseUrl: environment.openRouterBaseUrl,
      timeoutMs: 30000
    };

    const config = this.config || defaultConfig;

    if (!config.apiKey) {
      throw new OpenRouterError('OpenRouter API key is required');
    }

    return config;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey()}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Healthy Meal App'
    });
  }

  sendChat(messages: ChatMessage[], options: ChatOptions = {}): Observable<ChatResponse> {
    const payload: OpenRouterRequestPayload = {
      model: options.modelName ?? 'gpt-4o-mini',
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'chat_response_schema',
          strict: true,
          schema: {
            type: 'object',
            required: ['reply', 'sentiment'],
            properties: {
              reply: { type: 'string' },
              sentiment: { 
                type: 'string',
                enum: ['positive', 'neutral', 'negative']
              }
            }
          }
        }
      },
      parameters: options.modelParams ?? {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 150
      }
    };

    return this.http.post<any>(this.baseUrl(), payload, {
      headers: this.getHeaders()
    }).pipe(
      timeout(this.timeoutMs()),
      map(response => this.validateResponse(response)),
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, index) => {
            const retryAttempt = index + 1;
            if (retryAttempt > this.maxRetries || error.status === 401) {
              return throwError(() => error);
            }
            return timer(this.initialRetryDelay * Math.pow(2, index));
          })
        )
      ),
      catchError(error => this.handleError(error))
    );
  }

  private validateResponse(response: any): ChatResponse {
    if (!response?.choices?.[0]?.message?.content) {
      throw new OpenRouterError('Invalid response format from OpenRouter API');
    }

    try {
      const content = JSON.parse(response.choices[0].message.content);
      
      if (typeof content.reply !== 'string' || 
          !['positive', 'neutral', 'negative'].includes(content.sentiment)) {
        throw new Error('Invalid response schema');
      }

      return content as ChatResponse;
    } catch (error) {
      throw new OpenRouterError(
        'Failed to parse OpenRouter API response',
        'INVALID_RESPONSE',
        undefined,
        error
      );
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An error occurred while communicating with OpenRouter API';
    let code: string | undefined;
    let status: number | undefined;

    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      status = error.status;
      message = error.error?.message || error.message;
      code = error.error?.code;

      switch (error.status) {
        case 401:
          message = 'Invalid API key or unauthorized access';
          break;
        case 429:
          message = 'Rate limit exceeded. Please try again later';
          break;
        case 500:
          message = 'OpenRouter service is temporarily unavailable';
          break;
      }
    }

    return throwError(() => new OpenRouterError(message, code, status, error));
  }
} 