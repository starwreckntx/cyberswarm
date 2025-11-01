
// Gemini API Client for CyberSwarm CLI

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

export interface GeminiResponse {
  text: string;
  raw: any;
}

export interface GeminiFileUpload {
  uri: string;
  mimeType: string;
  name: string;
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private apiKey: string;

  constructor(apiKey: string, modelName: string = 'gemini-1.5-pro') {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
    
    logger.info(`Gemini client initialized with model: ${modelName}`);
  }

  /**
   * Generate content from a text prompt
   */
  async generateContent(prompt: string): Promise<GeminiResponse> {
    try {
      logger.debug('Generating content with Gemini', { promptLength: prompt.length });
      
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      logger.debug('Gemini response received', { responseLength: text.length });

      return {
        text,
        raw: response,
      };
    } catch (error: any) {
      logger.error('Error generating content with Gemini', { error: error.message });
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T = any>(prompt: string): Promise<T> {
    try {
      const response = await this.generateContent(prompt);
      
      // Extract JSON from markdown code blocks if present
      let jsonText = response.text.trim();
      
      // Remove markdown code blocks
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      const parsed = JSON.parse(jsonText);
      logger.debug('Successfully parsed JSON response from Gemini');
      
      return parsed as T;
    } catch (error: any) {
      logger.error('Error parsing JSON from Gemini response', { error: error.message });
      throw new Error(`Failed to parse JSON from Gemini: ${error.message}`);
    }
  }

  /**
   * Upload a file to Gemini for context
   */
  async uploadFile(filePath: string, mimeType?: string): Promise<GeminiFileUpload> {
    try {
      logger.info('Uploading file to Gemini', { filePath });
      
      // Note: File upload would require @google/generative-ai FileManager
      // For now, we'll read the file and use it as text context
      logger.warn('File upload not fully implemented yet, will use file content as text');

      return {
        uri: filePath,
        mimeType: mimeType || 'application/json',
        name: filePath.split('/').pop() || 'file',
      };
    } catch (error: any) {
      logger.error('Error uploading file to Gemini', { error: error.message, filePath });
      throw new Error(`Failed to upload file to Gemini: ${error.message}`);
    }
  }

  /**
   * Generate content with file context
   */
  async generateWithFiles(prompt: string, fileUris: string[]): Promise<GeminiResponse> {
    try {
      logger.debug('Generating content with file context', {
        promptLength: prompt.length,
        fileCount: fileUris.length,
      });

      const parts = [
        { text: prompt },
        ...fileUris.map(uri => ({ fileData: { fileUri: uri, mimeType: 'application/json' } })),
      ];

      const result = await this.model.generateContent(parts as any);
      const response = result.response;
      const text = response.text();

      logger.debug('Gemini response with files received', { responseLength: text.length });

      return {
        text,
        raw: response,
      };
    } catch (error: any) {
      logger.error('Error generating content with files', { error: error.message });
      throw new Error(`Gemini API error with files: ${error.message}`);
    }
  }

  /**
   * Stream content generation (for long-running operations)
   */
  async *streamContent(prompt: string): AsyncGenerator<string> {
    try {
      logger.debug('Starting content stream with Gemini', { promptLength: prompt.length });

      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }

      logger.debug('Content stream completed');
    } catch (error: any) {
      logger.error('Error streaming content from Gemini', { error: error.message });
      throw new Error(`Gemini streaming error: ${error.message}`);
    }
  }

  /**
   * Get the current model name
   */
  getModelName(): string {
    return this.model.model;
  }
}
