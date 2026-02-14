
// Containment Agent - Automated threat containment with Gemini AI (Blue Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, ContainmentAction, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class ContainmentAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'containment-01',
      'Threat Containment Agent',
      'ContainmentAgent',
      ['network_isolate', 'process_terminate', 'block_ip_domain'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing containment request",
        `Received ${task.taskName} task. Using Gemini AI for intelligent threat containment with minimal operational disruption.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'network_isolate':
          return await this.networkIsolate(task);
        case 'process_terminate':
          return await this.processTerminate(task);
        case 'block_ip_domain':
          return await this.blockIPDomain(task);
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

  private async networkIsolate(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.10';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "decision",
      "Network isolation assessment",
      `Evaluating network isolation for ${target}. Assessing blast radius, critical services, and evidence preservation requirements before executing containment.`,
      { target, context, tools: ['firewall-api', 'nac-api', 'edr-api'] }
    );

    await this.delay(1000, 2000);

    const isolation = await this.getGeminiDecision<any>(
      PROMPTS.CONTAINMENT_NETWORK_ISOLATE(target, context)
    );

    this.logChainOfThought(
      3,
      "decision",
      "Isolation strategy",
      `Strategy: ${isolation.isolation_strategy || 'full_isolation'}. Scope: ${isolation.scope?.systems?.length || 0} systems, ${isolation.scope?.network_segments?.length || 0} segments. Business impact: ${isolation.business_impact || 'unknown'}.`,
      {
        strategy: isolation.isolation_strategy,
        scope: isolation.scope,
        business_impact: isolation.business_impact,
        evidence_plan: isolation.evidence_preservation,
      },
      isolation.confidence
    );

    for (let i = 0; i < (isolation.isolation_steps || []).length; i++) {
      const step = isolation.isolation_steps[i];

      this.logChainOfThought(
        4 + i,
        "action",
        `Isolation step ${i + 1}: ${step.action}`,
        `Executing: ${step.command || step.action}. Target: ${step.target || target}`,
        { step }
      );

      await this.delay(800, 1500);
    }

    const stepCount = (isolation.isolation_steps || []).length;

    this.logChainOfThought(
      4 + stepCount,
      "evaluation",
      "Isolation verification",
      `Network isolation ${isolation.verified ? 'verified' : 'pending verification'}. Evidence preserved: ${isolation.evidence_preserved ? 'YES' : 'NO'}.`,
      { verified: isolation.verified, evidence_preserved: isolation.evidence_preserved },
      isolation.confidence
    );

    return this.emitEvent(
      EventType.SYSTEM_ISOLATED,
      {
        containment_id: `contain-${Date.now()}`,
        action_type: 'network_isolate',
        target,
        scope: isolation.scope || { systems: [target] },
        success: isolation.verified || false,
        evidence_preserved: isolation.evidence_preserved || false,
        isolation_strategy: isolation.isolation_strategy,
        side_effects: isolation.side_effects || [],
        rollback_plan: isolation.rollback_plan,
      },
      'High',
      target,
      task.taskId
    );
  }

  private async processTerminate(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.10';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "decision",
      "Process termination assessment",
      `Evaluating processes to terminate on ${target}. Analyzing process trees, parent-child relationships, and service dependencies.`,
      { target, context }
    );

    await this.delay(1000, 2000);

    const termination = await this.getGeminiDecision<any>(
      PROMPTS.CONTAINMENT_PROCESS_TERMINATE(target, context)
    );

    this.logChainOfThought(
      3,
      "action",
      "Process termination",
      `Terminating ${termination.processes?.length || 0} malicious processes. ${termination.child_processes_killed || 0} child processes affected. Memory dumped before kill: ${termination.memory_dumped ? 'YES' : 'NO'}.`,
      {
        processes: termination.processes,
        child_killed: termination.child_processes_killed,
        memory_dumped: termination.memory_dumped,
      },
      termination.confidence
    );

    await this.delay(500, 1000);

    this.logChainOfThought(
      4,
      "evaluation",
      "Termination verification",
      `Process termination ${termination.verified ? 'verified' : 'pending'}. No respawn detected: ${termination.no_respawn ? 'CONFIRMED' : 'MONITORING'}.`,
      { verified: termination.verified, no_respawn: termination.no_respawn },
      termination.confidence
    );

    return this.emitEvent(
      EventType.PROCESS_TERMINATED,
      {
        containment_id: `contain-${Date.now()}`,
        action_type: 'process_terminate',
        target,
        processes_terminated: termination.processes || [],
        child_processes_killed: termination.child_processes_killed,
        memory_dumped: termination.memory_dumped,
        success: termination.verified || false,
        evidence_preserved: termination.memory_dumped || false,
        no_respawn: termination.no_respawn,
      },
      'High',
      target,
      task.taskId
    );
  }

  private async blockIPDomain(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.10';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "decision",
      "IP/Domain blocking assessment",
      `Evaluating blocking action for ${target}. Checking false positive risk, legitimate traffic impact, and C2 infrastructure scope.`,
      { target, context }
    );

    await this.delay(1000, 1500);

    const blocking = await this.getGeminiDecision<any>(
      PROMPTS.CONTAINMENT_BLOCK_IP(target, context)
    );

    this.logChainOfThought(
      3,
      "action",
      "Blocking execution",
      `Blocking ${blocking.blocked_iocs?.length || 0} IOCs across ${blocking.enforcement_points?.length || 0} enforcement points (firewall, DNS, proxy).`,
      {
        blocked_iocs: blocking.blocked_iocs,
        enforcement_points: blocking.enforcement_points,
        rules_created: blocking.rules_created,
      },
      blocking.confidence
    );

    await this.delay(800, 1500);

    this.logChainOfThought(
      4,
      "evaluation",
      "Blocking verification",
      `Block verification ${blocking.verified ? 'complete' : 'pending'}. All enforcement points updated: ${blocking.all_points_updated ? 'YES' : 'NO'}.`,
      { verified: blocking.verified, all_updated: blocking.all_points_updated },
      blocking.confidence
    );

    return this.emitEvent(
      EventType.CONTAINMENT_ACTION,
      {
        containment_id: `contain-${Date.now()}`,
        action_type: 'block_ip_domain',
        target,
        blocked_iocs: blocking.blocked_iocs || [],
        enforcement_points: blocking.enforcement_points || [],
        success: blocking.verified || false,
        evidence_preserved: true,
        rules_created: blocking.rules_created || [],
        expiration: blocking.expiration,
      },
      'High',
      target,
      task.taskId
    );
  }
}
