// Base Agent Class - Common functionality for all swarm agents with Gemini integration

import { Agent, Task, CyberEvent, ChainOfThought, AgentStatus, SecurityTool, ToolExecution } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { SecurityToolRegistry, getToolRegistry } from '../tools/security-tool-registry.js';
import { logger } from '../utils/logger.js';

export abstract class BaseAgent {
  protected agentId: string;
  protected agentName: string;
  protected agentType: string;
  protected supportedTasks: string[];
  protected status: AgentStatus = "IDLE";
  protected geminiClient: GeminiClient;
  protected toolRegistry: SecurityToolRegistry;
  protected toolExecutionLog: ToolExecution[] = [];
  protected onEventCallback?: (event: CyberEvent) => void;
  protected onChainOfThoughtCallback?: (thought: ChainOfThought) => void;
  protected onStatusChangeCallback?: (agentId: string, status: AgentStatus) => void;

  constructor(
    agentId: string,
    agentName: string,
    agentType: string,
    supportedTasks: string[],
    geminiClient: GeminiClient
  ) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.agentType = agentType;
    this.supportedTasks = supportedTasks;
    this.geminiClient = geminiClient;
    this.toolRegistry = getToolRegistry();

    logger.debug(`Agent initialized: ${agentId} (${agentType}) with ${this.getAvailableTools().length} tools`);
  }

  // Register callbacks for real-time updates
  setEventCallback(callback: (event: CyberEvent) => void) {
    this.onEventCallback = callback;
  }

  setChainOfThoughtCallback(callback: (thought: ChainOfThought) => void) {
    this.onChainOfThoughtCallback = callback;
  }

  setStatusChangeCallback(callback: (agentId: string, status: AgentStatus) => void) {
    this.onStatusChangeCallback = callback;
  }

  // Agent properties
  getAgentInfo(): Agent {
    return {
      id: this.agentId,
      agentId: this.agentId,
      agentName: this.agentName,
      agentType: this.agentType,
      supportedTasks: this.supportedTasks,
      status: this.status,
      lastSeen: new Date(),
      registeredAt: new Date(),
    };
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  protected setStatus(status: AgentStatus) {
    this.status = status;
    logger.debug(`Agent ${this.agentId} status changed to ${status}`);
    this.onStatusChangeCallback?.(this.agentId, status);
  }

  // Chain of thought logging
  protected logChainOfThought(
    stepNumber: number,
    stepType: string,
    description: string,
    reasoning: string,
    data?: any,
    confidence?: number,
    taskId?: string
  ) {
    const thought: ChainOfThought = {
      id: `${this.agentId}-${Date.now()}-${stepNumber}`,
      stepNumber,
      stepType,
      description,
      reasoning,
      data,
      confidence,
      timestamp: new Date(),
      agentId: this.agentId,
      taskId,
    };

    logger.info(`[${this.agentId}] Step ${stepNumber}: ${description}`, {
      type: stepType,
      confidence,
    });

    this.onChainOfThoughtCallback?.(thought);
    return thought;
  }

  // Event emission
  protected emitEvent(
    eventType: string,
    payload: any,
    severity?: string,
    target?: string,
    taskId?: string
  ) {
    const event: CyberEvent = {
      id: `${this.agentId}-${Date.now()}`,
      eventType,
      payload,
      severity: severity as any,
      target,
      processed: false,
      timestamp: new Date(),
      agentId: this.agentId,
      taskId,
    };

    logger.info(`[${this.agentId}] Event emitted: ${eventType}`, {
      severity,
      target,
    });

    this.onEventCallback?.(event);
    return event;
  }

  // Task execution interface
  abstract executeTask(task: Task): Promise<CyberEvent>;

  // Utility method to simulate realistic delays
  protected async delay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Check if agent can handle a specific task
  canHandleTask(taskName: string): boolean {
    return this.supportedTasks.includes(taskName);
  }

  // Agent lifecycle methods
  start(): void {
    this.setStatus("IDLE");
    logger.info(`🤖 Agent ${this.agentId} (${this.agentType}) started`);
  }

  stop(): void {
    this.setStatus("OFFLINE");
    logger.info(`🛑 Agent ${this.agentId} stopped`);
  }

  // Helper method to use Gemini for decision making
  protected async getGeminiDecision<T = any>(prompt: string): Promise<T> {
    try {
      logger.debug(`[${this.agentId}] Requesting Gemini decision`);
      const response = await this.geminiClient.generateJSON<T>(prompt);
      logger.debug(`[${this.agentId}] Gemini decision received`);
      return response;
    } catch (error: any) {
      logger.error(`[${this.agentId}] Error getting Gemini decision: ${error.message}`);
      throw error;
    }
  }

  // Helper method to use Gemini with file context
  protected async getGeminiDecisionWithFiles<T = any>(
    prompt: string,
    fileUris: string[]
  ): Promise<T> {
    try {
      logger.debug(`[${this.agentId}] Requesting Gemini decision with files`, {
        fileCount: fileUris.length,
      });

      const response = await this.geminiClient.generateWithFiles(prompt, fileUris);
      const parsed = JSON.parse(response.text);

      logger.debug(`[${this.agentId}] Gemini decision with files received`);
      return parsed as T;
    } catch (error: any) {
      logger.error(`[${this.agentId}] Error getting Gemini decision with files: ${error.message}`);
      throw error;
    }
  }

  // Get all security tools available to this agent type
  getAvailableTools(): SecurityTool[] {
    return this.toolRegistry.getToolsForAgent(this.agentType);
  }

  // Get a specific tool by ID
  protected getTool(toolId: string): SecurityTool | undefined {
    return this.toolRegistry.getTool(toolId);
  }

  // Get tools that can address a specific MITRE ATT&CK technique
  protected getToolsForTechnique(techniqueId: string): SecurityTool[] {
    return this.toolRegistry.getToolsForTechnique(techniqueId);
  }

  // Log a simulated tool execution in the chain of thought
  protected logToolUsage(
    toolId: string,
    command: string,
    target: string,
    options: Record<string, any> = {},
    taskId?: string
  ): ToolExecution {
    const tool = this.toolRegistry.getTool(toolId);
    const execution: ToolExecution = {
      toolId,
      toolName: tool?.name || toolId,
      command,
      options,
      target,
      startedAt: new Date(),
      agentId: this.agentId,
      taskId,
    };

    this.toolExecutionLog.push(execution);

    logger.info(`[${this.agentId}] Tool execution: ${tool?.name || toolId}`, {
      command,
      target,
      riskLevel: tool?.riskLevel,
    });

    return execution;
  }

  // Complete a tool execution log entry
  protected completeToolExecution(
    execution: ToolExecution,
    exitCode: number,
    output: any
  ): void {
    execution.completedAt = new Date();
    execution.exitCode = exitCode;
    execution.output = output;
  }

  // Get tool execution history for this agent
  getToolExecutionLog(): ToolExecution[] {
    return [...this.toolExecutionLog];
  }

  // Get a summary of available tools for Gemini prompt context
  protected getToolContextForPrompt(): string {
    const tools = this.getAvailableTools();
    if (tools.length === 0) return '';

    const toolSummary = tools.map(t =>
      `- ${t.name} (${t.id}): ${t.description} [${t.category}] [Risk: ${t.riskLevel}] [MITRE: ${t.mitreTechniques.join(', ') || 'N/A'}]`
    ).join('\n');

    return `\nAvailable Security Tools:\n${toolSummary}\n`;
  }
}
