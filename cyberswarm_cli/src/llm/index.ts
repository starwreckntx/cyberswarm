// LLM provider factory — selects the backend from config.

import { Config } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { KimiClient } from './kimi-client.js';
import { LLMClient } from './llm-client.js';
import { logger } from '../utils/logger.js';

export type { LLMClient, LLMResponse } from './llm-client.js';
export { parseJsonFromLLM } from './llm-client.js';
export { KimiClient } from './kimi-client.js';

/**
 * Build the LLM client for the configured provider.
 */
export function createLLMClient(config: Config): LLMClient {
  const provider = config.provider || 'gemini';

  if (provider === 'kimi') {
    logger.info('Using Kimi (Moonshot) as the LLM provider');
    return new KimiClient({
      apiKey: config.kimi.apiKey,
      model: config.kimi.model,
      baseUrl: config.kimi.baseUrl,
      temperature: config.kimi.temperature,
      maxOutputTokens: config.kimi.maxOutputTokens,
    });
  }

  logger.info('Using Gemini as the LLM provider');
  return new GeminiClient(config.gemini.apiKey, config.gemini.model);
}
