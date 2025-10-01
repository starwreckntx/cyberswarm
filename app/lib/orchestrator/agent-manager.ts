
// Agent Manager - Manages agent lifecycle and task distribution

import { BaseAgent } from '../agents/base-agent';
import { DiscoveryAgent } from '../agents/discovery-agent';
import { VulnerabilityScannerAgent } from '../agents/vulnerability-scanner-agent';
import { PatchManagementAgent } from '../agents/patch-management-agent';
import { NetworkMonitorAgent } from '../agents/network-monitor-agent';
import { StrategyAdaptationAgent } from '../agents/strategy-adaptation-agent';
import { Agent, Task, CyberEvent, ChainOfThought, AgentStatus, TaskStatus } from '../types';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private taskQueue: Task[] = [];
  private onEventCallback?: (event: CyberEvent) => void;
  private onChainOfThoughtCallback?: (thought: ChainOfThought) => void;
  private onAgentStatusChangeCallback?: (agentId: string, status: AgentStatus) => void;
  private onTaskStatusChangeCallback?: (taskId: string, status: TaskStatus) => void;

  constructor() {
    this.initializeAgents();
  }

  // Initialize all cybersecurity agents
  private initializeAgents() {
    const agentClasses = [
      DiscoveryAgent,
      VulnerabilityScannerAgent,
      PatchManagementAgent,
      NetworkMonitorAgent,
      StrategyAdaptationAgent
    ];

    for (const AgentClass of agentClasses) {
      const agent = new AgentClass();
      
      // Set up callbacks for real-time updates
      agent.setEventCallback((event) => {
        console.log(`📡 Event from ${agent.getAgentInfo().agentId}: ${event.eventType}`);
        this.onEventCallback?.(event);
      });

      agent.setChainOfThoughtCallback((thought) => {
        console.log(`🧠 Chain of thought from ${agent.getAgentInfo().agentId}: ${thought.description}`);
        this.onChainOfThoughtCallback?.(thought);
      });

      agent.setStatusChangeCallback((agentId, status) => {
        console.log(`🤖 Agent ${agentId} status: ${status}`);
        this.onAgentStatusChangeCallback?.(agentId, status);
      });

      this.agents.set(agent.getAgentInfo().agentId, agent);
      agent.start();
      
      console.log(`✅ Initialized agent: ${agent.getAgentInfo().agentName}`);
    }

    console.log(`🚀 Agent Manager: ${this.agents.size} agents initialized`);
  }

  // Set callbacks for real-time updates
  setEventCallback(callback: (event: CyberEvent) => void) {
    this.onEventCallback = callback;
  }

  setChainOfThoughtCallback(callback: (thought: ChainOfThought) => void) {
    this.onChainOfThoughtCallback = callback;
  }

  setAgentStatusChangeCallback(callback: (agentId: string, status: AgentStatus) => void) {
    this.onAgentStatusChangeCallback = callback;
  }

  setTaskStatusChangeCallback(callback: (taskId: string, status: TaskStatus) => void) {
    this.onTaskStatusChangeCallback = callback;
  }

  // Get all agents
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values()).map(agent => agent.getAgentInfo());
  }

  // Get agent by ID
  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  // Add task to queue
  addTask(task: Task) {
    this.taskQueue.push(task);
    console.log(`📋 Task queued: ${task.taskName} for ${task.agentType}`);
    
    // Try to assign immediately
    this.tryAssignTasks();
  }

  // Try to assign pending tasks to available agents
  private tryAssignTasks() {
    const pendingTasks = this.taskQueue.filter(task => task.status === 'PENDING');
    
    for (const task of pendingTasks) {
      const agent = this.findAvailableAgent(task.agentType, task.taskName);
      
      if (agent) {
        this.assignTaskToAgent(task, agent);
      }
    }
  }

  // Find available agent for task
  private findAvailableAgent(agentType: string, taskName: string): BaseAgent | undefined {
    for (const agent of this.agents.values()) {
      const agentInfo = agent.getAgentInfo();
      
      if (agentInfo.agentType === agentType && 
          agentInfo.status === 'IDLE' && 
          agent.canHandleTask(taskName)) {
        return agent;
      }
    }
    return undefined;
  }

  // Assign task to specific agent
  private async assignTaskToAgent(task: Task, agent: BaseAgent) {
    const agentInfo = agent.getAgentInfo();
    console.log(`🎯 Assigning ${task.taskName} to ${agentInfo.agentId}`);
    
    // Update task status
    task.status = 'ASSIGNED';
    task.agentId = agentInfo.agentId;
    task.assignedAt = new Date();
    this.onTaskStatusChangeCallback?.(task.taskId, 'ASSIGNED');

    try {
      // Update task status to executing
      task.status = 'EXECUTING';
      this.onTaskStatusChangeCallback?.(task.taskId, 'EXECUTING');
      
      // Execute the task
      const result = await agent.executeTask(task);
      
      // Mark task as completed
      task.status = 'COMPLETED';
      task.completedAt = new Date();
      this.onTaskStatusChangeCallback?.(task.taskId, 'COMPLETED');
      
      console.log(`✅ Task ${task.taskId} completed by ${agentInfo.agentId}`);
      
      // Remove from queue
      this.removeTaskFromQueue(task.taskId);
      
      // Try to assign more tasks
      setTimeout(() => this.tryAssignTasks(), 1000);
      
    } catch (error) {
      console.error(`❌ Task ${task.taskId} failed:`, error);
      
      task.status = 'FAILED';
      this.onTaskStatusChangeCallback?.(task.taskId, 'FAILED');
      
      // Remove from queue
      this.removeTaskFromQueue(task.taskId);
    }
  }

  // Remove task from queue
  private removeTaskFromQueue(taskId: string) {
    const index = this.taskQueue.findIndex(task => task.taskId === taskId);
    if (index !== -1) {
      this.taskQueue.splice(index, 1);
    }
  }

  // Get current task queue
  getTaskQueue(): Task[] {
    return [...this.taskQueue];
  }

  // Get agent statistics
  getAgentStats() {
    const agents = this.getAllAgents();
    const stats = {
      total: agents.length,
      idle: agents.filter(a => a.status === 'IDLE').length,
      busy: agents.filter(a => a.status === 'BUSY').length,
      error: agents.filter(a => a.status === 'ERROR').length,
      offline: agents.filter(a => a.status === 'OFFLINE').length,
      pendingTasks: this.taskQueue.filter(t => t.status === 'PENDING').length,
      executingTasks: this.taskQueue.filter(t => t.status === 'EXECUTING').length
    };

    return stats;
  }

  // Start agent by ID
  startAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.start();
      return true;
    }
    return false;
  }

  // Stop agent by ID
  stopAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.stop();
      return true;
    }
    return false;
  }

  // Stop all agents
  stopAllAgents() {
    console.log('🛑 Stopping all agents...');
    for (const agent of this.agents.values()) {
      agent.stop();
    }
  }

  // Start simulation with initial discovery task
  startSimulation(targetNetwork: string = '192.168.1.0/24') {
    console.log(`🎬 Starting cybersecurity simulation targeting ${targetNetwork}`);
    
    // Create initial discovery task
    const initialTask: Task = {
      id: `initial-${Date.now()}`,
      taskId: `initial-${Date.now()}`,
      agentType: 'DiscoveryAgent',
      taskName: 'port_scan',
      target: '192.168.1.10', // Start with a specific target
      details: { simulation_start: true },
      status: 'PENDING',
      priority: 1,
      createdAt: new Date()
    };

    this.addTask(initialTask);
    
    // Also start network monitoring
    const monitoringTask: Task = {
      id: `monitor-${Date.now()}`,
      taskId: `monitor-${Date.now()}`,
      agentType: 'NetworkMonitorAgent',
      taskName: 'intrusion_detection',
      details: { duration: 60, continuous: true },
      status: 'PENDING',
      priority: 2,
      createdAt: new Date()
    };

    this.addTask(monitoringTask);
    
    console.log('🚀 Simulation started with discovery and monitoring tasks');
  }
}
