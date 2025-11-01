import { Agent, Task, CyberEvent } from '../types.js';
import { BaseAgent } from '../agents/base-agent.js';
export declare class AgentManager {
    private agents;
    private taskQueue;
    private activeTasks;
    private onTaskCompleteCallback?;
    constructor();
    /**
     * Register an agent with the manager
     */
    registerAgent(agent: BaseAgent): void;
    /**
     * Set callback for task completion
     */
    setTaskCompleteCallback(callback: (task: Task, event: CyberEvent) => void): void;
    /**
     * Create a new task
     */
    createTask(agentType: string, taskName: string, target?: string, details?: any, priority?: number): Task;
    /**
     * Add task to queue
     */
    addTask(task: Task): void;
    /**
     * Create and add task in one step
     */
    createAndAddTask(agentType: string, taskName: string, target?: string, details?: any, priority?: number): Task;
    /**
     * Assign pending tasks to available agents
     */
    private assignTasks;
    /**
     * Find available agent for task
     */
    private findAvailableAgent;
    /**
     * Execute task with agent
     */
    private executeTask;
    /**
     * Get all registered agents
     */
    getAgents(): Agent[];
    /**
     * Get task queue
     */
    getTaskQueue(): Task[];
    /**
     * Get active tasks
     */
    getActiveTasks(): Task[];
    /**
     * Get all tasks (queue + active)
     */
    getAllTasks(): Task[];
    /**
     * Start all agents
     */
    startAllAgents(): void;
    /**
     * Stop all agents
     */
    stopAllAgents(): void;
    /**
     * Get agent statistics
     */
    getAgentStats(): any;
}
//# sourceMappingURL=agent-manager.d.ts.map