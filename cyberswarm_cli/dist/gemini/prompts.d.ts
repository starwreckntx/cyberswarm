export declare const PROMPTS: {
    DISCOVERY_NETWORK_SCAN: (target: string) => string;
    DISCOVERY_PORT_SCAN: (target: string, details?: any) => string;
    VULN_SCANNER: (target: string, services: any) => string;
    PATCH_MANAGEMENT: (vulnerability: any, target: string) => string;
    NETWORK_MONITOR: (target: string, traffic_data?: any) => string;
    STRATEGY_ADAPTATION: (context: any) => string;
    ORCHESTRATOR_COORDINATION: (state: any) => string;
};
/**
 * Format a prompt with context
 */
export declare function formatPrompt(template: string, context: Record<string, any>): string;
//# sourceMappingURL=prompts.d.ts.map