import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
export declare class DiscoveryAgent extends BaseAgent {
    constructor(geminiClient: GeminiClient);
    executeTask(task: Task): Promise<CyberEvent>;
    private networkScan;
    private portScan;
    private serviceEnum;
}
//# sourceMappingURL=discovery-agent.d.ts.map