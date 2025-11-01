export interface GeminiResponse {
    text: string;
    raw: any;
}
export interface GeminiFileUpload {
    uri: string;
    mimeType: string;
    name: string;
}
export declare class GeminiClient {
    private genAI;
    private model;
    private apiKey;
    constructor(apiKey: string, modelName?: string);
    /**
     * Generate content from a text prompt
     */
    generateContent(prompt: string): Promise<GeminiResponse>;
    /**
     * Generate structured JSON response
     */
    generateJSON<T = any>(prompt: string): Promise<T>;
    /**
     * Upload a file to Gemini for context
     */
    uploadFile(filePath: string, mimeType?: string): Promise<GeminiFileUpload>;
    /**
     * Generate content with file context
     */
    generateWithFiles(prompt: string, fileUris: string[]): Promise<GeminiResponse>;
    /**
     * Stream content generation (for long-running operations)
     */
    streamContent(prompt: string): AsyncGenerator<string>;
    /**
     * Get the current model name
     */
    getModelName(): string;
}
//# sourceMappingURL=gemini-client.d.ts.map