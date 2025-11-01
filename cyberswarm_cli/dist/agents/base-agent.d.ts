import { Agent, Task, CyberEvent, ChainOfThought, AgentStatus } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
export declare abstract class BaseAgent {
    protected agentId: string;
    protected agentName: string;
    protected agentType: string;
    protected supportedTasks: string[];
    protected status: AgentStatus;
    protected geminiClient: GeminiClient;
    protected onEventCallback?: (event: CyberEvent) => void;
    protected onChainOfThoughtCallback?: (thought: ChainOfThought) => void;
    protected onStatusChangeCallback?: (agentId: string, status: AgentStatus) => void;
    constructor(agentId: string, agentName: string, agentType: string, supportedTasks: string[], geminiClient: GeminiClient);
    setEventCallback(callback: (event: CyberEvent) => void): void;
    setChainOfThoughtCallback(callback: (thought: ChainOfThought) => void): void;
    setStatusChangeCallback(callback: (agentId: string, status: AgentStatus) => void): void;
    getAgentInfo(): Agent;
    getStatus(): AgentStatus;
    protected setStatus(status: AgentStatus): void;
    protected logChainOfThought(stepNumber: number, stepType: string, description: string, reasoning: string, data?: any, confidence?: number, taskId?: string): ChainOfThought;
    protected emitEvent(eventType: string, payload: any, severity?: string, target?: string, taskId?: string): CyberEvent;
    abstract executeTask(task: Task): Promise<CyberEvent>;
    protected delay(minMs: number, maxMs: number): Promise<void>;
    canHandleTask(taskName: string): boolean;
    start(): void;
    stop(): void;
    protected getGeminiDecision<T = any>(prompt: string): Promise<T>;
    protected getGeminiDecisionWithFiles<T = any>(prompt: string, fileUris: string[]): Promise<T>;
}
//# sourceMappingURL=base-agent.d.ts.map