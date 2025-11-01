// Configuration management utility
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();
// Default configuration
const defaultConfig = {
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: 'gemini-1.5-pro',
        temperature: 0.7,
        maxOutputTokens: 8192,
    },
    simulation: {
        targetNetwork: process.env.DEFAULT_TARGET_NETWORK || '192.168.1.0/24',
        timeout: parseInt(process.env.SIMULATION_TIMEOUT || '300000'),
        maxConcurrentAgents: parseInt(process.env.MAX_CONCURRENT_AGENTS || '5'),
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        toFile: process.env.LOG_TO_FILE === 'true',
        dir: process.env.LOG_DIR || './output/logs',
    },
    output: {
        format: process.env.OUTPUT_FORMAT || 'json',
        reportFormat: process.env.REPORT_FORMAT || 'markdown',
    },
};
/**
 * Load configuration from file
 */
export function loadConfig(configPath) {
    let config = { ...defaultConfig };
    if (configPath && fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        const fileExt = path.extname(configPath);
        let fileConfig = {};
        if (fileExt === '.yaml' || fileExt === '.yml') {
            fileConfig = yaml.parse(fileContent);
        }
        else if (fileExt === '.json') {
            fileConfig = JSON.parse(fileContent);
        }
        // Merge configurations (file overrides defaults)
        config = mergeConfig(config, fileConfig);
    }
    // Validate required fields
    if (!config.gemini.apiKey) {
        throw new Error('GEMINI_API_KEY is required. Set it in .env file or config file.');
    }
    return config;
}
/**
 * Merge two configuration objects
 */
function mergeConfig(base, override) {
    return {
        gemini: { ...base.gemini, ...override.gemini },
        simulation: { ...base.simulation, ...override.simulation },
        logging: { ...base.logging, ...override.logging },
        output: { ...base.output, ...override.output },
    };
}
/**
 * Save configuration to file
 */
export function saveConfig(config, outputPath) {
    const fileExt = path.extname(outputPath);
    let content;
    if (fileExt === '.yaml' || fileExt === '.yml') {
        content = yaml.stringify(config);
    }
    else if (fileExt === '.json') {
        content = JSON.stringify(config, null, 2);
    }
    else {
        throw new Error('Unsupported config file format. Use .yaml, .yml, or .json');
    }
    fs.writeFileSync(outputPath, content, 'utf-8');
}
/**
 * Load scenario configuration
 */
export function loadScenario(scenarioName) {
    const scenarioPath = path.join(process.cwd(), 'config', 'scenarios', `${scenarioName}.yaml`);
    if (!fs.existsSync(scenarioPath)) {
        throw new Error(`Scenario not found: ${scenarioName}`);
    }
    const content = fs.readFileSync(scenarioPath, 'utf-8');
    return yaml.parse(content);
}
/**
 * List available scenarios
 */
export function listScenarios() {
    const scenariosDir = path.join(process.cwd(), 'config', 'scenarios');
    if (!fs.existsSync(scenariosDir)) {
        return [];
    }
    return fs
        .readdirSync(scenariosDir)
        .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map(file => path.basename(file, path.extname(file)));
}
//# sourceMappingURL=config.js.map