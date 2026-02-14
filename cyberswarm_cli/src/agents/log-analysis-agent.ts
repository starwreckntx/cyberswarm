
// Log Analysis Agent - Log collection, parsing, and anomaly detection with Gemini AI (Blue Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, LogAnalysisResult, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class LogAnalysisAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'log-analysis-01',
      'Log Analysis Agent',
      'LogAnalysisAgent',
      ['log_collection', 'log_parsing', 'log_anomaly_detection'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing log analysis request",
        `Received ${task.taskName} task. Using Gemini AI for intelligent log correlation and anomaly detection.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'log_collection':
          return await this.logCollection(task);
        case 'log_parsing':
          return await this.logParsing(task);
        case 'log_anomaly_detection':
          return await this.logAnomalyDetection(task);
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

  private async logCollection(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const elasticTool = this.getTool('elastic-siem');

    this.logChainOfThought(
      2,
      "analysis",
      "Log collection",
      `Collecting logs from ${target}. Using ${elasticTool?.name || 'Elastic SIEM'} for centralized log aggregation across syslog, Windows Event, and application log sources.`,
      { target, context, tools: ['elastic-siem'] }
    );

    if (elasticTool) this.logToolUsage('elastic-siem', 'filebeat modules enable system,windows,auditd', target, {}, task.taskId);

    await this.delay(2000, 3500);

    const collection = await this.getGeminiDecision<any>(
      PROMPTS.LOG_ANALYSIS_COLLECT(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Log collection results",
      `Collected ${collection.total_events || 0} events from ${collection.log_sources?.length || 0} sources. Time span: ${collection.time_span || 'unknown'}.`,
      {
        total_events: collection.total_events,
        log_sources: collection.log_sources,
        event_types: collection.event_types,
      },
      collection.confidence
    );

    return this.emitEvent(
      EventType.MONITORING_COMPLETE,
      {
        target,
        analysis_type: 'log_collection',
        total_events: collection.total_events,
        log_sources: collection.log_sources,
        event_breakdown: collection.event_breakdown,
        notable_entries: collection.notable_entries,
      },
      'Low',
      target,
      task.taskId
    );
  }

  private async logParsing(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const elasticTool = this.getTool('elastic-siem');

    this.logChainOfThought(
      2,
      "analysis",
      "Log parsing and normalization",
      `Parsing and normalizing logs from ${target}. Using ${elasticTool?.name || 'Elastic SIEM'} Logstash pipelines for structured field extraction and event normalization.`,
      { target, context, tools: ['elastic-siem'] }
    );

    if (elasticTool) this.logToolUsage('elastic-siem', 'logstash -f /etc/logstash/conf.d/normalize.conf', target, {}, task.taskId);

    await this.delay(2500, 4000);

    const parsing = await this.getGeminiDecision<any>(
      PROMPTS.LOG_ANALYSIS_PARSE(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Log parsing results",
      `Parsed ${parsing.events_parsed || 0} events. Normalized to ${parsing.normalized_format || 'ECS'} format. ${parsing.parsing_errors || 0} parsing errors encountered.`,
      {
        events_parsed: parsing.events_parsed,
        normalized_format: parsing.normalized_format,
        field_mappings: parsing.field_mappings,
      },
      parsing.confidence
    );

    if (parsing.suspicious_patterns?.length > 0) {
      return this.emitEvent(
        EventType.LOG_ANOMALY_DETECTED,
        {
          target,
          analysis_type: 'log_parsing',
          events_parsed: parsing.events_parsed,
          suspicious_patterns: parsing.suspicious_patterns,
          correlated_events: parsing.correlated_events,
        },
        'Medium',
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.MONITORING_COMPLETE,
      {
        target,
        analysis_type: 'log_parsing',
        events_parsed: parsing.events_parsed,
        field_mappings: parsing.field_mappings,
      },
      'Low',
      target,
      task.taskId
    );
  }

  private async logAnomalyDetection(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const elasticTool = this.getTool('elastic-siem');
    const sigmaTool = this.getTool('sigma');

    this.logChainOfThought(
      2,
      "analysis",
      "Log anomaly detection",
      `Running anomaly detection on logs from ${target}. Applying ${sigmaTool?.name || 'Sigma'} detection rules and ${elasticTool?.name || 'Elastic SIEM'} ML anomaly jobs for behavioral baselining.`,
      { target, context, tools: ['elastic-siem', 'sigma'] }
    );

    if (sigmaTool) this.logToolUsage('sigma', 'sigmac -t elasticsearch --backend-config siem.yml', target, {}, task.taskId);
    if (elasticTool) this.logToolUsage('elastic-siem', 'POST _ml/anomaly_detectors/security_events/_open', target, {}, task.taskId);

    await this.delay(3000, 5000);

    const anomalies = await this.getGeminiDecision<any>(
      PROMPTS.LOG_ANALYSIS_ANOMALY(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Anomaly detection results",
      `Analyzed ${anomalies.events_analyzed || 0} log events. Detected ${anomalies.anomalies?.length || 0} anomalies. ${anomalies.sigma_rule_matches || 0} Sigma rule matches.`,
      {
        events_analyzed: anomalies.events_analyzed,
        anomalies_detected: anomalies.anomalies?.length,
        sigma_matches: anomalies.sigma_rule_matches,
        correlation_chains: anomalies.correlation_chains,
      },
      anomalies.confidence
    );

    await this.delay(1500, 2500);

    this.logChainOfThought(
      4,
      "evaluation",
      "Threat assessment",
      `Threat assessment: ${anomalies.threat_level || 'unknown'}. ${anomalies.attack_indicators?.length || 0} attack indicators found. ${anomalies.correlated_with_known_ttps ? 'Correlated with known TTPs.' : 'No known TTP correlation.'}`,
      {
        threat_level: anomalies.threat_level,
        attack_indicators: anomalies.attack_indicators,
        correlated_ttps: anomalies.correlated_with_known_ttps,
      },
      anomalies.confidence
    );

    if (anomalies.anomalies?.length > 0 && anomalies.threat_level !== 'low') {
      return this.emitEvent(
        EventType.INTRUSION_DETECTED,
        {
          analysis_id: `log-anomaly-${Date.now()}`,
          log_sources: anomalies.log_sources || [],
          events_analyzed: anomalies.events_analyzed,
          anomalies_found: anomalies.anomalies?.length,
          anomalies: anomalies.anomalies,
          sigma_rule_matches: anomalies.sigma_rule_matches,
          correlation_chains: anomalies.correlation_chains,
          attack_indicators: anomalies.attack_indicators,
          threat_level: anomalies.threat_level,
          recommended_actions: anomalies.recommended_actions,
        },
        anomalies.threat_level === 'critical' ? 'Critical' :
        anomalies.threat_level === 'high' ? 'High' : 'Medium',
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.MONITORING_COMPLETE,
      {
        target,
        analysis_type: 'log_anomaly_detection',
        events_analyzed: anomalies.events_analyzed,
        anomalies_found: anomalies.anomalies?.length || 0,
        status: 'no_threats_detected',
      },
      'Low',
      target,
      task.taskId
    );
  }
}
