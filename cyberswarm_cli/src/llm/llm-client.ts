// LLM provider abstraction for CyberSwarm CLI
//
// Agents reason through a provider-agnostic interface so the swarm can run on
// different backends (Google Gemini, Moonshot Kimi, ...) without touching agent
// code. Each concrete client implements this surface.

export interface LLMResponse {
  text: string;
  raw: any;
}

export interface LLMClient {
  /** Generate a free-form text completion from a prompt. */
  generateContent(prompt: string): Promise<LLMResponse>;

  /** Generate a completion and parse it as JSON (markdown code fences tolerated). */
  generateJSON<T = any>(prompt: string): Promise<T>;

  /** Generate a completion with additional file context (used for grounding). */
  generateWithFiles(prompt: string, fileUris: string[]): Promise<LLMResponse>;

  /** The model identifier this client is configured to use. */
  getModelName(): string;
}

/**
 * Strip markdown code fences and parse a JSON payload returned by an LLM.
 * Shared by all providers so JSON handling is identical regardless of backend.
 */
export function parseJsonFromLLM<T = any>(text: string): T {
  let jsonText = text.trim();

  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
  }

  return JSON.parse(jsonText) as T;
}
