
// AI Monitoring Agent - Monitors orchestrator reasoning and agent behavior (Blue Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, AIReasoningAlert, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class AIMonitoringAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'ai-monitor-01',
      'AI Monitoring Agent',
      'AIMonitoringAgent',
      ['monitor_reasoning_chain', 'prompt_sanity_check', 'detect_logic_loops'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing AI monitoring request",
        `Received ${task.taskName} task. Monitoring AI reasoning chains and orchestrator decisions for anomalies, logic loops, and adversarial inputs.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'monitor_reasoning_chain':
          return await this.monitorReasoningChain(task);
        case 'prompt_sanity_check':
          return await this.promptSanityCheck(task);
        case 'detect_logic_loops':
          return await this.detectLogicLoops(task);
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

  private async monitorReasoningChain(task: Task): Promise<CyberEvent> {
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Reasoning chain monitoring",
      `Analyzing recent AI reasoning chains for consistency, confidence drift, and anomalous decision patterns.`,
      { context }
    );

    await this.delay(1500, 2500);

    const monitoring = await this.getGeminiDecision<any>(
      PROMPTS.AI_MONITOR_REASONING(context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Reasoning chain assessment",
      `Analyzed ${monitoring.chains_reviewed || 0} reasoning chains. Anomalies found: ${monitoring.anomalies_detected || 0}. Confidence drift: ${monitoring.confidence_drift || 'stable'}. Decision consistency: ${monitoring.decision_consistency || 'unknown'}%.`,
      {
        chains_reviewed: monitoring.chains_reviewed,
        anomalies: monitoring.anomalies_detected,
        confidence_drift: monitoring.confidence_drift,
        consistency: monitoring.decision_consistency,
      },
      monitoring.confidence
    );

    if (monitoring.anomalies_detected > 0) {
      this.logChainOfThought(
        4,
        "evaluation",
        "Reasoning anomaly alert",
        `Detected ${monitoring.anomalies_detected} anomalies in AI reasoning. Types: ${monitoring.anomaly_types?.join(', ') || 'unknown'}. Severity: ${monitoring.overall_severity || 'unknown'}.`,
        {
          anomaly_types: monitoring.anomaly_types,
          affected_agents: monitoring.affected_agents,
          recommendations: monitoring.recommendations,
        },
        monitoring.confidence
      );

      return this.emitEvent(
        EventType.AI_REASONING_ALERT,
        {
          alert_id: `ai-alert-${Date.now()}`,
          monitored_component: 'reasoning_chain',
          alert_type: monitoring.primary_anomaly_type || 'confidence_anomaly',
          description: monitoring.summary || 'Anomalous reasoning patterns detected',
          severity: monitoring.overall_severity || 'Medium',
          chains_reviewed: monitoring.chains_reviewed,
          anomalies_detected: monitoring.anomalies_detected,
          anomaly_types: monitoring.anomaly_types,
          affected_agents: monitoring.affected_agents,
          affected_decisions: monitoring.affected_decisions || [],
          recommended_action: monitoring.primary_recommendation || 'Review affected reasoning chains',
          recommendations: monitoring.recommendations,
        },
        monitoring.overall_severity || 'Medium',
        task.target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.MONITORING_COMPLETE,
      {
        monitoring_type: 'reasoning_chain',
        chains_reviewed: monitoring.chains_reviewed,
        anomalies_detected: 0,
        status: 'healthy',
        confidence_drift: monitoring.confidence_drift,
        decision_consistency: monitoring.decision_consistency,
      },
      'Low',
      task.target,
      task.taskId
    );
  }

  private async promptSanityCheck(task: Task): Promise<CyberEvent> {
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Prompt sanity check",
      `Validating AI prompts for injection attempts, adversarial inputs, and semantic drift.`,
      { context }
    );

    await this.delay(1000, 2000);

    const sanityCheck = await this.getGeminiDecision<any>(
      PROMPTS.AI_MONITOR_PROMPT_CHECK(context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Prompt validation results",
      `Checked ${sanityCheck.prompts_checked || 0} prompts. Injection attempts: ${sanityCheck.injection_attempts || 0}. Semantic anomalies: ${sanityCheck.semantic_anomalies || 0}. Data integrity: ${sanityCheck.data_integrity || 'unknown'}%.`,
      {
        prompts_checked: sanityCheck.prompts_checked,
        injection_attempts: sanityCheck.injection_attempts,
        semantic_anomalies: sanityCheck.semantic_anomalies,
        data_integrity: sanityCheck.data_integrity,
      },
      sanityCheck.confidence
    );

    if (sanityCheck.injection_attempts > 0) {
      return this.emitEvent(
        EventType.AI_REASONING_ALERT,
        {
          alert_id: `ai-alert-${Date.now()}`,
          monitored_component: 'prompt_pipeline',
          alert_type: 'prompt_injection',
          description: `Detected ${sanityCheck.injection_attempts} potential prompt injection attempts`,
          severity: 'Critical',
          prompts_checked: sanityCheck.prompts_checked,
          injection_details: sanityCheck.injection_details,
          affected_decisions: sanityCheck.affected_decisions || [],
          recommended_action: 'Quarantine affected prompts and review agent inputs',
        },
        'Critical',
        task.target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.MONITORING_COMPLETE,
      {
        monitoring_type: 'prompt_sanity',
        prompts_checked: sanityCheck.prompts_checked,
        injection_attempts: 0,
        status: 'healthy',
      },
      'Low',
      task.target,
      task.taskId
    );
  }

  private async detectLogicLoops(task: Task): Promise<CyberEvent> {
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Logic loop detection",
      `Analyzing orchestrator task flow for cyclic patterns, resource exhaustion, and self-perpetuating event chains.`,
      { context }
    );

    await this.delay(1500, 2500);

    const loopDetection = await this.getGeminiDecision<any>(
      PROMPTS.AI_MONITOR_LOGIC_LOOPS(context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Logic loop analysis",
      `Analyzed ${loopDetection.event_chains_checked || 0} event chains. Loops detected: ${loopDetection.loops_detected || 0}. Resource utilization: ${loopDetection.resource_utilization || 'normal'}.`,
      {
        chains_checked: loopDetection.event_chains_checked,
        loops_detected: loopDetection.loops_detected,
        resource_utilization: loopDetection.resource_utilization,
        longest_chain: loopDetection.longest_chain_length,
      },
      loopDetection.confidence
    );

    if (loopDetection.loops_detected > 0) {
      return this.emitEvent(
        EventType.AI_REASONING_ALERT,
        {
          alert_id: `ai-alert-${Date.now()}`,
          monitored_component: 'logic_pipe',
          alert_type: 'logic_loop',
          description: `Detected ${loopDetection.loops_detected} logic loops in event processing`,
          severity: 'High',
          loops_detected: loopDetection.loops_detected,
          loop_details: loopDetection.loop_details,
          affected_decisions: loopDetection.affected_event_types || [],
          resource_impact: loopDetection.resource_impact,
          recommended_action: loopDetection.breaking_strategy || 'Implement circuit breaker on affected event chains',
        },
        'High',
        task.target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.MONITORING_COMPLETE,
      {
        monitoring_type: 'logic_loop_detection',
        event_chains_checked: loopDetection.event_chains_checked,
        loops_detected: 0,
        resource_utilization: loopDetection.resource_utilization,
        status: 'healthy',
      },
      'Low',
      task.target,
      task.taskId
    );
  }
}
