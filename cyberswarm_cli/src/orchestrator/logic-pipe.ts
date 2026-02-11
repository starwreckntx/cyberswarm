
// Logic Pipe - Event-driven rule engine for multi-agent coordination

import { CyberEvent, Task, EventType, LogicPipeRule, LogicPipeExecution } from '../types.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class LogicPipe {
  private onTaskCreatedCallback?: (task: Task) => void;
  private executionHistory: LogicPipeExecution[] = [];

  constructor() {
    logger.info('Logic Pipe initialized');
  }

  /**
   * Set callback for task creation
   */
  setTaskCreatedCallback(callback: (task: Task) => void): void {
    this.onTaskCreatedCallback = callback;
  }

  /**
   * Process an event through the logic pipe
   */
  async processEvent(event: CyberEvent): Promise<Task[]> {
    const startTime = Date.now();
    const createdTasks: Task[] = [];

    try {
      logger.info(`Processing event: ${event.eventType}`, {
        severity: event.severity,
        target: event.target,
      });

      // Rule 1: Red Discovers → Blue Reacts
      if (event.eventType === EventType.RECON_DATA) {
        const tasks = await this.applyRedDiscoverBlueReacts(event);
        createdTasks.push(...tasks);
      }

      if (event.eventType === EventType.VULNERABILITY_FOUND) {
        const tasks = await this.applyVulnFoundBlueRemediates(event);
        createdTasks.push(...tasks);
      }

      // Rule 2: Blue Detects → Red Adapts
      if (event.eventType === EventType.INTRUSION_DETECTED) {
        const tasks = await this.applyBlueDetectsRedAdapts(event);
        createdTasks.push(...tasks);
      }

      // Rule 3: Blue Defends → Red Reevaluates
      if (event.eventType === EventType.DEFENSE_ACTION) {
        const tasks = await this.applyBlueDefendsRedReevaluates(event);
        createdTasks.push(...tasks);
      }

      // Purple Team Rule 1: Intrusion Detected → Threat Hunter hunts for IOCs
      if (event.eventType === EventType.INTRUSION_DETECTED) {
        const tasks = await this.applyPurpleHuntOnIntrusion(event);
        createdTasks.push(...tasks);
      }

      // Purple Team Rule 2: Threat Hunt Finding → Incident Response triages
      if (event.eventType === EventType.THREAT_HUNT_FINDING) {
        const tasks = await this.applyPurpleIncidentOnHuntFinding(event);
        createdTasks.push(...tasks);
      }

      // Purple Team Rule 3: Defense Action → Posture Assessment evaluates
      if (event.eventType === EventType.DEFENSE_ACTION) {
        const tasks = await this.applyPurplePostureOnDefense(event);
        createdTasks.push(...tasks);
      }

      // Purple Team Rule 4: Attack Adaptation → Threat Intel correlates
      if (event.eventType === EventType.ATTACK_ADAPTATION) {
        const tasks = await this.applyPurpleIntelOnAdaptation(event);
        createdTasks.push(...tasks);
      }

      // Purple Team Rule 5: Incident Contained → Eradicate threat
      if (event.eventType === EventType.INCIDENT_CONTAINED) {
        const tasks = await this.applyPurpleEradicateOnContainment(event);
        createdTasks.push(...tasks);
      }

      // Purple Team Rule 6: Incident Eradicated → Recover systems
      if (event.eventType === EventType.INCIDENT_ERADICATED) {
        const tasks = await this.applyPurpleRecoverOnEradication(event);
        createdTasks.push(...tasks);
      }

      // Purple Team Rule 7: Detection Gap Found → Threat Intel enriches
      if (event.eventType === EventType.DETECTION_GAP_FOUND) {
        const tasks = await this.applyPurpleIntelOnDetectionGap(event);
        createdTasks.push(...tasks);
      }

      // Log execution
      const execution: LogicPipeExecution = {
        id: uuidv4(),
        triggerEvent: event.eventType,
        ruleApplied: this.determineRule(event.eventType),
        inputData: event.payload,
        outputTasks: createdTasks.map(t => ({
          taskId: t.taskId,
          agentType: t.agentType,
          taskName: t.taskName,
        })),
        executionTime: Date.now() - startTime,
        success: true,
        timestamp: new Date(),
      };

      this.executionHistory.push(execution);

      logger.info(`Logic pipe created ${createdTasks.length} tasks`, {
        rule: execution.ruleApplied,
        executionTime: execution.executionTime,
      });

      // Notify for each created task
      for (const task of createdTasks) {
        this.onTaskCreatedCallback?.(task);
      }

      return createdTasks;
    } catch (error: any) {
      logger.error(`Logic pipe error: ${error.message}`, { event: event.eventType });

      const execution: LogicPipeExecution = {
        id: uuidv4(),
        triggerEvent: event.eventType,
        ruleApplied: this.determineRule(event.eventType),
        inputData: event.payload,
        outputTasks: [],
        executionTime: Date.now() - startTime,
        success: false,
        errorMessage: error.message,
        timestamp: new Date(),
      };

      this.executionHistory.push(execution);

      return [];
    }
  }

  /**
   * Rule 1a: Red Discovers → Blue Scans for Vulnerabilities
   */
  private async applyRedDiscoverBlueReacts(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const target = event.payload.target_ip || event.target;
    const services = event.payload.services || {};

    // Create vulnerability scan task
    const vulnTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-vuln`,
      agentType: 'VulnerabilityScannerAgent',
      taskName: 'vuln_scan',
      target,
      details: { services, triggeredBy: event.id },
      status: "PENDING",
      priority: 8,
      createdAt: new Date(),
    };

    tasks.push(vulnTask);

    logger.debug(`Rule applied: RED_DISCOVERS_BLUE_REACTS`, {
      triggerEvent: event.eventType,
      createdTasks: tasks.length,
    });

    return tasks;
  }

  /**
   * Rule 1b: Vulnerability Found → Blue Remediates
   */
  private async applyVulnFoundBlueRemediates(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const target = event.target;
    const vulnerability = event.payload;

    // Create remediation task
    const remediateTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-remediate`,
      agentType: 'PatchManagementAgent',
      taskName: 'remediate_vuln',
      target,
      details: { vulnerability, triggeredBy: event.id },
      status: "PENDING",
      priority: 9,
      createdAt: new Date(),
    };

    tasks.push(remediateTask);

    logger.debug(`Rule applied: VULNERABILITY_FOUND_BLUE_REMEDIATES`, {
      triggerEvent: event.eventType,
      cve: vulnerability.cve_id,
    });

    return tasks;
  }

  /**
   * Rule 2: Blue Detects → Red Adapts
   */
  private async applyBlueDetectsRedAdapts(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const intrusion = event.payload;

    // Create strategy adaptation task
    const adaptTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-adapt`,
      agentType: 'StrategyAdaptationAgent',
      taskName: 'adapt_strategy',
      details: {
        detectedBy: intrusion,
        triggeredBy: event.id,
        reason: 'intrusion_detected',
      },
      status: "PENDING",
      priority: 7,
      createdAt: new Date(),
    };

    tasks.push(adaptTask);

    logger.debug(`Rule applied: BLUE_DETECTS_RED_ADAPTS`, {
      triggerEvent: event.eventType,
      intrusion: intrusion.signature_id,
    });

    return tasks;
  }

  /**
   * Rule 3: Blue Defends → Red Reevaluates
   */
  private async applyBlueDefendsRedReevaluates(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const defenseAction = event.payload;

    // Create target reevaluation task
    const reevalTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-reeval`,
      agentType: 'StrategyAdaptationAgent',
      taskName: 'reevaluate_targets',
      details: {
        defenseAction,
        triggeredBy: event.id,
        reason: 'defense_action_detected',
      },
      status: "PENDING",
      priority: 6,
      createdAt: new Date(),
    };

    tasks.push(reevalTask);

    logger.debug(`Rule applied: BLUE_DEFENDS_RED_REEVALUATES`, {
      triggerEvent: event.eventType,
      action: defenseAction.action_type,
    });

    return tasks;
  }

  // === Purple Team Rules ===

  /**
   * Purple Rule 1: Intrusion Detected → Threat Hunter hunts for IOCs
   */
  private async applyPurpleHuntOnIntrusion(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const intrusion = event.payload;
    const target = event.target;

    const huntTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-hunt-ioc`,
      agentType: 'ThreatHunterAgent',
      taskName: 'hunt_ioc',
      target,
      details: {
        intrusion,
        triggeredBy: event.id,
        reason: 'intrusion_detected_hunt_expansion',
      },
      status: "PENDING",
      priority: 8,
      createdAt: new Date(),
    };

    tasks.push(huntTask);

    logger.debug(`Rule applied: PURPLE_HUNT_ON_INTRUSION`, {
      triggerEvent: event.eventType,
      target,
    });

    return tasks;
  }

  /**
   * Purple Rule 2: Threat Hunt Finding → Incident Response triages
   */
  private async applyPurpleIncidentOnHuntFinding(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const huntData = event.payload;
    const target = event.target;

    const triageTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-triage`,
      agentType: 'IncidentResponseAgent',
      taskName: 'triage_incident',
      target,
      details: {
        huntFindings: huntData,
        triggeredBy: event.id,
        reason: 'threat_hunt_finding_triage',
      },
      status: "PENDING",
      priority: 9,
      createdAt: new Date(),
    };

    tasks.push(triageTask);

    // Also trigger TTP-based hunting to expand the search
    const ttpHuntTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-hunt-ttp`,
      agentType: 'ThreatHunterAgent',
      taskName: 'hunt_ttp',
      target,
      details: {
        initialFindings: huntData,
        triggeredBy: event.id,
        reason: 'expand_hunt_with_ttp_analysis',
      },
      status: "PENDING",
      priority: 7,
      createdAt: new Date(),
    };

    tasks.push(ttpHuntTask);

    logger.debug(`Rule applied: PURPLE_INCIDENT_ON_HUNT_FINDING`, {
      triggerEvent: event.eventType,
      tasksCreated: tasks.length,
    });

    return tasks;
  }

  /**
   * Purple Rule 3: Defense Action → Posture Assessment evaluates effectiveness
   */
  private async applyPurplePostureOnDefense(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const defenseAction = event.payload;
    const target = event.target;

    const assessTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-posture`,
      agentType: 'PostureAssessmentAgent',
      taskName: 'evaluate_controls',
      target,
      details: {
        defenseAction,
        triggeredBy: event.id,
        reason: 'post_defense_posture_evaluation',
      },
      status: "PENDING",
      priority: 5,
      createdAt: new Date(),
    };

    tasks.push(assessTask);

    logger.debug(`Rule applied: PURPLE_POSTURE_ON_DEFENSE`, {
      triggerEvent: event.eventType,
      action: defenseAction.action_type,
    });

    return tasks;
  }

  /**
   * Purple Rule 4: Attack Adaptation → Threat Intel correlates new TTPs
   */
  private async applyPurpleIntelOnAdaptation(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const adaptation = event.payload;
    const target = event.target;

    const intelTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-intel-correlate`,
      agentType: 'ThreatIntelligenceAgent',
      taskName: 'correlate_iocs',
      target,
      details: {
        adaptation,
        triggeredBy: event.id,
        reason: 'attack_adaptation_intel_correlation',
        new_techniques: adaptation.new_techniques,
      },
      status: "PENDING",
      priority: 7,
      createdAt: new Date(),
    };

    tasks.push(intelTask);

    // Also profile the threat actor based on adapted tactics
    const profileTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-intel-profile`,
      agentType: 'ThreatIntelligenceAgent',
      taskName: 'profile_threat_actor',
      target,
      details: {
        observed_ttps: adaptation.new_techniques,
        strategy_change: adaptation.strategy_change,
        triggeredBy: event.id,
        reason: 'profile_actor_from_adaptation',
      },
      status: "PENDING",
      priority: 6,
      createdAt: new Date(),
    };

    tasks.push(profileTask);

    logger.debug(`Rule applied: PURPLE_INTEL_ON_ADAPTATION`, {
      triggerEvent: event.eventType,
      tasksCreated: tasks.length,
    });

    return tasks;
  }

  /**
   * Purple Rule 5: Incident Contained → Eradicate the threat
   */
  private async applyPurpleEradicateOnContainment(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const containmentData = event.payload;
    const target = event.target;

    const eradicateTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-eradicate`,
      agentType: 'IncidentResponseAgent',
      taskName: 'eradicate_threat',
      target,
      details: {
        containment: containmentData,
        triggeredBy: event.id,
        reason: 'post_containment_eradication',
      },
      status: "PENDING",
      priority: 9,
      createdAt: new Date(),
    };

    tasks.push(eradicateTask);

    logger.debug(`Rule applied: PURPLE_ERADICATE_ON_CONTAINMENT`, {
      triggerEvent: event.eventType,
      incident_id: containmentData.incident_id,
    });

    return tasks;
  }

  /**
   * Purple Rule 6: Incident Eradicated → Recover systems and assess posture
   */
  private async applyPurpleRecoverOnEradication(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const eradicationData = event.payload;
    const target = event.target;

    const recoverTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-recover`,
      agentType: 'IncidentResponseAgent',
      taskName: 'recover_systems',
      target,
      details: {
        eradication: eradicationData,
        triggeredBy: event.id,
        reason: 'post_eradication_recovery',
      },
      status: "PENDING",
      priority: 8,
      createdAt: new Date(),
    };

    tasks.push(recoverTask);

    // Trigger full posture assessment after incident resolution
    const postureTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-posture-full`,
      agentType: 'PostureAssessmentAgent',
      taskName: 'assess_posture',
      target,
      details: {
        incident_resolved: eradicationData,
        triggeredBy: event.id,
        reason: 'post_incident_posture_assessment',
      },
      status: "PENDING",
      priority: 6,
      createdAt: new Date(),
    };

    tasks.push(postureTask);

    logger.debug(`Rule applied: PURPLE_RECOVER_ON_ERADICATION`, {
      triggerEvent: event.eventType,
      tasksCreated: tasks.length,
    });

    return tasks;
  }

  /**
   * Purple Rule 7: Detection Gap Found → Threat Intel enriches and validates
   */
  private async applyPurpleIntelOnDetectionGap(event: CyberEvent): Promise<Task[]> {
    const tasks: Task[] = [];

    const gapData = event.payload;
    const target = event.target;

    const enrichTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-intel-enrich`,
      agentType: 'ThreatIntelligenceAgent',
      taskName: 'enrich_indicators',
      target,
      details: {
        detection_gaps: gapData.gaps || gapData.detection_gaps,
        triggeredBy: event.id,
        reason: 'enrich_detection_gap_context',
      },
      status: "PENDING",
      priority: 7,
      createdAt: new Date(),
    };

    tasks.push(enrichTask);

    // Also trigger MITRE coverage mapping to understand the full gap picture
    const mitreCoverageTask: Task = {
      id: uuidv4(),
      taskId: `task-${Date.now()}-mitre-map`,
      agentType: 'PostureAssessmentAgent',
      taskName: 'map_mitre_coverage',
      target,
      details: {
        detection_gaps: gapData.gaps || gapData.detection_gaps,
        triggeredBy: event.id,
        reason: 'map_mitre_coverage_for_gaps',
      },
      status: "PENDING",
      priority: 6,
      createdAt: new Date(),
    };

    tasks.push(mitreCoverageTask);

    logger.debug(`Rule applied: PURPLE_INTEL_ON_DETECTION_GAP`, {
      triggerEvent: event.eventType,
      tasksCreated: tasks.length,
    });

    return tasks;
  }

  /**
   * Determine which rule applies to an event type
   */
  private determineRule(eventType: string): string {
    switch (eventType) {
      case EventType.RECON_DATA:
      case EventType.VULNERABILITY_FOUND:
        return LogicPipeRule.RED_DISCOVERS_BLUE_REACTS;
      case EventType.INTRUSION_DETECTED:
        return LogicPipeRule.BLUE_DETECTS_RED_ADAPTS;
      case EventType.DEFENSE_ACTION:
        return LogicPipeRule.BLUE_DEFENDS_RED_REEVALUATES;
      case EventType.THREAT_HUNT_FINDING:
        return LogicPipeRule.PURPLE_INCIDENT_ON_HUNT_FINDING;
      case EventType.ATTACK_ADAPTATION:
        return LogicPipeRule.PURPLE_INTEL_ON_ADAPTATION;
      case EventType.INCIDENT_CONTAINED:
        return LogicPipeRule.PURPLE_INCIDENT_ON_HUNT_FINDING;
      case EventType.INCIDENT_ERADICATED:
        return LogicPipeRule.PURPLE_INCIDENT_ON_HUNT_FINDING;
      case EventType.DETECTION_GAP_FOUND:
        return LogicPipeRule.PURPLE_INTEL_ON_ADAPTATION;
      default:
        return 'NO_RULE';
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): LogicPipeExecution[] {
    return [...this.executionHistory];
  }

  /**
   * Get statistics
   */
  getStats(): any {
    return {
      totalExecutions: this.executionHistory.length,
      successfulExecutions: this.executionHistory.filter(e => e.success).length,
      failedExecutions: this.executionHistory.filter(e => !e.success).length,
      ruleExecutions: {
        [LogicPipeRule.RED_DISCOVERS_BLUE_REACTS]: this.executionHistory.filter(
          e => e.ruleApplied === LogicPipeRule.RED_DISCOVERS_BLUE_REACTS
        ).length,
        [LogicPipeRule.BLUE_DETECTS_RED_ADAPTS]: this.executionHistory.filter(
          e => e.ruleApplied === LogicPipeRule.BLUE_DETECTS_RED_ADAPTS
        ).length,
        [LogicPipeRule.BLUE_DEFENDS_RED_REEVALUATES]: this.executionHistory.filter(
          e => e.ruleApplied === LogicPipeRule.BLUE_DEFENDS_RED_REEVALUATES
        ).length,
        [LogicPipeRule.PURPLE_HUNT_ON_INTRUSION]: this.executionHistory.filter(
          e => e.ruleApplied === LogicPipeRule.PURPLE_HUNT_ON_INTRUSION
        ).length,
        [LogicPipeRule.PURPLE_INCIDENT_ON_HUNT_FINDING]: this.executionHistory.filter(
          e => e.ruleApplied === LogicPipeRule.PURPLE_INCIDENT_ON_HUNT_FINDING
        ).length,
        [LogicPipeRule.PURPLE_POSTURE_ON_DEFENSE]: this.executionHistory.filter(
          e => e.ruleApplied === LogicPipeRule.PURPLE_POSTURE_ON_DEFENSE
        ).length,
        [LogicPipeRule.PURPLE_INTEL_ON_ADAPTATION]: this.executionHistory.filter(
          e => e.ruleApplied === LogicPipeRule.PURPLE_INTEL_ON_ADAPTATION
        ).length,
      },
    };
  }
}
