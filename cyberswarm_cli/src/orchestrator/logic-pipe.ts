
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
      },
    };
  }
}
