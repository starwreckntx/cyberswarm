import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
export declare class PatchManagementAgent extends BaseAgent {
    constructor(geminiClient: GeminiClient);
    executeTask(task: Task): Promise<CyberEvent>;
    private remediateVulnerability;
    private applyPatch;
    private configHarden;
}
//# sourceMappingURL=patch-management-agent.d.ts.map