
// Security Posture Assessment Agent - Defense gap analysis with Gemini AI (Purple Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, PostureAssessment, PostureGap, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class PostureAssessmentAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'posture-assess-01',
      'Security Posture Assessment Agent',
      'PostureAssessmentAgent',
      ['assess_posture', 'evaluate_controls', 'map_mitre_coverage', 'generate_scorecard'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing posture assessment request",
        `Received ${task.taskName} task. Using Gemini AI to evaluate security posture and identify defensive gaps.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'assess_posture':
          return await this.assessPosture(task);
        case 'evaluate_controls':
          return await this.evaluateControls(task);
        case 'map_mitre_coverage':
          return await this.mapMitreCoverage(task);
        case 'generate_scorecard':
          return await this.generateScorecard(task);
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

  private async assessPosture(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const availableTools = this.getAvailableTools();
    const nessusTool = this.getTool('nessus');
    const openvasTool = this.getTool('openvas');

    this.logChainOfThought(
      2,
      "analysis",
      "Comprehensive posture assessment",
      `Evaluating security posture for ${target} using ${availableTools.length} tools. Running ${nessusTool?.name || 'Nessus'} compliance audit, ${openvasTool?.name || 'OpenVAS'} vulnerability assessment, and detection engineering validation.`,
      { target, context, tools: availableTools.map(t => t.id) }
    );

    if (nessusTool) this.logToolUsage('nessus', 'nessus-scan --policy compliance-audit --target', target, { scanPolicy: 'Compliance' }, task.taskId);
    if (openvasTool) this.logToolUsage('openvas', 'omp --xml "<create_task><config id=full-and-fast/>"', target, {}, task.taskId);

    await this.delay(3000, 5000);

    const assessment = await this.getGeminiDecision<any>(
      PROMPTS.POSTURE_ASSESSMENT(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Security posture scoring",
      `Overall security score: ${assessment.overall_score}/100. Detection coverage: ${assessment.detection_coverage}%. Response readiness: ${assessment.response_readiness}%.`,
      {
        overall_score: assessment.overall_score,
        detection_coverage: assessment.detection_coverage,
        response_readiness: assessment.response_readiness,
        categories: assessment.category_scores,
      },
      assessment.confidence
    );

    await this.delay(2000, 3000);

    const gaps: PostureGap[] = (assessment.gaps || []).map((g: any) => ({
      area: g.area,
      severity: g.severity,
      description: g.description,
      mitre_techniques_uncovered: g.mitre_techniques_uncovered || [],
      remediation: g.remediation,
    }));

    this.logChainOfThought(
      4,
      "evaluation",
      "Gap analysis",
      `Identified ${gaps.length} security gaps. ${gaps.filter(g => g.severity === 'Critical' || g.severity === 'High').length} are high priority.`,
      { gaps_summary: gaps.map(g => ({ area: g.area, severity: g.severity })) },
      assessment.confidence
    );

    const posture: PostureAssessment = {
      assessment_id: `posture-${Date.now()}`,
      overall_score: assessment.overall_score,
      detection_coverage: assessment.detection_coverage,
      response_readiness: assessment.response_readiness,
      gap_analysis: gaps,
      recommendations: assessment.recommendations || [],
      mitre_coverage: assessment.mitre_coverage || {},
    };

    if (gaps.some(g => g.severity === 'Critical')) {
      return this.emitEvent(
        EventType.DETECTION_GAP_FOUND,
        posture,
        'Critical',
        target,
        task.taskId
      );
    }

    return this.emitEvent(
      EventType.POSTURE_ASSESSMENT_COMPLETE,
      posture,
      assessment.overall_score < 50 ? 'High' : assessment.overall_score < 75 ? 'Medium' : 'Low',
      target,
      task.taskId
    );
  }

  private async evaluateControls(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const atomicTool = this.getTool('atomic-red-team');
    const calderaTool = this.getTool('caldera');
    const suricataTool = this.getTool('suricata');

    this.logChainOfThought(
      2,
      "analysis",
      "Security controls evaluation",
      `Evaluating security controls on ${target}. Using ${atomicTool?.name || 'Atomic Red Team'} to test detection rules, ${calderaTool?.name || 'MITRE Caldera'} for adversary emulation, ${suricataTool?.name || 'Suricata'} IDS rule validation.`,
      { target, context, tools: ['atomic-red-team', 'caldera', 'suricata'] }
    );

    if (atomicTool) this.logToolUsage('atomic-red-team', 'Invoke-AtomicTest -All -GetPrereqs', target, {}, task.taskId);

    await this.delay(2500, 4000);

    const controlEval = await this.getGeminiDecision<any>(
      PROMPTS.POSTURE_CONTROLS(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Controls effectiveness assessment",
      `Evaluated ${controlEval.controls_evaluated?.length || 0} security controls. Average effectiveness: ${controlEval.average_effectiveness || 0}%.`,
      {
        controls: controlEval.controls_evaluated,
        effectiveness: controlEval.average_effectiveness,
        failing_controls: controlEval.failing_controls,
      },
      controlEval.confidence
    );

    this.logChainOfThought(
      4,
      "evaluation",
      "Control recommendations",
      `Generated ${controlEval.recommendations?.length || 0} improvement recommendations.`,
      { recommendations: controlEval.recommendations },
      controlEval.confidence
    );

    return this.emitEvent(
      EventType.POSTURE_ASSESSMENT_COMPLETE,
      {
        target,
        controls_evaluated: controlEval.controls_evaluated,
        average_effectiveness: controlEval.average_effectiveness,
        failing_controls: controlEval.failing_controls,
        recommendations: controlEval.recommendations,
      },
      controlEval.average_effectiveness < 50 ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }

  private async mapMitreCoverage(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const sigmaTool = this.getTool('sigma');
    const nucleiTool = this.getTool('nuclei');

    this.logChainOfThought(
      2,
      "analysis",
      "MITRE ATT&CK coverage mapping",
      `Mapping capabilities to MITRE ATT&CK for ${target}. Cross-referencing ${sigmaTool?.name || 'Sigma'} detection rules and ${nucleiTool?.name || 'Nuclei'} templates against technique IDs.`,
      { target, context, tools: ['sigma', 'nuclei', 'elastic-siem', 'caldera'] }
    );

    if (sigmaTool) this.logToolUsage('sigma', 'sigma-cli convert --target splunk --pipeline sysmon', target, {}, task.taskId);

    await this.delay(3000, 5000);

    const mitreCoverage = await this.getGeminiDecision<any>(
      PROMPTS.POSTURE_MITRE_COVERAGE(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "MITRE coverage analysis",
      `Analyzed ${mitreCoverage.techniques_mapped?.length || 0} MITRE ATT&CK techniques. Overall coverage: ${mitreCoverage.overall_coverage || 0}%.`,
      {
        coverage_by_tactic: mitreCoverage.coverage_by_tactic,
        uncovered_techniques: mitreCoverage.uncovered_techniques,
        overall_coverage: mitreCoverage.overall_coverage,
      },
      mitreCoverage.confidence
    );

    this.logChainOfThought(
      4,
      "evaluation",
      "Priority coverage gaps",
      `Identified ${mitreCoverage.priority_gaps?.length || 0} priority gaps in MITRE ATT&CK coverage requiring immediate attention.`,
      { priority_gaps: mitreCoverage.priority_gaps },
      mitreCoverage.confidence
    );

    return this.emitEvent(
      EventType.MITRE_MAPPING_COMPLETE,
      {
        target,
        techniques_mapped: mitreCoverage.techniques_mapped,
        coverage_by_tactic: mitreCoverage.coverage_by_tactic,
        uncovered_techniques: mitreCoverage.uncovered_techniques,
        overall_coverage: mitreCoverage.overall_coverage,
        priority_gaps: mitreCoverage.priority_gaps,
        recommendations: mitreCoverage.recommendations,
      },
      mitreCoverage.overall_coverage < 50 ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }

  private async generateScorecard(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const availableTools = this.getAvailableTools();

    this.logChainOfThought(
      2,
      "analysis",
      "Security scorecard generation",
      `Generating security scorecard for ${target}. Aggregating results from ${availableTools.length} security tools across vulnerability scanning, detection engineering, and network monitoring categories.`,
      { target, context, tools: availableTools.map(t => t.id) }
    );

    await this.delay(2000, 4000);

    const scorecard = await this.getGeminiDecision<any>(
      PROMPTS.POSTURE_SCORECARD(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Scorecard results",
      `Security Scorecard: Overall ${scorecard.overall_grade || 'N/A'} (${scorecard.overall_score || 0}/100). Key metrics compiled across ${scorecard.categories?.length || 0} categories.`,
      {
        overall_grade: scorecard.overall_grade,
        overall_score: scorecard.overall_score,
        categories: scorecard.categories,
        trend: scorecard.trend,
      },
      scorecard.confidence
    );

    return this.emitEvent(
      EventType.POSTURE_ASSESSMENT_COMPLETE,
      {
        target,
        scorecard,
        assessment_type: 'scorecard',
      },
      scorecard.overall_score < 50 ? 'High' : scorecard.overall_score < 75 ? 'Medium' : 'Low',
      target,
      task.taskId
    );
  }
}
