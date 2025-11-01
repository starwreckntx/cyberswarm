// Agent Manager - Manages agent lifecycle and task distribution
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
export class AgentManager {
    agents = new Map();
    taskQueue = [];
    activeTasks = new Map();
    onTaskCompleteCallback;
    constructor() {
        logger.info('Agent Manager initialized');
    }
    /**
     * Register an agent with the manager
     */
    registerAgent(agent) {
        const agentInfo = agent.getAgentInfo();
        this.agents.set(agentInfo.agentId, agent);
        logger.info(`Agent registered: ${agentInfo.agentId} (${agentInfo.agentType})`);
    }
    /**
     * Set callback for task completion
     */
    setTaskCompleteCallback(callback) {
        this.onTaskCompleteCallback = callback;
    }
    /**
     * Create a new task
     */
    createTask(agentType, taskName, target, details, priority = 5) {
        const task = {
            id: uuidv4(),
            taskId: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            agentType,
            taskName,
            target,
            details,
            status: "PENDING",
            priority,
            createdAt: new Date(),
        };
        logger.info(`Task created: ${task.taskId} (${agentType}/${taskName})`, {
            target,
            priority,
        });
        return task;
    }
    /**
     * Add task to queue
     */
    addTask(task) {
        this.taskQueue.push(task);
        logger.debug(`Task added to queue: ${task.taskId}`, {
            queueLength: this.taskQueue.length,
        });
        // Try to assign immediately
        this.assignTasks();
    }
    /**
     * Create and add task in one step
     */
    createAndAddTask(agentType, taskName, target, details, priority = 5) {
        const task = this.createTask(agentType, taskName, target, details, priority);
        this.addTask(task);
        return task;
    }
    /**
     * Assign pending tasks to available agents
     */
    async assignTasks() {
        // Sort queue by priority (higher priority first)
        this.taskQueue.sort((a, b) => b.priority - a.priority);
        for (let i = this.taskQueue.length - 1; i >= 0; i--) {
            const task = this.taskQueue[i];
            // Find available agent for this task
            const agent = this.findAvailableAgent(task.agentType, task.taskName);
            if (agent) {
                // Remove from queue
                this.taskQueue.splice(i, 1);
                // Assign task
                task.status = "ASSIGNED";
                task.assignedAt = new Date();
                task.agentId = agent.getAgentInfo().agentId;
                this.activeTasks.set(task.taskId, task);
                logger.info(`Task assigned: ${task.taskId} to ${agent.getAgentInfo().agentId}`);
                // Execute task asynchronously
                this.executeTask(agent, task);
            }
        }
    }
    /**
     * Find available agent for task
     */
    findAvailableAgent(agentType, taskName) {
        for (const agent of this.agents.values()) {
            const agentInfo = agent.getAgentInfo();
            if (agentInfo.agentType === agentType &&
                agentInfo.status === "IDLE" &&
                agent.canHandleTask(taskName)) {
                return agent;
            }
        }
        return null;
    }
    /**
     * Execute task with agent
     */
    async executeTask(agent, task) {
        try {
            task.status = "EXECUTING";
            logger.info(`Task executing: ${task.taskId}`);
            const event = await agent.executeTask(task);
            task.status = "COMPLETED";
            task.completedAt = new Date();
            logger.info(`Task completed: ${task.taskId}`, {
                duration: task.completedAt.getTime() - task.createdAt.getTime(),
            });
            this.activeTasks.delete(task.taskId);
            // Notify completion
            this.onTaskCompleteCallback?.(task, event);
            // Try to assign more tasks
            this.assignTasks();
        }
        catch (error) {
            task.status = "FAILED";
            task.completedAt = new Date();
            logger.error(`Task failed: ${task.taskId}`, { error: error.message });
            this.activeTasks.delete(task.taskId);
            // Try to assign more tasks even after failure
            this.assignTasks();
        }
    }
    /**
     * Get all registered agents
     */
    getAgents() {
        return Array.from(this.agents.values()).map(agent => agent.getAgentInfo());
    }
    /**
     * Get task queue
     */
    getTaskQueue() {
        return [...this.taskQueue];
    }
    /**
     * Get active tasks
     */
    getActiveTasks() {
        return Array.from(this.activeTasks.values());
    }
    /**
     * Get all tasks (queue + active)
     */
    getAllTasks() {
        return [...this.taskQueue, ...Array.from(this.activeTasks.values())];
    }
    /**
     * Start all agents
     */
    startAllAgents() {
        for (const agent of this.agents.values()) {
            agent.start();
        }
        logger.info('All agents started');
    }
    /**
     * Stop all agents
     */
    stopAllAgents() {
        for (const agent of this.agents.values()) {
            agent.stop();
        }
        logger.info('All agents stopped');
    }
    /**
     * Get agent statistics
     */
    getAgentStats() {
        const stats = {
            total: this.agents.size,
            idle: 0,
            busy: 0,
            error: 0,
            offline: 0,
        };
        for (const agent of this.agents.values()) {
            const status = agent.getStatus();
            switch (status) {
                case "IDLE":
                    stats.idle++;
                    break;
                case "BUSY":
                    stats.busy++;
                    break;
                case "ERROR":
                    stats.error++;
                    break;
                case "OFFLINE":
                    stats.offline++;
                    break;
            }
        }
        return stats;
    }
}
//# sourceMappingURL=agent-manager.js.map