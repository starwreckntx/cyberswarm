import { CyberEvent, ChainOfThought, Task, SimulationState } from '../types.js';
import { Config } from '../types.js';
export declare class CyberSecurityOrchestrator {
    private agentManager;
    private logicPipe;
    private geminiClient;
    private config;
    private isRunning;
    private startTime?;
    private endTime?;
    private targetNetwork?;
    private eventHistory;
    private chainOfThoughtHistory;
    private simulationTimeout?;
    constructor(config: Config);
    /**
     * Initialize all agents
     */
    private initializeAgents;
    /**
     * Setup orchestrator callbacks
     */
    private setupCallbacks;
    /**
     * Handle events from agents
     */
    private handleEvent;
    /**
     * Handle chain of thought from agents
     */
    private handleChainOfThought;
    /**
     * Handle task completion
     */
    private handleTaskComplete;
    /**
     * Handle tasks created by logic pipe
     */
    private handleLogicPipeTask;
    /**
     * Start simulation
     */
    startSimulation(targetNetwork?: string, duration?: number): Promise<void>;
    /**
     * Stop simulation
     */
    stopSimulation(): void;
    /**
     * Inject a custom task
     */
    injectTask(agentType: string, taskName: string, target?: string, details?: any, priority?: number): Task;
    /**
     * Get simulation state
     */
    getSimulationState(): SimulationState;
    /**
     * Get event history
     */
    getEventHistory(limit?: number): CyberEvent[];
    /**
     * Get chain of thought history
     */
    getChainOfThoughtHistory(limit?: number): ChainOfThought[];
    /**
     * Get statistics
     */
    getStats(): any;
    /**
     * Is simulation running
     */
    isSimulationRunning(): boolean;
}
//# sourceMappingURL=cybersecurity-orchestrator.d.ts.map