
// OSINT Agent - Open Source Intelligence gathering with Gemini AI (Red Team)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, OSINTData, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class OSINTAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'osint-01',
      'OSINT Reconnaissance Agent',
      'OSINTAgent',
      ['osint_collection', 'domain_analysis', 'employee_profiling', 'cert_log_analysis'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing OSINT request",
        `Received ${task.taskName} task for ${task.target || 'target'}. Using Gemini AI for intelligent open source intelligence gathering.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'osint_collection':
          return await this.osintCollection(task);
        case 'domain_analysis':
          return await this.domainAnalysis(task);
        case 'employee_profiling':
          return await this.employeeProfiling(task);
        case 'cert_log_analysis':
          return await this.certLogAnalysis(task);
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

  private async osintCollection(task: Task): Promise<CyberEvent> {
    const target = task.target || 'example.com';
    const context = task.details || {};

    const amassTool = this.getTool('amass');
    const shodanTool = this.getTool('shodan');
    const maltegoTool = this.getTool('maltego');

    this.logChainOfThought(
      2,
      "analysis",
      "OSINT collection strategy",
      `Gathering open source intelligence on ${target}. Using ${amassTool?.name || 'Amass'} for subdomain enumeration, ${shodanTool?.name || 'Shodan'} for exposed services, ${maltegoTool?.name || 'Maltego'} for entity relationships.`,
      { target, context, tools: ['amass', 'shodan', 'maltego'] }
    );

    if (amassTool) this.logToolUsage('amass', `amass enum -passive -d ${target}`, target, { mode: 'enum' }, task.taskId);
    if (shodanTool) this.logToolUsage('shodan', `shodan search hostname:${target}`, target, {}, task.taskId);

    await this.delay(2500, 4500);

    const osintResult = await this.getGeminiDecision<any>(
      PROMPTS.OSINT_COLLECTION(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "OSINT collection results",
      `Collected intelligence on ${target}. Found ${osintResult.subdomains?.length || 0} subdomains, ${osintResult.emails?.length || 0} email addresses, ${osintResult.exposed_services?.length || 0} exposed services.`,
      {
        subdomains: osintResult.subdomains?.length,
        emails: osintResult.emails?.length,
        exposed_services: osintResult.exposed_services?.length,
      },
      osintResult.confidence
    );

    await this.delay(1500, 2500);

    this.logChainOfThought(
      4,
      "evaluation",
      "Intelligence assessment",
      `OSINT assessment complete. Attack surface score: ${osintResult.attack_surface_score || 0}/10. ${osintResult.risk_indicators?.length || 0} risk indicators identified.`,
      {
        attack_surface_score: osintResult.attack_surface_score,
        risk_indicators: osintResult.risk_indicators,
      },
      osintResult.confidence
    );

    return this.emitEvent(
      EventType.OSINT_DATA_COLLECTED,
      {
        target,
        collection_type: 'osint_collection',
        subdomains: osintResult.subdomains || [],
        emails: osintResult.emails || [],
        exposed_services: osintResult.exposed_services || [],
        infrastructure: osintResult.infrastructure || {},
        risk_indicators: osintResult.risk_indicators || [],
        attack_surface_score: osintResult.attack_surface_score,
      },
      osintResult.attack_surface_score > 7 ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }

  private async domainAnalysis(task: Task): Promise<CyberEvent> {
    const target = task.target || 'example.com';
    const context = task.details || {};

    const amassTool = this.getTool('amass');

    this.logChainOfThought(
      2,
      "analysis",
      "Domain analysis",
      `Performing deep domain analysis on ${target}. Using ${amassTool?.name || 'Amass'} for DNS enumeration and certificate transparency log mining.`,
      { target, context, tools: ['amass', 'shodan'] }
    );

    if (amassTool) this.logToolUsage('amass', `amass intel -d ${target} -whois`, target, {}, task.taskId);

    await this.delay(3000, 5000);

    const analysis = await this.getGeminiDecision<any>(
      PROMPTS.OSINT_DOMAIN_ANALYSIS(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Domain analysis results",
      `Domain analysis complete. Found ${analysis.dns_records?.length || 0} DNS records, ${analysis.subdomains?.length || 0} subdomains, ${analysis.certificates?.length || 0} certificates.`,
      {
        dns_records: analysis.dns_records,
        subdomains: analysis.subdomains,
        whois_info: analysis.whois_info,
      },
      analysis.confidence
    );

    return this.emitEvent(
      EventType.OSINT_DATA_COLLECTED,
      {
        target,
        collection_type: 'domain_analysis',
        dns_records: analysis.dns_records || [],
        subdomains: analysis.subdomains || [],
        certificates: analysis.certificates || [],
        whois_info: analysis.whois_info,
        infrastructure: analysis.infrastructure || {},
        recommendations: analysis.recommendations || [],
      },
      'Medium',
      target,
      task.taskId
    );
  }

  private async employeeProfiling(task: Task): Promise<CyberEvent> {
    const target = task.target || 'example.com';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Employee profiling",
      `Gathering employee intelligence for ${target} from public sources. Identifying key personnel, roles, and potential phishing targets.`,
      { target, context }
    );

    await this.delay(2000, 4000);

    const profiling = await this.getGeminiDecision<any>(
      PROMPTS.OSINT_EMPLOYEE_PROFILING(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Employee profiling results",
      `Identified ${profiling.employees?.length || 0} employees. ${profiling.high_value_targets?.length || 0} high-value targets for social engineering.`,
      {
        employees_found: profiling.employees?.length,
        high_value_targets: profiling.high_value_targets?.length,
        email_pattern: profiling.email_pattern,
      },
      profiling.confidence
    );

    return this.emitEvent(
      EventType.OSINT_DATA_COLLECTED,
      {
        target,
        collection_type: 'employee_profiling',
        employees: profiling.employees || [],
        high_value_targets: profiling.high_value_targets || [],
        email_pattern: profiling.email_pattern,
        social_profiles: profiling.social_profiles || [],
        phishing_vectors: profiling.phishing_vectors || [],
      },
      'Medium',
      target,
      task.taskId
    );
  }

  private async certLogAnalysis(task: Task): Promise<CyberEvent> {
    const target = task.target || 'example.com';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "Certificate transparency log analysis",
      `Mining certificate transparency logs for ${target}. Discovering subdomains and infrastructure from CT logs.`,
      { target, context }
    );

    await this.delay(2000, 3500);

    const ctAnalysis = await this.getGeminiDecision<any>(
      PROMPTS.OSINT_DOMAIN_ANALYSIS(target, { ...context, focus: 'certificate_transparency' })
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "CT log analysis results",
      `Found ${ctAnalysis.certificates?.length || 0} certificates and ${ctAnalysis.subdomains?.length || 0} unique subdomains from CT logs.`,
      { certificates: ctAnalysis.certificates, subdomains: ctAnalysis.subdomains },
      ctAnalysis.confidence
    );

    return this.emitEvent(
      EventType.OSINT_DATA_COLLECTED,
      {
        target,
        collection_type: 'cert_log_analysis',
        certificates: ctAnalysis.certificates || [],
        subdomains: ctAnalysis.subdomains || [],
        infrastructure: ctAnalysis.infrastructure || {},
      },
      'Low',
      target,
      task.taskId
    );
  }
}
