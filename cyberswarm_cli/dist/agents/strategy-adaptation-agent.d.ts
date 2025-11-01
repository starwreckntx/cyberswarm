import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
export declare class StrategyAdaptationAgent extends BaseAgent {
    constructor(geminiClient: GeminiClient);
    executeTask(task: Task): Promise<CyberEvent>;
    private adaptStrategy;
    private reevaluateTargets;
    private changeTactics;
}
//# sourceMappingURL=strategy-adaptation-agent.d.ts.map