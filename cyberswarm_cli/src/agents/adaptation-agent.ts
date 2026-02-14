
// Adaptation Agent - Incident learning and strategy optimization (Purple Team)
// Sub-agents: IncidentLearner (feedback loop analysis), StrategyOptimizer (ML-based rule refinement)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class AdaptationAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'adaptation-01',
      'Swarm Adaptation Agent',
      'AdaptationAgent',
      ['learn_from_incident', 'optimize_strategy', 'tune_models', 'assess_swarm_health'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing adaptation request",
        `Received ${task.taskName} task. Deploying IncidentLearner and StrategyOptimizer sub-agents for swarm adaptation.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'learn_from_incident':
          return await this.learnFromIncident(task);
        case 'optimize_strategy':
          return await this.optimizeStrategy(task);
        case 'tune_models':
          return await this.tuneModels(task);
        case 'assess_swarm_health':
          return await this.assessSwarmHealth(task);
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

  /**
   * Sub-agent: IncidentLearner - Analyze incident outcomes for lessons
   */
  private async learnFromIncident(task: Task): Promise<CyberEvent> {
    const target = task.target || 'swarm';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[IncidentLearner] Incident analysis",
      `Sub-agent IncidentLearner analyzing incident outcomes. Processing event chains, response effectiveness, and detection gaps.`,
      { target, context, sub_agent: 'IncidentLearner' }
    );

    await this.delay(3000, 5000);

    const learningResult = await this.getGeminiDecision<any>(
      PROMPTS.ADAPTATION_LEARN_INCIDENT(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[IncidentLearner] Lessons learned",
      `Extracted ${learningResult.lessons?.length || 0} lessons. Key finding: ${learningResult.primary_finding || 'analysis complete'}. Detection improvement potential: ${learningResult.detection_improvement || 'moderate'}.`,
      {
        lessons: learningResult.lessons?.length,
        primary_finding: learningResult.primary_finding,
        improvement: learningResult.detection_improvement,
        sub_agent: 'IncidentLearner',
      },
      learningResult.confidence
    );

    return this.emitEvent(
      EventType.ADAPTATION_INSIGHT,
      {
        insight_id: `adapt-learn-${Date.now()}`,
        analysis_type: 'incident_learning',
        sub_agent: 'IncidentLearner',
        lessons_learned: learningResult.lessons || [],
        primary_finding: learningResult.primary_finding,
        strategy_updates: learningResult.strategy_updates || [],
        detection_improvements: learningResult.detection_improvements || [],
        confidence_score: learningResult.confidence || 0.7,
      },
      'Medium',
      target,
      task.taskId
    );
  }

  /**
   * Sub-agent: StrategyOptimizer - Refine detection and response rules
   */
  private async optimizeStrategy(task: Task): Promise<CyberEvent> {
    const target = task.target || 'swarm';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[StrategyOptimizer] Strategy optimization",
      `Sub-agent StrategyOptimizer evaluating current detection rules and response strategies. Applying ML-based analysis for rule refinement.`,
      { target, context, sub_agent: 'StrategyOptimizer' }
    );

    await this.delay(3500, 6000);

    const optimizeResult = await this.getGeminiDecision<any>(
      PROMPTS.ADAPTATION_OPTIMIZE_STRATEGY(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[StrategyOptimizer] Optimization results",
      `Generated ${optimizeResult.rule_updates?.length || 0} rule updates. Expected false positive reduction: ${optimizeResult.fp_reduction || 'unknown'}. Detection rate improvement: ${optimizeResult.detection_improvement || 'unknown'}.`,
      {
        updates: optimizeResult.rule_updates?.length,
        fp_reduction: optimizeResult.fp_reduction,
        detection_improvement: optimizeResult.detection_improvement,
        sub_agent: 'StrategyOptimizer',
      },
      optimizeResult.confidence
    );

    return this.emitEvent(
      EventType.STRATEGY_OPTIMIZED,
      {
        insight_id: `adapt-optimize-${Date.now()}`,
        analysis_type: 'strategy_optimization',
        sub_agent: 'StrategyOptimizer',
        lessons_learned: [],
        strategy_updates: optimizeResult.rule_updates || [],
        detection_improvements: optimizeResult.detection_improvements || [],
        fp_reduction: optimizeResult.fp_reduction,
        confidence_score: optimizeResult.confidence || 0.75,
      },
      'Medium',
      target,
      task.taskId
    );
  }

  /**
   * Sub-agent: StrategyOptimizer - Fine-tune AI models
   */
  private async tuneModels(task: Task): Promise<CyberEvent> {
    const target = task.target || 'swarm';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[StrategyOptimizer] Model tuning",
      `Sub-agent StrategyOptimizer fine-tuning detection and classification models based on recent incident data. Adjusting confidence thresholds and feature weights.`,
      { target, context, sub_agent: 'StrategyOptimizer' }
    );

    await this.delay(4000, 7000);

    const tuneResult = await this.getGeminiDecision<any>(
      PROMPTS.ADAPTATION_TUNE_MODELS(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[StrategyOptimizer] Model tuning results",
      `Tuned ${tuneResult.models_updated?.length || 0} models. Accuracy improvement: ${tuneResult.accuracy_improvement || 'measured'}. New confidence threshold: ${tuneResult.new_threshold || 'unchanged'}.`,
      {
        models: tuneResult.models_updated?.length,
        accuracy: tuneResult.accuracy_improvement,
        threshold: tuneResult.new_threshold,
        sub_agent: 'StrategyOptimizer',
      },
      tuneResult.confidence
    );

    return this.emitEvent(
      EventType.ADAPTATION_INSIGHT,
      {
        insight_id: `adapt-tune-${Date.now()}`,
        analysis_type: 'model_tuning',
        sub_agent: 'StrategyOptimizer',
        lessons_learned: [],
        strategy_updates: tuneResult.model_updates || [],
        models_updated: tuneResult.models_updated || [],
        accuracy_improvement: tuneResult.accuracy_improvement,
        detection_improvements: tuneResult.detection_improvements || [],
        confidence_score: tuneResult.confidence || 0.8,
      },
      'Low',
      target,
      task.taskId
    );
  }

  /**
   * Combined: Assess overall swarm health and trigger self-healing
   */
  private async assessSwarmHealth(task: Task): Promise<CyberEvent> {
    const target = task.target || 'swarm';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[IncidentLearner+StrategyOptimizer] Swarm health assessment",
      `Both sub-agents evaluating overall swarm health. Checking agent statuses, logic pipe throughput, event processing times, and reasoning chain integrity.`,
      { target, context, sub_agents: ['IncidentLearner', 'StrategyOptimizer'] }
    );

    await this.delay(3000, 5000);

    const healthResult = await this.getGeminiDecision<any>(
      PROMPTS.ADAPTATION_SWARM_HEALTH(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Swarm health assessment results",
      `Swarm status: ${healthResult.overall_status || 'unknown'}. Agents healthy: ${healthResult.agents_healthy || 0}/${healthResult.total_agents || 0}. Anomalies: ${healthResult.anomalies?.length || 0}.`,
      {
        status: healthResult.overall_status,
        healthy: healthResult.agents_healthy,
        total: healthResult.total_agents,
        anomalies: healthResult.anomalies?.length,
      },
      healthResult.confidence
    );

    // If anomalies detected, emit SWARM_ANOMALY for self-healing
    if (healthResult.anomalies?.length > 0) {
      this.emitEvent(
        EventType.SWARM_ANOMALY,
        {
          swarm_id: `swarm-${Date.now()}`,
          timestamp: new Date(),
          agents_healthy: healthResult.agents_healthy || 0,
          agents_degraded: healthResult.agents_degraded || 0,
          agents_failed: healthResult.agents_failed || 0,
          anomalies: healthResult.anomalies,
          overall_status: healthResult.overall_status || 'degraded',
        },
        healthResult.agents_failed > 0 ? 'Critical' : 'High',
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.ADAPTATION_INSIGHT,
      {
        insight_id: `adapt-health-${Date.now()}`,
        analysis_type: 'incident_learning',
        sub_agent: 'IncidentLearner',
        lessons_learned: healthResult.recommendations || [],
        strategy_updates: healthResult.strategy_updates || [],
        detection_improvements: healthResult.detection_improvements || [],
        swarm_health: {
          overall_status: healthResult.overall_status,
          agents_healthy: healthResult.agents_healthy,
          agents_degraded: healthResult.agents_degraded,
          agents_failed: healthResult.agents_failed,
          anomalies: healthResult.anomalies || [],
        },
        confidence_score: healthResult.confidence || 0.8,
      },
      healthResult.overall_status === 'critical' ? 'Critical' : 'Medium',
      target,
      task.taskId
    );
  }
}
