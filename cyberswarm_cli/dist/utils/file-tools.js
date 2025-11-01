// File tools utility for reading/writing CVE databases, reports, etc.
import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';
/**
 * Load CVE database from file
 */
export function loadCVEDatabase(filePath) {
    const dbPath = filePath || path.join(process.cwd(), 'knowledge', 'cve-database.json');
    try {
        if (!fs.existsSync(dbPath)) {
            logger.warn(`CVE database not found at ${dbPath}, returning empty array`);
            return [];
        }
        const content = fs.readFileSync(dbPath, 'utf-8');
        const data = JSON.parse(content);
        logger.info(`Loaded CVE database with ${data.length} entries`);
        return data;
    }
    catch (error) {
        logger.error(`Error loading CVE database: ${error.message}`);
        return [];
    }
}
/**
 * Save CVE database to file
 */
export function saveCVEDatabase(data, filePath) {
    const dbPath = filePath || path.join(process.cwd(), 'knowledge', 'cve-database.json');
    try {
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
        logger.info(`Saved CVE database with ${data.length} entries to ${dbPath}`);
    }
    catch (error) {
        logger.error(`Error saving CVE database: ${error.message}`);
        throw error;
    }
}
/**
 * Load threat intelligence data
 */
export function loadThreatIntelligence(filePath) {
    const threatPath = filePath || path.join(process.cwd(), 'knowledge', 'threat-intelligence.json');
    try {
        if (!fs.existsSync(threatPath)) {
            logger.warn(`Threat intelligence not found at ${threatPath}`);
            return { indicators: [], campaigns: [], actors: [] };
        }
        const content = fs.readFileSync(threatPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        logger.error(`Error loading threat intelligence: ${error.message}`);
        return { indicators: [], campaigns: [], actors: [] };
    }
}
/**
 * Save simulation results to file
 */
export function saveSimulationResults(events, chainOfThoughts, metadata, outputPath) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = outputPath || path.join(process.cwd(), 'output', 'exports', `simulation-${timestamp}.json`);
    try {
        const dir = path.dirname(filename);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const results = {
            metadata: {
                ...metadata,
                timestamp,
                exportedAt: new Date().toISOString(),
            },
            events,
            chainOfThoughts,
            summary: {
                totalEvents: events.length,
                totalThoughts: chainOfThoughts.length,
                eventsByType: countByField(events, 'eventType'),
                eventsBySeverity: countByField(events, 'severity'),
            },
        };
        fs.writeFileSync(filename, JSON.stringify(results, null, 2), 'utf-8');
        logger.info(`Saved simulation results to ${filename}`);
        return filename;
    }
    catch (error) {
        logger.error(`Error saving simulation results: ${error.message}`);
        throw error;
    }
}
/**
 * Load simulation results from file
 */
export function loadSimulationResults(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`Simulation results not found: ${filePath}`);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        logger.error(`Error loading simulation results: ${error.message}`);
        throw error;
    }
}
/**
 * Generate markdown report
 */
export function generateMarkdownReport(events, chainOfThoughts, metadata) {
    const timestamp = new Date().toISOString();
    let report = `# CyberSwarm Simulation Report\n\n`;
    report += `**Generated:** ${timestamp}\n\n`;
    report += `**Target:** ${metadata.targetNetwork || 'N/A'}\n`;
    report += `**Duration:** ${metadata.duration || 'N/A'}\n\n`;
    report += `## Executive Summary\n\n`;
    report += `- Total Events: ${events.length}\n`;
    report += `- Total Chain of Thought Steps: ${chainOfThoughts.length}\n`;
    report += `- Critical Events: ${events.filter(e => e.severity === 'Critical').length}\n`;
    report += `- High Severity Events: ${events.filter(e => e.severity === 'High').length}\n\n`;
    report += `## Events by Type\n\n`;
    const eventsByType = countByField(events, 'eventType');
    for (const [type, count] of Object.entries(eventsByType)) {
        report += `- ${type}: ${count}\n`;
    }
    report += `\n`;
    report += `## Critical Findings\n\n`;
    const criticalEvents = events.filter(e => e.severity === 'Critical' || e.severity === 'High');
    if (criticalEvents.length === 0) {
        report += `No critical findings.\n\n`;
    }
    else {
        for (const event of criticalEvents.slice(0, 10)) {
            report += `### ${event.eventType}\n`;
            report += `- **Severity:** ${event.severity}\n`;
            report += `- **Target:** ${event.target || 'N/A'}\n`;
            report += `- **Timestamp:** ${event.timestamp}\n`;
            report += `- **Details:** ${JSON.stringify(event.payload, null, 2)}\n\n`;
        }
    }
    report += `## Agent Reasoning\n\n`;
    const thoughtsByAgent = groupBy(chainOfThoughts, 'agentId');
    for (const [agentId, thoughts] of Object.entries(thoughtsByAgent)) {
        report += `### ${agentId}\n\n`;
        const agentThoughts = thoughts;
        for (const thought of agentThoughts.slice(0, 5)) {
            report += `**Step ${thought.stepNumber} (${thought.stepType}):** ${thought.description}\n`;
            report += `> ${thought.reasoning}\n\n`;
        }
    }
    return report;
}
/**
 * Save markdown report
 */
export function saveMarkdownReport(report, outputPath) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = outputPath || path.join(process.cwd(), 'output', 'reports', `report-${timestamp}.md`);
    try {
        const dir = path.dirname(filename);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filename, report, 'utf-8');
        logger.info(`Saved markdown report to ${filename}`);
        return filename;
    }
    catch (error) {
        logger.error(`Error saving markdown report: ${error.message}`);
        throw error;
    }
}
// Helper functions
function countByField(items, field) {
    const counts = {};
    for (const item of items) {
        const value = item[field] || 'Unknown';
        counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
}
function groupBy(items, field) {
    const groups = {};
    for (const item of items) {
        const value = String(item[field] || 'Unknown');
        if (!groups[value]) {
            groups[value] = [];
        }
        groups[value].push(item);
    }
    return groups;
}
//# sourceMappingURL=file-tools.js.map