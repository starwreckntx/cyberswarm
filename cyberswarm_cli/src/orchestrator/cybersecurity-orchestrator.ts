// CyberSecurity Orchestrator - Main orchestration system

import { AgentManager } from './agent-manager.js';
import { LogicPipe } from './logic-pipe.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { DiscoveryAgent } from '../agents/discovery-agent.js';
import { VulnerabilityScannerAgent } from '../agents/vulnerability-scanner-agent.js';
import { PatchManagementAgent } from '../agents/patch-management-agent.js';
import { NetworkMonitorAgent } from '../agents/network-monitor-agent.js';
import { StrategyAdaptationAgent } from '../agents/strategy-adaptation-agent.js';
import { ThreatHunterAgent } from '../agents/threat-hunter-agent.js';
import { IncidentResponseAgent } from '../agents/incident-response-agent.js';
import { PostureAssessmentAgent } from '../agents/posture-assessment-agent.js';
import { ThreatIntelligenceAgent } from '../agents/threat-intelligence-agent.js';
import { CyberEvent, ChainOfThought, Task, SimulationState } from '../types.js';
import { logger, logSimulationEvent } from '../utils/logger.js';
import { Config } from '../types.js';

export class CyberSecurityOrchestrator {
  private agentManager: AgentManager;
  private logicPipe: LogicPipe;
  private geminiClient: GeminiClient;
  private config: Config;

  private isRunning: boolean = false;
  private startTime?: Date;
  private endTime?: Date;
  private targetNetwork?: string;

  private eventHistory: CyberEvent[] = [];
  private chainOfThoughtHistory: ChainOfThought[] = [];

  private simulationTimeout?: NodeJS.Timeout;

  constructor(config: Config) {
    this.config = config;
    this.geminiClient = new GeminiClient(
      config.gemini.apiKey,
      config.gemini.model
    );

    this.agentManager = new AgentManager();
    this.logicPipe = new LogicPipe();

    this.initializeAgents();
    this.setupCallbacks();

    logger.info('CyberSecurity Orchestrator initialized');
  }

  /**
   * Initialize all agents
   */
  private initializeAgents(): void {
    // Create and register all 9 agents (5 original + 4 purple team)
    const discoveryAgent = new DiscoveryAgent(this.geminiClient);
    const vulnScannerAgent = new VulnerabilityScannerAgent(this.geminiClient);
    const patchMgmtAgent = new PatchManagementAgent(this.geminiClient);
    const networkMonitorAgent = new NetworkMonitorAgent(this.geminiClient);
    const strategyAdaptAgent = new StrategyAdaptationAgent(this.geminiClient);

    // Purple Team Agents
    const threatHunterAgent = new ThreatHunterAgent(this.geminiClient);
    const incidentResponseAgent = new IncidentResponseAgent(this.geminiClient);
    const postureAssessmentAgent = new PostureAssessmentAgent(this.geminiClient);
    const threatIntelAgent = new ThreatIntelligenceAgent(this.geminiClient);

    this.agentManager.registerAgent(discoveryAgent);
    this.agentManager.registerAgent(vulnScannerAgent);
    this.agentManager.registerAgent(patchMgmtAgent);
    this.agentManager.registerAgent(networkMonitorAgent);
    this.agentManager.registerAgent(strategyAdaptAgent);
    this.agentManager.registerAgent(threatHunterAgent);
    this.agentManager.registerAgent(incidentResponseAgent);
    this.agentManager.registerAgent(postureAssessmentAgent);
    this.agentManager.registerAgent(threatIntelAgent);

    // Set up agent callbacks
    for (const agent of [
      discoveryAgent,
      vulnScannerAgent,
      patchMgmtAgent,
      networkMonitorAgent,
      strategyAdaptAgent,
      threatHunterAgent,
      incidentResponseAgent,
      postureAssessmentAgent,
      threatIntelAgent,
    ]) {
      agent.setEventCallback(this.handleEvent.bind(this));
      agent.setChainOfThoughtCallback(this.handleChainOfThought.bind(this));
    }

    logger.info('All agents initialized and registered (including purple team)');
  }

  /**
   * Setup orchestrator callbacks
   */
  private setupCallbacks(): void {
    // When task completes, process the resulting event
    this.agentManager.setTaskCompleteCallback(this.handleTaskComplete.bind(this));

    // When logic pipe creates tasks, add them to agent manager
    this.logicPipe.setTaskCreatedCallback(this.handleLogicPipeTask.bind(this));
  }

  /**
   * Handle events from agents
   */
  private handleEvent(event: CyberEvent): void {
    this.eventHistory.push(event);
    
    logSimulationEvent('event_created', {
      eventType: event.eventType,
      severity: event.severity,
      target: event.target,
      agentId: event.agentId,
    });

    logger.info(`Event received: ${event.eventType}`, {
      severity: event.severity,
      target: event.target,
      agentId: event.agentId,
    });

    // Process through logic pipe if simulation is running
    if (this.isRunning && !event.processed) {
      event.processed = true;
      this.logicPipe.processEvent(event);
    }
  }

  /**
   * Handle chain of thought from agents
   */
  private handleChainOfThought(thought: ChainOfThought): void {
    this.chainOfThoughtHistory.push(thought);
    
    logSimulationEvent('chain_of_thought', {
      agentId: thought.agentId,
      stepNumber: thought.stepNumber,
      stepType: thought.stepType,
      description: thought.description,
    });
  }

  /**
   * Handle task completion
   */
  private handleTaskComplete(task: Task, event: CyberEvent): void {
    logSimulationEvent('task_complete', {
      taskId: task.taskId,
      agentType: task.agentType,
      taskName: task.taskName,
      status: task.status,
      duration: task.completedAt
        ? task.completedAt.getTime() - task.createdAt.getTime()
        : 0,
    });
  }

  /**
   * Handle tasks created by logic pipe
   */
  private handleLogicPipeTask(task: Task): void {
    this.agentManager.addTask(task);
  }

  /**
   * Start simulation
   */
  async startSimulation(targetNetwork?: string, duration?: number): Promise<void> {
    if (this.isRunning) {
      logger.warn('Simulation already running');
      return;
    }

    this.isRunning = true;
    this.startTime = new Date();
    this.targetNetwork = targetNetwork || this.config.simulation.targetNetwork;
    this.eventHistory = [];
    this.chainOfThoughtHistory = [];

    logger.info('🚀 Starting CyberSwarm simulation', {
      target: this.targetNetwork,
      duration: duration || this.config.simulation.timeout,
    });

    // Start all agents
    this.agentManager.startAllAgents();

    // Create initial discovery task to kick off the simulation
    const initialTask = this.agentManager.createAndAddTask(
      'DiscoveryAgent',
      'network_scan',
      this.targetNetwork,
      { initialScan: true },
      10
    );

    logger.info('Initial task created', { taskId: initialTask.taskId });

    // Set timeout if specified
    const timeoutDuration = duration || this.config.simulation.timeout;
    if (timeoutDuration > 0) {
      this.simulationTimeout = setTimeout(() => {
        logger.info('Simulation timeout reached');
        this.stopSimulation();
      }, timeoutDuration);
    }

    logSimulationEvent('simulation_start', {
      target: this.targetNetwork,
      startTime: this.startTime,
    });
  }

  /**
   * Stop simulation
   */
  stopSimulation(): void {
    if (!this.isRunning) {
      logger.warn('Simulation not running');
      return;
    }

    this.isRunning = false;
    this.endTime = new Date();

    // Clear timeout
    if (this.simulationTimeout) {
      clearTimeout(this.simulationTimeout);
      this.simulationTimeout = undefined;
    }

    // Stop all agents
    this.agentManager.stopAllAgents();

    const duration = this.endTime.getTime() - this.startTime!.getTime();

    logger.info('🛑 Simulation stopped', {
      duration: `${(duration / 1000).toFixed(2)}s`,
      events: this.eventHistory.length,
      thoughts: this.chainOfThoughtHistory.length,
    });

    logSimulationEvent('simulation_stop', {
      endTime: this.endTime,
      duration,
      totalEvents: this.eventHistory.length,
      totalThoughts: this.chainOfThoughtHistory.length,
    });
  }

  /**
   * Inject a custom task
   */
  injectTask(
    agentType: string,
    taskName: string,
    target?: string,
    details?: any,
    priority?: number
  ): Task {
    logger.info('Injecting custom task', { agentType, taskName, target });
    
    const task = this.agentManager.createAndAddTask(
      agentType,
      taskName,
      target,
      details,
      priority
    );

    logSimulationEvent('task_injected', {
      taskId: task.taskId,
      agentType,
      taskName,
    });

    return task;
  }

  /**
   * Get simulation state
   */
  getSimulationState(): SimulationState {
    return {
      isRunning: this.isRunning,
      startTime: this.startTime,
      endTime: this.endTime,
      agents: this.agentManager.getAgents(),
      taskQueue: this.agentManager.getAllTasks(),
      eventHistory: this.eventHistory,
      chainOfThoughts: this.chainOfThoughtHistory,
      logicPipeExecutions: this.logicPipe.getExecutionHistory(),
      targetNetwork: this.targetNetwork,
    };
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): CyberEvent[] {
    if (limit) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  /**
   * Get chain of thought history
   */
  getChainOfThoughtHistory(limit?: number): ChainOfThought[] {
    if (limit) {
      return this.chainOfThoughtHistory.slice(-limit);
    }
    return [...this.chainOfThoughtHistory];
  }

  /**
   * Get statistics
   */
  getStats(): any {
    const agentStats = this.agentManager.getAgentStats();
    const logicPipeStats = this.logicPipe.getStats();

    const eventsBySeverity = {
      Critical: this.eventHistory.filter(e => e.severity === 'Critical').length,
      High: this.eventHistory.filter(e => e.severity === 'High').length,
      Medium: this.eventHistory.filter(e => e.severity === 'Medium').length,
      Low: this.eventHistory.filter(e => e.severity === 'Low').length,
    };

    const eventsByType: Record<string, number> = {};
    for (const event of this.eventHistory) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    }

    return {
      simulation: {
        isRunning: this.isRunning,
        duration: this.startTime && this.endTime
          ? this.endTime.getTime() - this.startTime.getTime()
          : this.startTime
          ? Date.now() - this.startTime.getTime()
          : 0,
      },
      agents: agentStats,
      events: {
        total: this.eventHistory.length,
        bySeverity: eventsBySeverity,
        byType: eventsByType,
      },
      chainOfThoughts: {
        total: this.chainOfThoughtHistory.length,
      },
      logicPipe: logicPipeStats,
      tasks: {
        total: this.agentManager.getAllTasks().length,
        pending: this.agentManager.getTaskQueue().length,
        active: this.agentManager.getActiveTasks().length,
      },
    };
  }

  /**
   * Is simulation running
   */
  isSimulationRunning(): boolean {
    return this.isRunning;
  }
}
