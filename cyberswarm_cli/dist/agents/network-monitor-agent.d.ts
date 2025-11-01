import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
export declare class NetworkMonitorAgent extends BaseAgent {
    constructor(geminiClient: GeminiClient);
    executeTask(task: Task): Promise<CyberEvent>;
    private monitorTraffic;
    private detectIntrusion;
    private analyzeLogs;
}
//# sourceMappingURL=network-monitor-agent.d.ts.map