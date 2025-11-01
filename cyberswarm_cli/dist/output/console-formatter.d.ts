import { Agent, CyberEvent, Task, ChainOfThought } from '../types.js';
/**
 * Format banner
 */
export declare function formatBanner(text: string): string;
/**
 * Format section header
 */
export declare function formatSectionHeader(text: string): string;
/**
 * Format success message
 */
export declare function formatSuccess(text: string): string;
/**
 * Format error message
 */
export declare function formatError(text: string): string;
/**
 * Format warning message
 */
export declare function formatWarning(text: string): string;
/**
 * Format info message
 */
export declare function formatInfo(text: string): string;
/**
 * Format agent status
 */
export declare function formatAgentStatus(agent: Agent): string;
/**
 * Format agents table
 */
export declare function formatAgentsTable(agents: Agent[]): string;
/**
 * Format events table
 */
export declare function formatEventsTable(events: CyberEvent[], limit?: number): string;
/**
 * Format tasks table
 */
export declare function formatTasksTable(tasks: Task[]): string;
/**
 * Format chain of thought
 */
export declare function formatChainOfThought(thoughts: ChainOfThought[], limit?: number): string;
/**
 * Format statistics
 */
export declare function formatStats(stats: any): string;
/**
 * Format progress indicator
 */
export declare function formatProgress(message: string, done?: boolean): string;
//# sourceMappingURL=console-formatter.d.ts.map