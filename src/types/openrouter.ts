export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export interface ChatOptions {
  modelName?: string;
  modelParams?: Record<string, any>;
}

export interface ChatResponse {
  reply: any;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface OpenRouterRequestPayload {
  model: string;
  messages: ChatMessage[];
  response_format: {
    type: 'json_schema';
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, any>;
    };
  };
  parameters: Record<string, any>;
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
} 