import { CyberEvent, ChainOfThought } from '../types.js';
/**
 * Load CVE database from file
 */
export declare function loadCVEDatabase(filePath?: string): any[];
/**
 * Save CVE database to file
 */
export declare function saveCVEDatabase(data: any[], filePath?: string): void;
/**
 * Load threat intelligence data
 */
export declare function loadThreatIntelligence(filePath?: string): any;
/**
 * Save simulation results to file
 */
export declare function saveSimulationResults(events: CyberEvent[], chainOfThoughts: ChainOfThought[], metadata: any, outputPath?: string): string;
/**
 * Load simulation results from file
 */
export declare function loadSimulationResults(filePath: string): any;
/**
 * Generate markdown report
 */
export declare function generateMarkdownReport(events: CyberEvent[], chainOfThoughts: ChainOfThought[], metadata: any): string;
/**
 * Save markdown report
 */
export declare function saveMarkdownReport(report: string, outputPath?: string): string;
//# sourceMappingURL=file-tools.d.ts.map