// Base Agent Class - Common functionality for all swarm agents with Gemini integration
import { logger } from '../utils/logger.js';
export class BaseAgent {
    agentId;
    agentName;
    agentType;
    supportedTasks;
    status = "IDLE";
    geminiClient;
    onEventCallback;
    onChainOfThoughtCallback;
    onStatusChangeCallback;
    constructor(agentId, agentName, agentType, supportedTasks, geminiClient) {
        this.agentId = agentId;
        this.agentName = agentName;
        this.agentType = agentType;
        this.supportedTasks = supportedTasks;
        this.geminiClient = geminiClient;
        logger.debug(`Agent initialized: ${agentId} (${agentType})`);
    }
    // Register callbacks for real-time updates
    setEventCallback(callback) {
        this.onEventCallback = callback;
    }
    setChainOfThoughtCallback(callback) {
        this.onChainOfThoughtCallback = callback;
    }
    setStatusChangeCallback(callback) {
        this.onStatusChangeCallback = callback;
    }
    // Agent properties
    getAgentInfo() {
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
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
        logger.debug(`Agent ${this.agentId} status changed to ${status}`);
        this.onStatusChangeCallback?.(this.agentId, status);
    }
    // Chain of thought logging
    logChainOfThought(stepNumber, stepType, description, reasoning, data, confidence, taskId) {
        const thought = {
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
    emitEvent(eventType, payload, severity, target, taskId) {
        const event = {
            id: `${this.agentId}-${Date.now()}`,
            eventType,
            payload,
            severity: severity,
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
    // Utility method to simulate realistic delays
    async delay(minMs, maxMs) {
        const delay = Math.random() * (maxMs - minMs) + minMs;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    // Check if agent can handle a specific task
    canHandleTask(taskName) {
        return this.supportedTasks.includes(taskName);
    }
    // Agent lifecycle methods
    start() {
        this.setStatus("IDLE");
        logger.info(`🤖 Agent ${this.agentId} (${this.agentType}) started`);
    }
    stop() {
        this.setStatus("OFFLINE");
        logger.info(`🛑 Agent ${this.agentId} stopped`);
    }
    // Helper method to use Gemini for decision making
    async getGeminiDecision(prompt) {
        try {
            logger.debug(`[${this.agentId}] Requesting Gemini decision`);
            const response = await this.geminiClient.generateJSON(prompt);
            logger.debug(`[${this.agentId}] Gemini decision received`);
            return response;
        }
        catch (error) {
            logger.error(`[${this.agentId}] Error getting Gemini decision: ${error.message}`);
            throw error;
        }
    }
    // Helper method to use Gemini with file context
    async getGeminiDecisionWithFiles(prompt, fileUris) {
        try {
            logger.debug(`[${this.agentId}] Requesting Gemini decision with files`, {
                fileCount: fileUris.length,
            });
            const response = await this.geminiClient.generateWithFiles(prompt, fileUris);
            const parsed = JSON.parse(response.text);
            logger.debug(`[${this.agentId}] Gemini decision with files received`);
            return parsed;
        }
        catch (error) {
            logger.error(`[${this.agentId}] Error getting Gemini decision with files: ${error.message}`);
            throw error;
        }
    }
}
//# sourceMappingURL=base-agent.js.map