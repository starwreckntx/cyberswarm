// Network Monitor Agent - Intrusion detection with Gemini AI
import { BaseAgent } from './base-agent.js';
import { EventType } from '../types.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';
export class NetworkMonitorAgent extends BaseAgent {
    constructor(geminiClient) {
        super('network-monitor-01', 'Network Monitor Agent', 'NetworkMonitorAgent', ['monitor_traffic', 'detect_intrusion', 'analyze_logs'], geminiClient);
    }
    async executeTask(task) {
        this.setStatus("BUSY");
        try {
            this.logChainOfThought(1, "analysis", "Analyzing monitoring request", `Received ${task.taskName} task for ${task.target}. Using Gemini AI for intelligent threat detection.`, { taskName: task.taskName, target: task.target });
            switch (task.taskName) {
                case 'monitor_traffic':
                    return await this.monitorTraffic(task);
                case 'detect_intrusion':
                    return await this.detectIntrusion(task);
                case 'analyze_logs':
                    return await this.analyzeLogs(task);
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
    async monitorTraffic(task) {
        const target = task.target || '192.168.1.0/24';
        this.logChainOfThought(2, "analysis", "Network traffic monitoring", `Monitoring network traffic on ${target} for anomalies and suspicious patterns`, { target });
        await this.delay(2000, 4000);
        // Simulate traffic collection
        const trafficData = {
            connections: Math.floor(Math.random() * 1000) + 500,
            protocols: ['TCP', 'UDP', 'ICMP'],
            suspicious_patterns: Math.random() > 0.7,
        };
        this.logChainOfThought(3, "evaluation", "Traffic analysis", `Analyzed ${trafficData.connections} connections. Consulting Gemini AI for pattern recognition.`, { traffic: trafficData });
        // Use Gemini for traffic analysis
        const analysis = await this.getGeminiDecision(PROMPTS.NETWORK_MONITOR(target, trafficData));
        this.logChainOfThought(4, "evaluation", "Traffic monitoring complete", analysis.monitoring_summary, {
            intrusions: analysis.intrusions_detected.length,
            risk: analysis.traffic_analysis.risk_assessment,
        }, 0.85);
        if (analysis.intrusions_detected.length > 0) {
            const mostSevere = analysis.intrusions_detected[0];
            const intrusion = {
                source_ip: mostSevere.source_ip,
                destination_ip: mostSevere.destination_ip,
                signature_id: mostSevere.signature_id,
                description: mostSevere.description,
                attack_vector: mostSevere.attack_vector,
            };
            return this.emitEvent(EventType.INTRUSION_DETECTED, {
                ...intrusion,
                all_intrusions: analysis.intrusions_detected,
                traffic_analysis: analysis.traffic_analysis,
            }, mostSevere.severity, target, task.taskId);
        }
        return this.emitEvent(EventType.MONITORING_COMPLETE, {
            target,
            analysis,
            status: 'normal',
        }, 'Low', target, task.taskId);
    }
    async detectIntrusion(task) {
        const target = task.target || '192.168.1.0/24';
        const eventData = task.details || {};
        this.logChainOfThought(2, "analysis", "Intrusion detection", `Analyzing potential intrusion on ${target}`, { target, event: eventData });
        await this.delay(1500, 3000);
        // Use Gemini for intrusion analysis
        const detection = await this.getGeminiDecision(PROMPTS.NETWORK_MONITOR(target, eventData));
        this.logChainOfThought(3, "evaluation", "Intrusion detection complete", `Detected ${detection.intrusions_detected.length} potential intrusions`, { detections: detection.intrusions_detected }, 0.80);
        if (detection.intrusions_detected.length > 0) {
            const intrusion = detection.intrusions_detected[0];
            return this.emitEvent(EventType.INTRUSION_DETECTED, intrusion, intrusion.severity, target, task.taskId);
        }
        return this.emitEvent(EventType.MONITORING_COMPLETE, { status: 'no_intrusion', analysis: detection }, 'Low', target, task.taskId);
    }
    async analyzeLogs(task) {
        const target = task.target || 'system';
        this.logChainOfThought(2, "analysis", "Log analysis", `Analyzing system logs for ${target}`, { target });
        await this.delay(2000, 4000);
        // Use Gemini for log analysis
        const logAnalysis = await this.getGeminiDecision(`Analyze system logs for security events and anomalies. Return JSON with findings.`);
        this.logChainOfThought(3, "evaluation", "Log analysis complete", `Identified patterns and potential security events in logs`, { findings: logAnalysis }, 0.75);
        return this.emitEvent(EventType.DEFENSE_ANALYSIS_COMPLETE, logAnalysis, 'Medium', target, task.taskId);
    }
}
//# sourceMappingURL=network-monitor-agent.js.map