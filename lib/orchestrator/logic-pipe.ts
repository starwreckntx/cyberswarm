
// Logic Pipe Orchestrator - Central command and control implementing the three core rules

import { CyberEvent, Task, LogicPipeExecution, LogicPipeRule, EventType, AgentType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class LogicPipeOrchestrator {
  private onTaskCreatedCallback?: (task: Task) => void;
  private onLogicPipeExecutionCallback?: (execution: LogicPipeExecution) => void;

  setTaskCreatedCallback(callback: (task: Task) => void) {
    this.onTaskCreatedCallback = callback;
  }

  setLogicPipeExecutionCallback(callback: (execution: LogicPipeExecution) => void) {
    this.onLogicPipeExecutionCallback = callback;
  }

  async processEvent(event: CyberEvent): Promise<Task[]> {
    console.log(`🔄 Logic Pipe: Processing ${event.eventType} event`);
    
    const startTime = Date.now();
    const newTasks: Task[] = [];

    try {
      switch (event.eventType) {
        case EventType.RECON_DATA:
          newTasks.push(...await this.handleReconData(event));
          break;
        case EventType.VULNERABILITY_FOUND:
          newTasks.push(...await this.handleVulnerabilityFound(event));
          break;
        case EventType.INTRUSION_DETECTED:
          newTasks.push(...await this.handleIntrusionDetected(event));
          break;
        case EventType.DEFENSE_ACTION:
          newTasks.push(...await this.handleDefenseAction(event));
          break;
        default:
          console.log(`ℹ️  Logic Pipe: No rules for event type ${event.eventType}`);
      }

      // Log the execution
      const executionTime = Date.now() - startTime;
      const execution: LogicPipeExecution = {
        id: uuidv4(),
        triggerEvent: event.eventType,
        ruleApplied: this.getRuleForEventType(event.eventType),
        inputData: event.payload,
        outputTasks: newTasks.map(t => ({ taskId: t.taskId, agentType: t.agentType, taskName: t.taskName })),
        executionTime,
        success: true,
        timestamp: new Date()
      };

      this.onLogicPipeExecutionCallback?.(execution);

      // Emit created tasks
      for (const task of newTasks) {
        this.onTaskCreatedCallback?.(task);
      }

      console.log(`✅ Logic Pipe: Created ${newTasks.length} tasks in ${executionTime}ms`);
      return newTasks;

    } catch (error) {
      console.error(`❌ Logic Pipe: Error processing ${event.eventType}:`, error);
      
      const execution: LogicPipeExecution = {
        id: uuidv4(),
        triggerEvent: event.eventType,
        ruleApplied: this.getRuleForEventType(event.eventType),
        inputData: event.payload,
        outputTasks: [],
        executionTime: Date.now() - startTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      this.onLogicPipeExecutionCallback?.(execution);
      return [];
    }
  }

  // Rule 1: Red Discovers → Blue Reacts
  private async handleReconData(event: CyberEvent): Promise<Task[]> {
    console.log(`🎯 Logic Pipe Rule: Red Discovers → Blue Reacts`);
    
    const reconData = event.payload;
    const tasks: Task[] = [];

    // Trigger vulnerability scan for discovered targets
    if (reconData.target_ip && reconData.open_ports?.length > 0) {
      const vulnScanTask: Task = {
        id: uuidv4(),
        taskId: uuidv4(),
        agentType: AgentType.VULNERABILITY_SCANNER,
        taskName: 'vuln_scan',
        target: reconData.target_ip,
        details: { 
          ports: reconData.open_ports,
          services: reconData.services,
          scan_trigger: 'recon_discovery'
        },
        status: 'PENDING',
        priority: 2,
        createdAt: new Date()
      };

      tasks.push(vulnScanTask);
      console.log(`   📍 Created vuln_scan task for ${reconData.target_ip}`);
    }

    return tasks;
  }

  // Rule 1 (continued): Vulnerability Found → Remediation
  private async handleVulnerabilityFound(event: CyberEvent): Promise<Task[]> {
    console.log(`🛡️  Logic Pipe Rule 1: Red Discovers → Blue Reacts (Vulnerability Response)`);
    
    const vulnerability = event.payload;
    const tasks: Task[] = [];

    // Create remediation task for discovered vulnerability
    const remediationTask: Task = {
      id: uuidv4(),
      taskId: uuidv4(),
      agentType: AgentType.PATCH_MANAGEMENT,
      taskName: 'remediate_vuln',
      target: vulnerability.target_ip,
      details: {
        cve_id: vulnerability.cve_id,
        target_port: vulnerability.target_port,
        severity: vulnerability.severity,
        trigger: 'vulnerability_discovery'
      },
      status: 'PENDING',
      priority: this.getPriorityForSeverity(vulnerability.severity),
      createdAt: new Date()
    };

    tasks.push(remediationTask);
    console.log(`   🔧 Created remediate_vuln task for ${vulnerability.cve_id}`);

    return tasks;
  }

  // Rule 2: Blue Detects → Red Adapts
  private async handleIntrusionDetected(event: CyberEvent): Promise<Task[]> {
    console.log(`🔄 Logic Pipe Rule 2: Blue Detects → Red Adapts`);
    
    const intrusion = event.payload;
    const tasks: Task[] = [];

    // Create strategy adaptation task
    const adaptationTask: Task = {
      id: uuidv4(),
      taskId: uuidv4(),
      agentType: AgentType.STRATEGY_ADAPTATION,
      taskName: 'adapt_attack_strategy',
      target: intrusion.source_ip,
      details: {
        detected_activity: intrusion.signature_id,
        destination: intrusion.destination_ip,
        detection_method: 'intrusion_detection_system',
        trigger: 'detection_event'
      },
      status: 'PENDING',
      priority: 1, // High priority for adaptation
      createdAt: new Date()
    };

    tasks.push(adaptationTask);
    console.log(`   🎭 Created adapt_attack_strategy task for signature ${intrusion.signature_id}`);

    return tasks;
  }

  // Rule 3: Blue Defends → Red Re-evaluates
  private async handleDefenseAction(event: CyberEvent): Promise<Task[]> {
    console.log(`🔄 Logic Pipe Rule 3: Blue Defends → Red Re-evaluates`);
    
    const defenseAction = event.payload;
    const tasks: Task[] = [];

    // Only create re-evaluation task for successful defense actions
    if (defenseAction.status === 'SUCCESS') {
      const reevaluationTask: Task = {
        id: uuidv4(),
        taskId: uuidv4(),
        agentType: AgentType.STRATEGY_ADAPTATION,
        taskName: 're_evaluate_target',
        target: defenseAction.target_cve,
        details: {
          action_type: defenseAction.action_type,
          patched_cve: defenseAction.target_cve,
          defense_details: defenseAction.details,
          trigger: 'successful_defense'
        },
        status: 'PENDING',
        priority: 2,
        createdAt: new Date()
      };

      tasks.push(reevaluationTask);
      console.log(`   📊 Created re_evaluate_target task for ${defenseAction.target_cve}`);
    } else {
      console.log(`   ℹ️  Defense action failed - no re-evaluation needed`);
    }

    return tasks;
  }

  private getRuleForEventType(eventType: string): string {
    switch (eventType) {
      case EventType.RECON_DATA:
      case EventType.VULNERABILITY_FOUND:
        return LogicPipeRule.RED_DISCOVERS_BLUE_REACTS;
      case EventType.INTRUSION_DETECTED:
        return LogicPipeRule.BLUE_DETECTS_RED_ADAPTS;
      case EventType.DEFENSE_ACTION:
        return LogicPipeRule.BLUE_DEFENDS_RED_REEVALUATES;
      default:
        return 'NO_RULE_APPLIED';
    }
  }

  private getPriorityForSeverity(severity: string): number {
    const priorityMap: Record<string, number> = {
      'Critical': 1,
      'High': 1,
      'Medium': 2,
      'Low': 3
    };
    return priorityMap[severity] || 2;
  }

  // Manual task injection for testing and demonstration
  createManualTask(
    agentType: string,
    taskName: string,
    target?: string,
    details?: any,
    priority: number = 2
  ): Task {
    const task: Task = {
      id: uuidv4(),
      taskId: uuidv4(),
      agentType,
      taskName,
      target,
      details: { ...details, trigger: 'manual_injection' },
      status: 'PENDING',
      priority,
      createdAt: new Date()
    };

    console.log(`🔧 Manual task created: ${taskName} for ${agentType}`);
    this.onTaskCreatedCallback?.(task);
    
    return task;
  }

  // Get statistics about logic pipe executions
  getLogicPipeStats(): any {
    return {
      rulesImplemented: 3,
      supportedEvents: [
        EventType.RECON_DATA,
        EventType.VULNERABILITY_FOUND,
        EventType.INTRUSION_DETECTED,
        EventType.DEFENSE_ACTION
      ],
      flowPatterns: [
        'Red Discovers → Blue Reacts',
        'Blue Detects → Red Adapts', 
        'Blue Defends → Red Re-evaluates'
      ]
    };
  }
}
