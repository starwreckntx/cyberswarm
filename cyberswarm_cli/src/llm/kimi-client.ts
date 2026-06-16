// Kimi (Moonshot AI) client for CyberSwarm CLI
//
// Moonshot exposes an OpenAI-compatible Chat Completions API, so this client
// talks to it directly over fetch (Node 18+ global fetch) — no extra SDK
// dependency. It implements the shared LLMClient surface used by every agent.

import fs from 'fs';
import { logger } from '../utils/logger.js';
import { LLMClient, LLMResponse, parseJsonFromLLM } from './llm-client.js';

export interface KimiClientOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

const DEFAULT_MODEL = 'kimi-k2-0711-preview';
const DEFAULT_BASE_URL = 'https://api.moonshot.ai/v1';

export class KimiClient implements LLMClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private temperature: number;
  private maxOutputTokens: number;

  constructor(options: KimiClientOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model || DEFAULT_MODEL;
    // Normalise: drop any trailing slash so we can append /chat/completions.
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.temperature = options.temperature ?? 0.7;
    this.maxOutputTokens = options.maxOutputTokens ?? 8192;

    logger.info(`Kimi client initialized with model: ${this.model} (${this.baseUrl})`);
  }

  /**
   * Generate content from a text prompt via the chat completions endpoint.
   */
  async generateContent(prompt: string): Promise<LLMResponse> {
    return this.chat([{ role: 'user', content: prompt }]);
  }

  /**
   * Generate a structured JSON response. Uses the shared markdown-tolerant
   * parser so behaviour matches the Gemini client.
   */
  async generateJSON<T = any>(prompt: string): Promise<T> {
    try {
      const response = await this.generateContent(prompt);
      const parsed = parseJsonFromLLM<T>(response.text);
      logger.debug('Successfully parsed JSON response from Kimi');
      return parsed;
    } catch (error: any) {
      logger.error('Error parsing JSON from Kimi response', { error: error.message });
      throw new Error(`Failed to parse JSON from Kimi: ${error.message}`);
    }
  }

  /**
   * Generate content with file context. Moonshot's file API differs from the
   * chat surface, so for the simulation we inline readable local files as text
   * context — keeping grounding functional without a separate upload flow.
   */
  async generateWithFiles(prompt: string, fileUris: string[]): Promise<LLMResponse> {
    const contextBlocks: string[] = [];

    for (const uri of fileUris) {
      try {
        if (fs.existsSync(uri)) {
          const content = fs.readFileSync(uri, 'utf-8').slice(0, 16000);
          contextBlocks.push(`--- File: ${uri} ---\n${content}`);
        } else {
          contextBlocks.push(`--- File: ${uri} (unavailable) ---`);
        }
      } catch (error: any) {
        logger.warn(`Kimi: could not read file context ${uri}: ${error.message}`);
      }
    }

    const combined = contextBlocks.length
      ? `${prompt}\n\nContext files:\n${contextBlocks.join('\n\n')}`
      : prompt;

    return this.generateContent(combined);
  }

  getModelName(): string {
    return this.model;
  }

  /**
   * Low-level call to the OpenAI-compatible chat completions endpoint.
   */
  private async chat(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    try {
      logger.debug('Generating content with Kimi', { model: this.model });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxOutputTokens,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText}${errBody ? ` — ${errBody}` : ''}`);
      }

      const data: any = await res.json();
      const text: string = data?.choices?.[0]?.message?.content ?? '';

      logger.debug('Kimi response received', { responseLength: text.length });

      return { text, raw: data };
    } catch (error: any) {
      logger.error('Error generating content with Kimi', { error: error.message });
      throw new Error(`Kimi API error: ${error.message}`);
    }
  }
}
