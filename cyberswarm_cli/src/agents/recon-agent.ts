
// Recon Agent - Network scanning, footprinting, and vulnerability identification (Red Team)
// Sub-agents: NetworkScanner (port/service enumeration), WebCrawler (web asset discovery)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class ReconAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'recon-01',
      'Reconnaissance Agent',
      'ReconAgent',
      ['network_scan', 'service_enumeration', 'web_crawl', 'footprint_target'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing reconnaissance request",
        `Received ${task.taskName} task for ${task.target || 'target'}. Deploying sub-agents for parallel reconnaissance.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'network_scan':
          return await this.networkScan(task);
        case 'service_enumeration':
          return await this.serviceEnumeration(task);
        case 'web_crawl':
          return await this.webCrawl(task);
        case 'footprint_target':
          return await this.footprintTarget(task);
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
   * Sub-agent: NetworkScanner - Port and service enumeration
   */
  private async networkScan(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    const nmapTool = this.getTool('nmap');
    const masscanTool = this.getTool('masscan');

    this.logChainOfThought(
      2,
      "analysis",
      "[NetworkScanner] Port scanning strategy",
      `Sub-agent NetworkScanner deploying ${nmapTool?.name || 'Nmap'} for comprehensive port scanning on ${target}. Using ${masscanTool?.name || 'Masscan'} for rapid initial sweep.`,
      { target, context, sub_agent: 'NetworkScanner', tools: ['nmap', 'masscan'] }
    );

    if (masscanTool) this.logToolUsage('masscan', `masscan ${target} -p1-65535 --rate 1000`, target, { rate: 1000 }, task.taskId);
    if (nmapTool) this.logToolUsage('nmap', `nmap -sS -sV -O ${target}`, target, { scanType: '-sS', serviceDetection: '-sV' }, task.taskId);

    await this.delay(3000, 5000);

    const scanResult = await this.getGeminiDecision<any>(
      PROMPTS.RECON_NETWORK_SCAN(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[NetworkScanner] Scan results",
      `Discovered ${scanResult.hosts_discovered || 0} live hosts with ${scanResult.services_found?.length || 0} services. ${scanResult.vulnerabilities_hinted?.length || 0} potential vulnerabilities identified.`,
      {
        hosts: scanResult.hosts_discovered,
        services: scanResult.services_found?.length,
        sub_agent: 'NetworkScanner',
      },
      scanResult.confidence
    );

    return this.emitEvent(
      EventType.RECON_SCAN_COMPLETE,
      {
        scan_id: `recon-${Date.now()}`,
        target,
        scan_type: 'port_scan',
        sub_agent: 'NetworkScanner',
        hosts_discovered: scanResult.hosts_discovered || 0,
        services_found: scanResult.services_found || [],
        vulnerabilities_hinted: scanResult.vulnerabilities_hinted || [],
      },
      scanResult.hosts_discovered > 10 ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }

  /**
   * Sub-agent: NetworkScanner - Detailed service enumeration
   */
  private async serviceEnumeration(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.1';
    const context = task.details || {};

    const nmapTool = this.getTool('nmap');

    this.logChainOfThought(
      2,
      "analysis",
      "[NetworkScanner] Service enumeration",
      `Sub-agent NetworkScanner performing deep service enumeration on ${target} with version detection, OS fingerprinting, and NSE scripts.`,
      { target, context, sub_agent: 'NetworkScanner', tools: ['nmap'] }
    );

    if (nmapTool) this.logToolUsage('nmap', `nmap -sV -sC -O --version-all ${target}`, target, { scripts: 'default' }, task.taskId);

    await this.delay(3500, 6000);

    const enumResult = await this.getGeminiDecision<any>(
      PROMPTS.RECON_SERVICE_ENUM(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[NetworkScanner] Enumeration results",
      `Enumerated ${enumResult.services_found?.length || 0} services with detailed version info. OS identified: ${enumResult.os_detected || 'unknown'}.`,
      {
        services: enumResult.services_found,
        os: enumResult.os_detected,
        sub_agent: 'NetworkScanner',
      },
      enumResult.confidence
    );

    return this.emitEvent(
      EventType.RECON_SCAN_COMPLETE,
      {
        scan_id: `recon-enum-${Date.now()}`,
        target,
        scan_type: 'service_enum',
        sub_agent: 'NetworkScanner',
        hosts_discovered: 1,
        services_found: enumResult.services_found || [],
        os_detected: enumResult.os_detected,
        vulnerabilities_hinted: enumResult.vulnerabilities_hinted || [],
      },
      'Medium',
      target,
      task.taskId
    );
  }

  /**
   * Sub-agent: WebCrawler - Web asset and OSINT discovery
   */
  private async webCrawl(task: Task): Promise<CyberEvent> {
    const target = task.target || 'example.com';
    const context = task.details || {};

    const amassTool = this.getTool('amass');

    this.logChainOfThought(
      2,
      "analysis",
      "[WebCrawler] Web reconnaissance",
      `Sub-agent WebCrawler scanning web assets for ${target}. Discovering directories, APIs, technologies, and exposed endpoints using ${amassTool?.name || 'Amass'}.`,
      { target, context, sub_agent: 'WebCrawler', tools: ['amass', 'nuclei'] }
    );

    if (amassTool) this.logToolUsage('amass', `amass enum -d ${target} -active`, target, { mode: 'enum' }, task.taskId);

    await this.delay(3000, 5500);

    const crawlResult = await this.getGeminiDecision<any>(
      PROMPTS.RECON_WEB_CRAWL(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[WebCrawler] Web crawl results",
      `Discovered ${crawlResult.web_assets?.length || 0} web assets, ${crawlResult.directories_found?.length || 0} directories, ${crawlResult.apis_found?.length || 0} API endpoints.`,
      {
        web_assets: crawlResult.web_assets?.length,
        directories: crawlResult.directories_found?.length,
        apis: crawlResult.apis_found?.length,
        sub_agent: 'WebCrawler',
      },
      crawlResult.confidence
    );

    return this.emitEvent(
      EventType.RECON_SCAN_COMPLETE,
      {
        scan_id: `recon-web-${Date.now()}`,
        target,
        scan_type: 'web_crawl',
        sub_agent: 'WebCrawler',
        hosts_discovered: 1,
        web_assets: crawlResult.web_assets || [],
        directories_found: crawlResult.directories_found || [],
        apis_found: crawlResult.apis_found || [],
        technologies: crawlResult.technologies || [],
        services_found: [],
        vulnerabilities_hinted: crawlResult.vulnerabilities_hinted || [],
      },
      crawlResult.apis_found?.length > 5 ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }

  /**
   * Combined footprinting using both sub-agents
   */
  private async footprintTarget(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[NetworkScanner+WebCrawler] Full footprinting",
      `Deploying both sub-agents for comprehensive target footprinting on ${target}. NetworkScanner handles infrastructure, WebCrawler handles web assets.`,
      { target, context, sub_agents: ['NetworkScanner', 'WebCrawler'] }
    );

    this.logToolUsage('nmap', `nmap -sS -sV -O -A ${target}`, target, {}, task.taskId);
    this.logToolUsage('amass', `amass enum -d ${target}`, target, {}, task.taskId);

    await this.delay(4000, 7000);

    const footprintResult = await this.getGeminiDecision<any>(
      PROMPTS.RECON_FOOTPRINT(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Full footprint results",
      `Complete footprint: ${footprintResult.hosts_discovered || 0} hosts, ${footprintResult.services_found?.length || 0} services, ${footprintResult.web_assets?.length || 0} web assets. Attack surface score: ${footprintResult.attack_surface_score || 0}/10.`,
      {
        hosts: footprintResult.hosts_discovered,
        services: footprintResult.services_found?.length,
        web_assets: footprintResult.web_assets?.length,
        attack_surface: footprintResult.attack_surface_score,
      },
      footprintResult.confidence
    );

    // Also emit OSINT data for enrichment pipeline
    this.emitEvent(
      EventType.OSINT_DATA_COLLECTED,
      {
        target,
        collection_type: 'osint_collection',
        subdomains: footprintResult.subdomains || [],
        infrastructure: footprintResult.infrastructure || {},
      },
      'Medium',
      target,
      task.taskId
    );

    return this.emitEvent(
      EventType.RECON_SCAN_COMPLETE,
      {
        scan_id: `recon-footprint-${Date.now()}`,
        target,
        scan_type: 'footprint',
        sub_agent: 'NetworkScanner',
        hosts_discovered: footprintResult.hosts_discovered || 0,
        services_found: footprintResult.services_found || [],
        web_assets: footprintResult.web_assets || [],
        vulnerabilities_hinted: footprintResult.vulnerabilities_hinted || [],
        attack_surface_score: footprintResult.attack_surface_score,
      },
      footprintResult.attack_surface_score > 7 ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }
}
