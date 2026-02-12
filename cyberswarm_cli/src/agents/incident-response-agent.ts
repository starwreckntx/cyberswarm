
// Incident Response Agent - Automated incident handling with Gemini AI (Purple Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, IncidentResponse, IncidentAction, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class IncidentResponseAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'incident-response-01',
      'Incident Response Agent',
      'IncidentResponseAgent',
      ['triage_incident', 'contain_incident', 'eradicate_threat', 'recover_systems'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing incident response request",
        `Received ${task.taskName} task. Using Gemini AI for intelligent incident handling and coordination.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'triage_incident':
          return await this.triageIncident(task);
        case 'contain_incident':
          return await this.containIncident(task);
        case 'eradicate_threat':
          return await this.eradicateThreat(task);
        case 'recover_systems':
          return await this.recoverSystems(task);
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

  private async triageIncident(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const alertData = task.details || {};

    const theHiveTool = this.getTool('thehive');
    const cortexTool = this.getTool('cortex');

    this.logChainOfThought(
      2,
      "analysis",
      "Incident triage",
      `Performing initial triage on ${target}. Creating case in ${theHiveTool?.name || 'TheHive'} and running ${cortexTool?.name || 'Cortex'} analyzers for IOC enrichment.`,
      { target, alertData, tools: ['thehive', 'cortex', 'velociraptor'] }
    );

    if (theHiveTool) this.logToolUsage('thehive', 'thehive-api create-case --severity high', target, {}, task.taskId);
    if (cortexTool) this.logToolUsage('cortex', 'cortex-analyzer --run VirusTotal,AbuseIPDB', target, {}, task.taskId);

    await this.delay(1500, 3000);

    const triage = await this.getGeminiDecision<any>(
      PROMPTS.INCIDENT_TRIAGE(target, alertData)
    );

    this.logChainOfThought(
      3,
      "decision",
      "Incident classification",
      `Classified as ${triage.classification}. Severity: ${triage.severity}. Scope: ${triage.affected_assets?.length || 0} assets affected.`,
      {
        classification: triage.classification,
        severity: triage.severity,
        affected_assets: triage.affected_assets,
        attack_vector: triage.attack_vector,
      },
      triage.confidence
    );

    await this.delay(1000, 2000);

    this.logChainOfThought(
      4,
      "decision",
      "Response prioritization",
      `Determining response priority and escalation path. Immediate actions: ${triage.immediate_actions?.join(', ') || 'none'}`,
      {
        priority: triage.priority,
        escalation_required: triage.escalation_required,
        immediate_actions: triage.immediate_actions,
      },
      triage.confidence
    );

    const incident: IncidentResponse = {
      incident_id: `incident-${Date.now()}`,
      classification: triage.classification,
      phase: 'TRIAGE',
      actions_taken: [{
        action: 'Initial triage completed',
        target,
        result: 'SUCCESS',
        timestamp: new Date(),
      }],
      affected_assets: triage.affected_assets || [target],
      timeline: [
        {
          timestamp: new Date(),
          event: 'Incident triaged',
          source: this.agentId,
          details: triage.summary,
        },
      ],
      status: 'OPEN',
    };

    if (triage.classification === 'TRUE_POSITIVE') {
      return this.emitEvent(
        EventType.INCIDENT_DETECTED,
        {
          ...incident,
          triage_details: triage,
          recommended_actions: triage.recommended_actions,
        },
        triage.severity,
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.INCIDENT_DETECTED,
      {
        ...incident,
        triage_details: triage,
        note: `Classified as ${triage.classification} - monitoring`,
      },
      'Low',
      target,
      task.taskId
    );
  }

  private async containIncident(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const incidentData = task.details || {};

    const grrTool = this.getTool('grr');
    const velociraptor = this.getTool('velociraptor');

    this.logChainOfThought(
      2,
      "decision",
      "Containment strategy",
      `Developing containment strategy for ${target}. Deploying ${grrTool?.name || 'GRR'} for remote isolation and ${velociraptor?.name || 'Velociraptor'} for endpoint containment. Consulting Gemini AI for optimal approach.`,
      { target, incidentData, tools: ['grr', 'velociraptor', 'wireshark'] }
    );

    if (grrTool) this.logToolUsage('grr', 'grr-client --isolate-endpoint', target, {}, task.taskId);

    await this.delay(1500, 3000);

    const containment = await this.getGeminiDecision<any>(
      PROMPTS.INCIDENT_CONTAIN(target, incidentData)
    );

    this.logChainOfThought(
      3,
      "decision",
      "Containment plan",
      containment.reasoning,
      {
        strategy: containment.containment_strategy,
        isolation_scope: containment.isolation_scope,
      },
      containment.confidence
    );

    const actions: IncidentAction[] = [];
    for (let i = 0; i < (containment.containment_steps || []).length; i++) {
      const step = containment.containment_steps[i];

      this.logChainOfThought(
        4 + i,
        "action",
        `Containment step ${i + 1}: ${step.action}`,
        `Executing: ${step.command || step.action}. Target: ${step.target || target}`,
        { step }
      );

      await this.delay(1000, 2000);

      actions.push({
        action: step.action,
        target: step.target || target,
        result: 'SUCCESS',
        timestamp: new Date(),
      });
    }

    const stepCount = (containment.containment_steps || []).length;

    this.logChainOfThought(
      4 + stepCount,
      "evaluation",
      "Containment verification",
      `Verifying containment effectiveness. ${containment.containment_verified ? 'Containment confirmed.' : 'Verification pending.'}`,
      { verified: containment.containment_verified, actions_taken: actions.length },
      containment.confidence
    );

    return this.emitEvent(
      EventType.INCIDENT_CONTAINED,
      {
        incident_id: incidentData.incident_id || `incident-${Date.now()}`,
        containment_strategy: containment.containment_strategy,
        actions_taken: actions,
        containment_verified: containment.containment_verified,
        isolation_scope: containment.isolation_scope,
        next_steps: containment.next_steps,
      },
      'High',
      target,
      task.taskId
    );
  }

  private async eradicateThreat(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const incidentData = task.details || {};

    const volatilityTool = this.getTool('volatility');
    const velociraptor = this.getTool('velociraptor');

    this.logChainOfThought(
      2,
      "analysis",
      "Threat eradication planning",
      `Planning eradication for ${target}. Using ${volatilityTool?.name || 'Volatility'} for memory forensics to identify injected code, ${velociraptor?.name || 'Velociraptor'} for artifact collection and removal.`,
      { target, incidentData, tools: ['volatility', 'velociraptor', 'yara'] }
    );

    if (volatilityTool) this.logToolUsage('volatility', 'vol3 -f memdump.raw windows.malfind', target, {}, task.taskId);

    await this.delay(2000, 4000);

    const eradication = await this.getGeminiDecision<any>(
      PROMPTS.INCIDENT_ERADICATE(target, incidentData)
    );

    this.logChainOfThought(
      3,
      "decision",
      "Eradication plan",
      eradication.reasoning,
      {
        artifacts_found: eradication.artifacts,
        persistence_mechanisms: eradication.persistence_mechanisms,
        eradication_steps: eradication.eradication_steps?.length,
      },
      eradication.confidence
    );

    for (let i = 0; i < (eradication.eradication_steps || []).length; i++) {
      const step = eradication.eradication_steps[i];

      this.logChainOfThought(
        4 + i,
        "action",
        `Eradication step ${i + 1}: ${step.action}`,
        `Removing threat artifact: ${step.description || step.action}`,
        { step }
      );

      await this.delay(1500, 2500);
    }

    const stepCount = (eradication.eradication_steps || []).length;

    this.logChainOfThought(
      4 + stepCount,
      "evaluation",
      "Eradication verification",
      `Verifying complete threat removal. Clean scan: ${eradication.clean_scan ? 'PASS' : 'PENDING'}`,
      { clean_scan: eradication.clean_scan, residual_risk: eradication.residual_risk },
      eradication.confidence
    );

    return this.emitEvent(
      EventType.INCIDENT_ERADICATED,
      {
        incident_id: incidentData.incident_id || `incident-${Date.now()}`,
        artifacts_removed: eradication.artifacts,
        persistence_cleared: eradication.persistence_mechanisms,
        clean_scan: eradication.clean_scan,
        residual_risk: eradication.residual_risk,
        eradication_details: eradication,
      },
      'High',
      target,
      task.taskId
    );
  }

  private async recoverSystems(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const incidentData = task.details || {};

    const autopsyTool = this.getTool('autopsy');

    this.logChainOfThought(
      2,
      "analysis",
      "Recovery planning",
      `Planning system recovery for ${target}. Using ${autopsyTool?.name || 'Autopsy'} for integrity validation and forensic evidence preservation before restoring services.`,
      { target, incidentData, tools: ['autopsy', 'velociraptor', 'grr'] }
    );

    if (autopsyTool) this.logToolUsage('autopsy', 'autopsy --verify-integrity --baseline', target, {}, task.taskId);

    await this.delay(2000, 3000);

    const recovery = await this.getGeminiDecision<any>(
      PROMPTS.INCIDENT_RECOVER(target, incidentData)
    );

    this.logChainOfThought(
      3,
      "decision",
      "Recovery strategy",
      recovery.reasoning,
      {
        recovery_strategy: recovery.recovery_strategy,
        services_to_restore: recovery.services_to_restore,
        validation_steps: recovery.validation_steps,
      },
      recovery.confidence
    );

    for (let i = 0; i < (recovery.recovery_steps || []).length; i++) {
      const step = recovery.recovery_steps[i];

      this.logChainOfThought(
        4 + i,
        "action",
        `Recovery step ${i + 1}: ${step.action}`,
        `Restoring: ${step.description || step.action}`,
        { step }
      );

      await this.delay(1500, 2500);
    }

    const stepCount = (recovery.recovery_steps || []).length;

    this.logChainOfThought(
      4 + stepCount,
      "evaluation",
      "Recovery validation",
      `System recovery ${recovery.recovery_validated ? 'validated' : 'pending validation'}. Services restored: ${recovery.services_restored?.length || 0}`,
      { validated: recovery.recovery_validated, services_restored: recovery.services_restored },
      recovery.confidence
    );

    return this.emitEvent(
      EventType.INCIDENT_RECOVERED,
      {
        incident_id: incidentData.incident_id || `incident-${Date.now()}`,
        recovery_strategy: recovery.recovery_strategy,
        services_restored: recovery.services_restored,
        recovery_validated: recovery.recovery_validated,
        lessons_learned: recovery.lessons_learned,
        hardening_applied: recovery.hardening_applied,
      },
      'Medium',
      target,
      task.taskId
    );
  }
}
