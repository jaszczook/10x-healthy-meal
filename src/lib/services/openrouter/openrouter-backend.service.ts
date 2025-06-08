import { environment } from '../../../environments/environment';
import { OpenRouterConfig, ChatMessage, ChatOptions, ChatResponse, OpenRouterError } from '../../../types/openrouter';

export class OpenRouterBackendService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries = 3;
  private readonly initialRetryDelay = 1000;

  constructor(config?: OpenRouterConfig) {
    const defaultConfig: OpenRouterConfig = {
      apiKey: environment.openRouterApiKey,
      baseUrl: environment.openRouterBaseUrl,
      timeoutMs: 30000
    };

    const finalConfig = config || defaultConfig;

    if (!finalConfig.apiKey) {
      throw new OpenRouterError('OpenRouter API key is required');
    }

    this.apiKey = finalConfig.apiKey;
    this.baseUrl = finalConfig.baseUrl ?? 'https://openrouter.ai/api/chat/completions';
    this.timeoutMs = finalConfig.timeoutMs ?? 30000;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': 'https://10x-healthy-meal.com',
      'X-Title': 'Healthy Meal App'
    };
  }

  async sendChat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const payload = {
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

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Read the response body
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          throw new OpenRouterError('Failed to parse response as JSON', 'INVALID_JSON', undefined, e);
        }

        return this.validateResponse(data);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new OpenRouterError('Request timeout', 'TIMEOUT');
        }

        if (error instanceof Error && error.message.includes('401')) {
          throw new OpenRouterError('Invalid API key or unauthorized access', 'UNAUTHORIZED');
        }

        if (attempt === this.maxRetries - 1) {
          throw new OpenRouterError(
            lastError.message,
            'MAX_RETRIES_EXCEEDED',
            undefined,
            lastError
          );
        }

        // Wait before retrying
        await new Promise(resolve => 
          setTimeout(resolve, this.initialRetryDelay * Math.pow(2, attempt))
        );
      }
    }

    throw new OpenRouterError('Unexpected error', 'UNKNOWN', undefined, lastError);
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
} 