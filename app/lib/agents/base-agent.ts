
// Base Agent Class - Common functionality for all swarm agents

import { Agent, Task, CyberEvent, ChainOfThought, AgentStatus, TaskStatus } from '../types';

export abstract class BaseAgent {
  protected agentId: string;
  protected agentName: string;
  protected agentType: string;
  protected supportedTasks: string[];
  protected status: AgentStatus = "IDLE";
  protected onEventCallback?: (event: CyberEvent) => void;
  protected onChainOfThoughtCallback?: (thought: ChainOfThought) => void;
  protected onStatusChangeCallback?: (agentId: string, status: AgentStatus) => void;

  constructor(
    agentId: string,
    agentName: string,
    agentType: string,
    supportedTasks: string[]
  ) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.agentType = agentType;
    this.supportedTasks = supportedTasks;
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
      registeredAt: new Date()
    };
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  protected setStatus(status: AgentStatus) {
    this.status = status;
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
      taskId
    };

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
      taskId
    };

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

  // Simulate network operations with realistic timing
  protected async simulateNetworkOperation(
    operation: string,
    target?: string,
    complexity: number = 1
  ): Promise<void> {
    const baseTime = 2000; // 2 seconds base
    const variability = 3000; // Up to 3 seconds additional
    const totalTime = baseTime + (Math.random() * variability * complexity);
    
    this.logChainOfThought(
      1,
      "action",
      `Starting ${operation}`,
      `Initiating ${operation}${target ? ` on ${target}` : ''}. Estimated time: ${Math.round(totalTime/1000)}s`,
      { operation, target, estimatedTime: totalTime }
    );

    await this.delay(totalTime * 0.8, totalTime * 1.2);
  }

  // Check if agent can handle a specific task
  canHandleTask(taskName: string): boolean {
    return this.supportedTasks.includes(taskName);
  }

  // Agent lifecycle methods
  start(): void {
    this.setStatus("IDLE");
    console.log(`🤖 Agent ${this.agentId} (${this.agentType}) started`);
  }

  stop(): void {
    this.setStatus("OFFLINE");
    console.log(`🛑 Agent ${this.agentId} stopped`);
  }
}
