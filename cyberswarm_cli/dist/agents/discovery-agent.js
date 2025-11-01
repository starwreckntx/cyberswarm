// Discovery Agent - Network reconnaissance and port scanning with Gemini AI
import { BaseAgent } from './base-agent.js';
import { EventType } from '../types.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';
export class DiscoveryAgent extends BaseAgent {
    constructor(geminiClient) {
        super('discovery-01', 'Network Discovery Agent', 'DiscoveryAgent', ['network_scan', 'port_scan', 'service_enum'], geminiClient);
    }
    async executeTask(task) {
        this.setStatus("BUSY");
        try {
            this.logChainOfThought(1, "analysis", "Analyzing task requirements", `Received ${task.taskName} task for target ${task.target}. Preparing reconnaissance approach using Gemini AI for intelligent decision-making.`, { taskName: task.taskName, target: task.target });
            switch (task.taskName) {
                case 'network_scan':
                    return await this.networkScan(task);
                case 'port_scan':
                    return await this.portScan(task);
                case 'service_enum':
                    return await this.serviceEnum(task);
                default:
                    throw new Error(`Unsupported task: ${task.taskName}`);
            }
        }
        catch (error) {
            logger.error(`[${this.agentId}] Task execution failed: ${error.message}`);
            this.setStatus("ERROR");
            throw error;
        }
        finally {
            if (this.status !== "ERROR") {
                this.setStatus("IDLE");
            }
        }
    }
    async networkScan(task) {
        const target = task.target || '192.168.1.0/24';
        this.logChainOfThought(2, "decision", "Network scan strategy selection", `Consulting Gemini AI to determine optimal scanning strategy for ${target}`, { strategy: "gemini_powered", target });
        // Use Gemini to determine scanning strategy
        const scanStrategy = await this.getGeminiDecision(PROMPTS.DISCOVERY_NETWORK_SCAN(target));
        this.logChainOfThought(3, "decision", "Gemini AI recommended strategy", scanStrategy.reasoning, {
            strategy: scanStrategy.strategy,
            stealth_level: scanStrategy.stealth_level,
            estimated_time: scanStrategy.estimated_time,
        }, 0.95);
        // Simulate scan execution with realistic timing
        await this.delay(scanStrategy.estimated_time * 800, scanStrategy.estimated_time * 1200);
        // Select discovered host based on Gemini's recommendations
        const selectedHost = scanStrategy.discovered_hosts[0];
        this.logChainOfThought(4, "evaluation", "Network scan results analysis", `Scan completed. Discovered ${scanStrategy.discovered_hosts.length} live hosts. Selected ${selectedHost.ip} based on confidence score and indicators.`, {
            discoveredHosts: scanStrategy.discovered_hosts,
            selectedHost: selectedHost.ip,
            confidence: selectedHost.confidence,
        }, selectedHost.confidence);
        const reconData = {
            target_ip: selectedHost.ip,
            live_status: true,
            open_ports: [],
            scan_type: 'network_discovery',
        };
        return this.emitEvent(EventType.RECON_DATA, reconData, 'Medium', selectedHost.ip, task.taskId);
    }
    async portScan(task) {
        const target = task.target || '192.168.1.10';
        this.logChainOfThought(2, "decision", "Port scanning strategy", `Consulting Gemini AI for optimal port scanning approach on ${target}`, { target });
        // Use Gemini to determine port scanning strategy
        const scanResults = await this.getGeminiDecision(PROMPTS.DISCOVERY_PORT_SCAN(target, task.details));
        this.logChainOfThought(3, "decision", "Gemini AI scanning strategy", scanResults.reasoning, {
            technique: scanResults.technique,
            port_range: scanResults.port_range,
        }, 0.92);
        // Simulate port scan
        await this.delay(2000, 4000);
        this.logChainOfThought(4, "action", "Executing port scan", `Scanning ${scanResults.scan_results.length} ports using ${scanResults.technique}`, { scan_results: scanResults.scan_results });
        await this.delay(3000, 5000);
        this.logChainOfThought(5, "evaluation", "Port scan results", `Discovered ${scanResults.scan_results.filter((r) => r.state === 'open').length} open ports. Security assessment: ${scanResults.security_assessment.risk_level}`, {
            open_ports: scanResults.scan_results.filter((r) => r.state === 'open'),
            risk_level: scanResults.security_assessment.risk_level,
        }, 0.88);
        const openPorts = scanResults.scan_results
            .filter((r) => r.state === 'open')
            .map((r) => r.port);
        const services = scanResults.scan_results
            .filter((r) => r.state === 'open')
            .reduce((acc, r) => {
            acc[r.port] = r.service;
            return acc;
        }, {});
        const reconData = {
            target_ip: target,
            live_status: true,
            open_ports: openPorts,
            scan_type: 'port_scan',
            services,
        };
        return this.emitEvent(EventType.RECON_DATA, reconData, scanResults.security_assessment.risk_level === 'critical' ? 'Critical' :
            scanResults.security_assessment.risk_level === 'high' ? 'High' : 'Medium', target, task.taskId);
    }
    async serviceEnum(task) {
        const target = task.target || '192.168.1.10';
        const ports = task.details?.ports || [22, 80, 443];
        this.logChainOfThought(2, "analysis", "Service enumeration", `Enumerating services on ${target} for ports: ${ports.join(', ')}`, { target, ports });
        // Use Gemini to analyze services
        const context = {
            target,
            ports,
            ...task.details,
        };
        const serviceAnalysis = await this.getGeminiDecision(PROMPTS.DISCOVERY_PORT_SCAN(target, context));
        await this.delay(2000, 4000);
        this.logChainOfThought(3, "evaluation", "Service enumeration complete", `Identified services and versions. ${serviceAnalysis.scan_results.length} services analyzed.`, { services: serviceAnalysis.scan_results }, 0.85);
        const services = serviceAnalysis.scan_results.reduce((acc, r) => {
            acc[r.port] = `${r.service} ${r.version || ''}`.trim();
            return acc;
        }, {});
        const reconData = {
            target_ip: target,
            live_status: true,
            open_ports: ports,
            scan_type: 'service_enumeration',
            services,
        };
        return this.emitEvent(EventType.SCAN_COMPLETE, reconData, 'Medium', target, task.taskId);
    }
}
//# sourceMappingURL=discovery-agent.js.map