
// Main Cybersecurity Orchestrator - Combines Logic Pipe and Agent Manager

import { AgentManager } from './agent-manager';
import { LogicPipeOrchestrator } from './logic-pipe';
import { CyberEvent, Task, ChainOfThought, LogicPipeExecution, AgentStatus, TaskStatus, StreamEvent } from '../types';

export class CyberSecurityOrchestrator {
  private agentManager: AgentManager;
  private logicPipe: LogicPipeOrchestrator;
  private eventHistory: CyberEvent[] = [];
  private chainOfThoughtHistory: ChainOfThought[] = [];
  private logicPipeExecutions: LogicPipeExecution[] = [];
  private isRunning = false;
  
  // Real-time event callbacks
  private onStreamEventCallback?: (event: StreamEvent) => void;

  constructor() {
    this.agentManager = new AgentManager();
    this.logicPipe = new LogicPipeOrchestrator();
    
    this.setupCallbacks();
    console.log('🎛️  Cybersecurity Orchestrator initialized');
  }

  private setupCallbacks() {
    // Agent Manager callbacks
    this.agentManager.setEventCallback((event: CyberEvent) => {
      this.handleEvent(event);
    });

    this.agentManager.setChainOfThoughtCallback((thought: ChainOfThought) => {
      this.handleChainOfThought(thought);
    });

    this.agentManager.setAgentStatusChangeCallback((agentId: string, status: AgentStatus) => {
      this.broadcastStreamEvent({
        type: 'agent_status',
        data: { agentId, status },
        timestamp: new Date()
      });
    });

    this.agentManager.setTaskStatusChangeCallback((taskId: string, status: TaskStatus) => {
      this.broadcastStreamEvent({
        type: 'task_update',
        data: { taskId, status },
        timestamp: new Date()
      });
    });

    // Logic Pipe callbacks
    this.logicPipe.setTaskCreatedCallback((task: Task) => {
      this.agentManager.addTask(task);
    });

    this.logicPipe.setLogicPipeExecutionCallback((execution: LogicPipeExecution) => {
      this.handleLogicPipeExecution(execution);
    });
  }

  setStreamEventCallback(callback: (event: StreamEvent) => void) {
    this.onStreamEventCallback = callback;
  }

  private broadcastStreamEvent(event: StreamEvent) {
    this.onStreamEventCallback?.(event);
  }

  private async handleEvent(event: CyberEvent) {
    // Store event in history
    this.eventHistory.push(event);
    
    // Broadcast event
    this.broadcastStreamEvent({
      type: 'event_created',
      data: event,
      timestamp: new Date()
    });

    // Process through Logic Pipe
    try {
      await this.logicPipe.processEvent(event);
    } catch (error) {
      console.error('Logic Pipe processing error:', error);
    }
  }

  private handleChainOfThought(thought: ChainOfThought) {
    // Store chain of thought
    this.chainOfThoughtHistory.push(thought);
    
    // Broadcast chain of thought
    this.broadcastStreamEvent({
      type: 'chain_of_thought',
      data: thought,
      timestamp: new Date()
    });
  }

  private handleLogicPipeExecution(execution: LogicPipeExecution) {
    // Store execution
    this.logicPipeExecutions.push(execution);
    
    // Broadcast execution
    this.broadcastStreamEvent({
      type: 'logic_pipe_execution',
      data: execution,
      timestamp: new Date()
    });
  }

  // Public API methods
  startSimulation(targetNetwork?: string) {
    if (this.isRunning) {
      console.log('⚠️  Simulation already running');
      return;
    }

    this.isRunning = true;
    console.log('🎬 Starting cybersecurity simulation');
    this.agentManager.startSimulation(targetNetwork);
  }

  stopSimulation() {
    if (!this.isRunning) {
      console.log('⚠️  Simulation not running');
      return;
    }

    this.isRunning = false;
    console.log('🛑 Stopping cybersecurity simulation');
    this.agentManager.stopAllAgents();
  }

  getSimulationStatus() {
    return {
      isRunning: this.isRunning,
      agents: this.agentManager.getAllAgents(),
      agentStats: this.agentManager.getAgentStats(),
      taskQueue: this.agentManager.getTaskQueue(),
      recentEvents: this.eventHistory.slice(-10),
      recentChainOfThoughts: this.chainOfThoughtHistory.slice(-20),
      logicPipeStats: this.logicPipe.getLogicPipeStats()
    };
  }

  getEventHistory(limit: number = 50): CyberEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getChainOfThoughtHistory(limit: number = 100): ChainOfThought[] {
    return this.chainOfThoughtHistory.slice(-limit);
  }

  getLogicPipeExecutions(limit: number = 50): LogicPipeExecution[] {
    return this.logicPipeExecutions.slice(-limit);
  }

  // Manual task injection for testing
  injectTask(agentType: string, taskName: string, target?: string, details?: any) {
    const task = this.logicPipe.createManualTask(agentType, taskName, target, details);
    return task;
  }

  // Agent control
  startAgent(agentId: string): boolean {
    return this.agentManager.startAgent(agentId);
  }

  stopAgent(agentId: string): boolean {
    return this.agentManager.stopAgent(agentId);
  }

  getAgent(agentId: string) {
    return this.agentManager.getAgent(agentId);
  }

  // Knowledge base queries
  getKnowledgeBase() {
    const events = this.eventHistory;
    const categorized = {
      recon: events.filter(e => e.eventType === 'RECON_DATA'),
      vulnerabilities: events.filter(e => e.eventType === 'VULNERABILITY_FOUND'),
      intrusions: events.filter(e => e.eventType === 'INTRUSION_DETECTED'),
      defenseActions: events.filter(e => e.eventType === 'DEFENSE_ACTION'),
      adaptations: events.filter(e => e.eventType === 'ATTACK_ADAPTATION')
    };

    return {
      total: events.length,
      categories: categorized,
      summary: {
        reconnaissance: categorized.recon.length,
        vulnerabilities: categorized.vulnerabilities.length,
        intrusions: categorized.intrusions.length,
        defenseActions: categorized.defenseActions.length,
        adaptations: categorized.adaptations.length
      }
    };
  }

  // Analytics and insights
  getAnalytics() {
    const events = this.eventHistory;
    const executions = this.logicPipeExecutions;
    
    return {
      totalEvents: events.length,
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.success).length,
      averageExecutionTime: executions.length > 0 
        ? executions.reduce((sum, e) => sum + (e.executionTime || 0), 0) / executions.length 
        : 0,
      eventsByType: this.groupEventsByType(events),
      rulesByType: this.groupExecutionsByRule(executions),
      recentActivity: events.slice(-5)
    };
  }

  private groupEventsByType(events: CyberEvent[]) {
    const grouped: Record<string, number> = {};
    for (const event of events) {
      grouped[event.eventType] = (grouped[event.eventType] || 0) + 1;
    }
    return grouped;
  }

  private groupExecutionsByRule(executions: LogicPipeExecution[]) {
    const grouped: Record<string, number> = {};
    for (const execution of executions) {
      grouped[execution.ruleApplied] = (grouped[execution.ruleApplied] || 0) + 1;
    }
    return grouped;
  }
}
