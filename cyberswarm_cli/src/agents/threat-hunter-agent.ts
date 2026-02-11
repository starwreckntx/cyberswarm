
// Threat Hunter Agent - Proactive threat hunting with Gemini AI (Purple Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, ThreatHunt, ThreatHuntFinding, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class ThreatHunterAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'threat-hunter-01',
      'Threat Hunter Agent',
      'ThreatHunterAgent',
      ['hunt_ioc', 'hunt_ttp', 'hunt_anomaly', 'validate_detection'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing threat hunt request",
        `Received ${task.taskName} task for ${task.target || 'network'}. Using Gemini AI for hypothesis-driven threat hunting.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'hunt_ioc':
          return await this.huntIOC(task);
        case 'hunt_ttp':
          return await this.huntTTP(task);
        case 'hunt_anomaly':
          return await this.huntAnomaly(task);
        case 'validate_detection':
          return await this.validateDetection(task);
        default:
          throw new Error(`Unsupported task: ${task.taskName}`);
      }
    } catch (error: any) {
      logger.error(`[${this.agentId}] Task execution failed: ${error.message}`);
      this.setStatus("ERROR");
      throw error;
    } finally {
      if (this.status !== "ERROR") {
        this.setStatus("IDLE");
      }
    }
  }

  private async huntIOC(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "IOC-based threat hunt",
      `Formulating hypothesis for IOC-based hunting on ${target}. Correlating known indicators of compromise.`,
      { target, context }
    );

    await this.delay(2000, 4000);

    const huntResult = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_HUNT_IOC(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Hunt hypothesis evaluation",
      huntResult.hypothesis,
      {
        indicators_checked: huntResult.indicators_checked,
        data_sources: huntResult.data_sources,
      },
      huntResult.confidence
    );

    await this.delay(3000, 5000);

    const findings: ThreatHuntFinding[] = (huntResult.findings || []).map((f: any, i: number) => ({
      finding_id: `finding-${Date.now()}-${i}`,
      type: f.type || 'IOC_MATCH',
      description: f.description,
      severity: f.severity,
      confidence: f.confidence,
      evidence: f.evidence || [],
      mitre_technique_id: f.mitre_technique_id,
    }));

    this.logChainOfThought(
      4,
      "evaluation",
      "IOC hunt complete",
      `Hunt completed. Found ${findings.length} findings. ${findings.filter(f => f.severity === 'Critical' || f.severity === 'High').length} require immediate attention.`,
      { findings_count: findings.length, critical_findings: findings.filter(f => f.severity === 'Critical').length },
      huntResult.confidence
    );

    const threatHunt: ThreatHunt = {
      hunt_id: `hunt-${Date.now()}`,
      hypothesis: huntResult.hypothesis,
      indicators: huntResult.indicators_checked || [],
      data_sources: huntResult.data_sources || [],
      findings,
      mitre_techniques: huntResult.mitre_techniques || [],
      status: findings.some(f => f.severity === 'Critical') ? 'ESCALATED' : 'COMPLETED',
    };

    if (findings.length > 0) {
      return this.emitEvent(
        EventType.THREAT_HUNT_FINDING,
        threatHunt,
        findings[0].severity,
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.THREAT_HUNT_COMPLETE,
      threatHunt,
      'Low',
      target,
      task.taskId
    );
  }

  private async huntTTP(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "TTP-based threat hunt",
      `Hunting for specific tactics, techniques, and procedures (TTPs) across ${target}. Mapping to MITRE ATT&CK framework.`,
      { target, context }
    );

    await this.delay(2500, 4500);

    const huntResult = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_HUNT_TTP(target, context)
    );

    this.logChainOfThought(
      3,
      "decision",
      "TTP pattern matching",
      `Evaluating ${huntResult.techniques_analyzed?.length || 0} MITRE ATT&CK techniques against observed activity.`,
      {
        techniques: huntResult.techniques_analyzed,
        kill_chain_phases: huntResult.kill_chain_phases,
      },
      huntResult.confidence
    );

    await this.delay(2000, 4000);

    const findings: ThreatHuntFinding[] = (huntResult.findings || []).map((f: any, i: number) => ({
      finding_id: `ttp-finding-${Date.now()}-${i}`,
      type: f.type || 'TTP_DETECTED',
      description: f.description,
      severity: f.severity,
      confidence: f.confidence,
      evidence: f.evidence || [],
      mitre_technique_id: f.mitre_technique_id,
    }));

    this.logChainOfThought(
      4,
      "evaluation",
      "TTP hunt complete",
      `TTP analysis complete. Mapped ${findings.length} findings to MITRE ATT&CK. ${huntResult.attack_chain_detected ? 'Attack chain detected.' : 'No complete attack chain identified.'}`,
      { findings, attack_chain: huntResult.attack_chain_detected },
      huntResult.confidence
    );

    const threatHunt: ThreatHunt = {
      hunt_id: `hunt-ttp-${Date.now()}`,
      hypothesis: huntResult.hypothesis,
      indicators: huntResult.indicators || [],
      data_sources: huntResult.data_sources || [],
      findings,
      mitre_techniques: huntResult.techniques_analyzed?.map((t: any) => t.technique_id) || [],
      status: huntResult.attack_chain_detected ? 'ESCALATED' : 'COMPLETED',
    };

    if (findings.length > 0 && huntResult.attack_chain_detected) {
      return this.emitEvent(
        EventType.THREAT_HUNT_FINDING,
        threatHunt,
        'Critical',
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      findings.length > 0 ? EventType.THREAT_HUNT_FINDING : EventType.THREAT_HUNT_COMPLETE,
      threatHunt,
      findings.length > 0 ? findings[0].severity : 'Low',
      target,
      task.taskId
    );
  }

  private async huntAnomaly(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Anomaly-based threat hunt",
      `Establishing behavioral baselines and hunting for deviations on ${target}.`,
      { target, context }
    );

    await this.delay(3000, 5000);

    const huntResult = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_HUNT_ANOMALY(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Baseline deviation analysis",
      `Analyzed behavioral patterns. Detected ${huntResult.anomalies?.length || 0} deviations from established baselines.`,
      {
        baselines: huntResult.baselines,
        anomalies: huntResult.anomalies,
      },
      huntResult.confidence
    );

    const findings: ThreatHuntFinding[] = (huntResult.anomalies || []).map((a: any, i: number) => ({
      finding_id: `anomaly-${Date.now()}-${i}`,
      type: 'BEHAVIORAL_ANOMALY' as const,
      description: a.description,
      severity: a.severity,
      confidence: a.confidence,
      evidence: a.evidence || [],
      mitre_technique_id: a.mitre_technique_id,
    }));

    const threatHunt: ThreatHunt = {
      hunt_id: `hunt-anomaly-${Date.now()}`,
      hypothesis: huntResult.hypothesis,
      indicators: [],
      data_sources: huntResult.data_sources || [],
      findings,
      mitre_techniques: huntResult.mitre_techniques || [],
      status: findings.some(f => f.severity === 'Critical') ? 'ESCALATED' : 'COMPLETED',
    };

    return this.emitEvent(
      findings.length > 0 ? EventType.THREAT_HUNT_FINDING : EventType.THREAT_HUNT_COMPLETE,
      threatHunt,
      findings.length > 0 ? findings[0].severity : 'Low',
      target,
      task.taskId
    );
  }

  private async validateDetection(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Detection validation",
      `Validating detection capabilities against known attack patterns on ${target}.`,
      { target, context }
    );

    await this.delay(2000, 4000);

    const validation = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_HUNT_VALIDATE(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Detection coverage assessment",
      `Tested ${validation.techniques_tested?.length || 0} attack techniques. Detection rate: ${validation.detection_rate || 0}%.`,
      {
        techniques_tested: validation.techniques_tested,
        detection_rate: validation.detection_rate,
        gaps: validation.detection_gaps,
      },
      validation.confidence
    );

    if (validation.detection_gaps?.length > 0) {
      return this.emitEvent(
        EventType.DETECTION_GAP_FOUND,
        {
          target,
          detection_rate: validation.detection_rate,
          gaps: validation.detection_gaps,
          techniques_tested: validation.techniques_tested,
          recommendations: validation.recommendations,
        },
        validation.detection_rate < 50 ? 'Critical' : validation.detection_rate < 75 ? 'High' : 'Medium',
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.THREAT_HUNT_COMPLETE,
      {
        target,
        validation_result: validation,
        status: 'validated',
      },
      'Low',
      target,
      task.taskId
    );
  }
}
