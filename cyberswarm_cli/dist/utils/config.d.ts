import { Config } from '../types.js';
/**
 * Load configuration from file
 */
export declare function loadConfig(configPath?: string): Config;
/**
 * Save configuration to file
 */
export declare function saveConfig(config: Config, outputPath: string): void;
/**
 * Load scenario configuration
 */
export declare function loadScenario(scenarioName: string): any;
/**
 * List available scenarios
 */
export declare function listScenarios(): string[];
//# sourceMappingURL=config.d.ts.map