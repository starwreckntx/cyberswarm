import { CyberEvent, Task, LogicPipeExecution } from '../types.js';
export declare class LogicPipe {
    private onTaskCreatedCallback?;
    private executionHistory;
    constructor();
    /**
     * Set callback for task creation
     */
    setTaskCreatedCallback(callback: (task: Task) => void): void;
    /**
     * Process an event through the logic pipe
     */
    processEvent(event: CyberEvent): Promise<Task[]>;
    /**
     * Rule 1a: Red Discovers → Blue Scans for Vulnerabilities
     */
    private applyRedDiscoverBlueReacts;
    /**
     * Rule 1b: Vulnerability Found → Blue Remediates
     */
    private applyVulnFoundBlueRemediates;
    /**
     * Rule 2: Blue Detects → Red Adapts
     */
    private applyBlueDetectsRedAdapts;
    /**
     * Rule 3: Blue Defends → Red Reevaluates
     */
    private applyBlueDefendsRedReevaluates;
    /**
     * Determine which rule applies to an event type
     */
    private determineRule;
    /**
     * Get execution history
     */
    getExecutionHistory(): LogicPipeExecution[];
    /**
     * Get statistics
     */
    getStats(): any;
}
//# sourceMappingURL=logic-pipe.d.ts.map