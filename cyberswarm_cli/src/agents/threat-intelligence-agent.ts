
// Threat Intelligence Agent - Threat intel correlation with Gemini AI (Purple Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, ThreatIntelReport, CorrelatedIOC, MitreMapping, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class ThreatIntelligenceAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'threat-intel-01',
      'Threat Intelligence Agent',
      'ThreatIntelligenceAgent',
      ['correlate_iocs', 'profile_threat_actor', 'map_attack_campaign', 'enrich_indicators'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing threat intelligence request",
        `Received ${task.taskName} task. Using Gemini AI for threat intelligence correlation and enrichment.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'correlate_iocs':
          return await this.correlateIOCs(task);
        case 'profile_threat_actor':
          return await this.profileThreatActor(task);
        case 'map_attack_campaign':
          return await this.mapAttackCampaign(task);
        case 'enrich_indicators':
          return await this.enrichIndicators(task);
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

  private async correlateIOCs(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "IOC correlation analysis",
      `Correlating indicators of compromise from multiple sources for ${target}. Cross-referencing with threat intelligence feeds.`,
      { target, context }
    );

    await this.delay(2500, 4500);

    const correlation = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_INTEL_CORRELATE(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Correlation results",
      `Analyzed ${correlation.total_iocs || 0} indicators. ${correlation.correlated_iocs?.length || 0} correlated across sources. ${correlation.high_confidence_matches || 0} high-confidence matches.`,
      {
        total_iocs: correlation.total_iocs,
        correlated: correlation.correlated_iocs?.length,
        campaigns_identified: correlation.campaigns_identified,
      },
      correlation.confidence
    );

    await this.delay(1500, 2500);

    const correlatedIOCs: CorrelatedIOC[] = (correlation.correlated_iocs || []).map((ioc: any) => ({
      ioc_type: ioc.type,
      value: ioc.value,
      source: ioc.source,
      correlation_score: ioc.correlation_score,
      related_campaigns: ioc.related_campaigns || [],
    }));

    this.logChainOfThought(
      4,
      "evaluation",
      "Threat attribution",
      `IOC correlation suggests ${correlation.threat_attribution || 'unknown'} threat actor involvement. Confidence: ${correlation.attribution_confidence || 0}%.`,
      {
        attribution: correlation.threat_attribution,
        campaigns: correlation.campaigns_identified,
        correlated_iocs: correlatedIOCs.length,
      },
      correlation.confidence
    );

    if (correlatedIOCs.length > 0) {
      return this.emitEvent(
        EventType.IOC_CORRELATED,
        {
          target,
          correlated_iocs: correlatedIOCs,
          threat_attribution: correlation.threat_attribution,
          campaigns_identified: correlation.campaigns_identified,
          risk_assessment: correlation.risk_assessment,
          recommendations: correlation.recommendations,
        },
        correlation.high_confidence_matches > 0 ? 'High' : 'Medium',
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.THREAT_INTEL_REPORT,
      {
        target,
        analysis: correlation,
        status: 'no_correlation',
      },
      'Low',
      target,
      task.taskId
    );
  }

  private async profileThreatActor(task: Task): Promise<CyberEvent> {
    const target = task.target;
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Threat actor profiling",
      `Building threat actor profile based on observed TTPs and indicators. Correlating with known threat actor databases.`,
      { context }
    );

    await this.delay(3000, 5000);

    const profile = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_INTEL_PROFILE(context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Actor profile assessment",
      `Identified potential threat actor: ${profile.primary_actor || 'Unknown'}. Motivation: ${profile.motivation || 'Unknown'}. Capability level: ${profile.capability_level || 'Unknown'}.`,
      {
        primary_actor: profile.primary_actor,
        aliases: profile.aliases,
        motivation: profile.motivation,
        capability: profile.capability_level,
        ttps: profile.associated_ttps,
      },
      profile.confidence
    );

    this.logChainOfThought(
      4,
      "evaluation",
      "Predictive analysis",
      `Based on actor profile, likely next actions: ${profile.predicted_actions?.join(', ') || 'unknown'}. Recommended defensive priorities updated.`,
      {
        predicted_actions: profile.predicted_actions,
        defensive_priorities: profile.defensive_priorities,
      },
      profile.confidence
    );

    return this.emitEvent(
      EventType.THREAT_INTEL_REPORT,
      {
        report_type: 'threat_actor_profile',
        primary_actor: profile.primary_actor,
        aliases: profile.aliases,
        motivation: profile.motivation,
        capability_level: profile.capability_level,
        associated_ttps: profile.associated_ttps,
        predicted_actions: profile.predicted_actions,
        defensive_priorities: profile.defensive_priorities,
        historical_campaigns: profile.historical_campaigns,
      },
      profile.capability_level === 'advanced' ? 'Critical' : 'High',
      target,
      task.taskId
    );
  }

  private async mapAttackCampaign(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Attack campaign mapping",
      `Mapping observed activities to known attack campaigns. Constructing attack timeline and kill chain.`,
      { target, context }
    );

    await this.delay(3000, 5000);

    const campaign = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_INTEL_CAMPAIGN(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Campaign identification",
      `Identified campaign: ${campaign.campaign_name || 'Unknown'}. Kill chain progression: ${campaign.kill_chain_phase || 'Unknown'}. ${campaign.mitre_mappings?.length || 0} MITRE techniques mapped.`,
      {
        campaign_name: campaign.campaign_name,
        kill_chain_phase: campaign.kill_chain_phase,
        mitre_mappings: campaign.mitre_mappings,
        timeline: campaign.attack_timeline,
      },
      campaign.confidence
    );

    const mitreMappings: MitreMapping[] = (campaign.mitre_mappings || []).map((m: any) => ({
      technique_id: m.technique_id,
      technique_name: m.technique_name,
      tactic: m.tactic,
      observed: m.observed,
      detection_status: m.detection_status || 'PARTIAL',
    }));

    this.logChainOfThought(
      4,
      "evaluation",
      "Campaign intelligence summary",
      `Attack campaign analysis complete. Mapped to ${mitreMappings.length} MITRE techniques across ${new Set(mitreMappings.map(m => m.tactic)).size} tactics.`,
      { mitre_mappings: mitreMappings, overall_risk: campaign.overall_risk },
      campaign.confidence
    );

    return this.emitEvent(
      EventType.MITRE_MAPPING_COMPLETE,
      {
        target,
        campaign_name: campaign.campaign_name,
        kill_chain_phase: campaign.kill_chain_phase,
        mitre_mappings: mitreMappings,
        attack_timeline: campaign.attack_timeline,
        overall_risk: campaign.overall_risk,
        countermeasures: campaign.countermeasures,
      },
      campaign.overall_risk === 'critical' ? 'Critical' : 'High',
      target,
      task.taskId
    );
  }

  private async enrichIndicators(task: Task): Promise<CyberEvent> {
    const target = task.target;
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Indicator enrichment",
      `Enriching indicators with additional context from threat intelligence sources. Adding MITRE ATT&CK mappings and risk scores.`,
      { context }
    );

    await this.delay(2000, 3500);

    const enrichment = await this.getGeminiDecision<any>(
      PROMPTS.THREAT_INTEL_ENRICH(context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Enrichment results",
      `Enriched ${enrichment.indicators_enriched || 0} indicators. Added ${enrichment.new_context_items || 0} new context items. Risk score adjusted for ${enrichment.risk_adjustments || 0} indicators.`,
      {
        indicators_enriched: enrichment.indicators_enriched,
        enrichment_sources: enrichment.sources,
        risk_adjustments: enrichment.risk_adjustments,
      },
      enrichment.confidence
    );

    return this.emitEvent(
      EventType.THREAT_INTEL_REPORT,
      {
        report_type: 'indicator_enrichment',
        enriched_indicators: enrichment.enriched_indicators,
        sources: enrichment.sources,
        mitre_mappings: enrichment.mitre_mappings,
        risk_summary: enrichment.risk_summary,
        actionable_intelligence: enrichment.actionable_intelligence,
      },
      enrichment.risk_summary?.overall_risk === 'critical' ? 'Critical' :
      enrichment.risk_summary?.overall_risk === 'high' ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }
}
