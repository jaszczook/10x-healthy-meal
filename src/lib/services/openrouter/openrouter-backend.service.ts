import { environment } from '../../../environments/environment';
import { OpenRouterConfig, ChatMessage, ChatOptions, ChatResponse, OpenRouterError } from '../../../types/openrouter';
import { ParsedRecipeDto } from '../../../types/dto';

export class OpenRouterBackendService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries = 3;
  private readonly initialRetryDelay = 30000;

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
    this.baseUrl = finalConfig.baseUrl ?? 'https://openrouter.ai/api/v1/chat/completions';
    this.timeoutMs = finalConfig.timeoutMs ?? 30000;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'HTTP-Referer': 'https://10x-healthy-meal.com',
      'X-Title': '10x Healthy Meal'
    };
  }

  async sendChat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const payload = {
      model: options.modelName ?? 'gpt-4o-mini',
      messages,
      response_format: {
        type: 'json_object'
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

        console.log('Sending request to:', this.baseUrl);
        console.log('With headers:', this.getHeaders());
        console.log('With payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
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

  private validateResponse(data: any): ChatResponse {
    console.log('Validating response:', JSON.stringify(data, null, 2));

    if (!data || typeof data !== 'object') {
      throw new OpenRouterError('Invalid response format', 'INVALID_RESPONSE');
    }

    // Extract the content from the message
    const message = data.choices?.[0]?.message?.content;
    if (!message) {
      throw new OpenRouterError('No message content in response', 'INVALID_RESPONSE');
    }

    try {
      // Parse the content as JSON since it's a stringified JSON
      const parsedContent = JSON.parse(message);
      
      // Validate the parsed content matches ParsedRecipeDto structure
      if (!parsedContent.title || typeof parsedContent.title !== 'string') {
        throw new OpenRouterError('Invalid recipe title in response', 'INVALID_RESPONSE');
      }

      if (!parsedContent.recipe_data || typeof parsedContent.recipe_data !== 'object') {
        throw new OpenRouterError('Invalid recipe data in response', 'INVALID_RESPONSE');
      }

      const { ingredients, steps } = parsedContent.recipe_data;

      if (!Array.isArray(ingredients) || !Array.isArray(steps)) {
        throw new OpenRouterError('Invalid ingredients or steps format in response', 'INVALID_RESPONSE');
      }

      // Validate ingredients
      for (const ingredient of ingredients) {
        if (!ingredient.name || typeof ingredient.name !== 'string' ||
            typeof ingredient.amount !== 'number' ||
            !ingredient.unit || typeof ingredient.unit !== 'string') {
          throw new OpenRouterError('Invalid ingredient format in response', 'INVALID_RESPONSE');
        }
      }

      // Validate steps
      for (const step of steps) {
        if (!step.description || typeof step.description !== 'string') {
          throw new OpenRouterError('Invalid step format in response', 'INVALID_RESPONSE');
        }
      }

      return {
        reply: parsedContent as ParsedRecipeDto,
        sentiment: 'positive' // Since we're getting a valid response, we can assume it's positive
      };
    } catch (e) {
      throw new OpenRouterError('Failed to parse message content as JSON', 'INVALID_JSON', undefined, e);
    }
  }
} 