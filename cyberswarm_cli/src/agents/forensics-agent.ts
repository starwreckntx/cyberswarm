
// Forensics Agent - Post-incident evidence collection and analysis (Blue Team)
// Sub-agents: MemoryAnalyzer (volatile data examination), FileInvestigator (artifact extraction)

import { BaseAgent } from './base-agent.js';
import { Task, CyberEvent, EventType } from '../types.js';
import { GeminiClient } from '../gemini/gemini-client.js';
import { PROMPTS } from '../gemini/prompts.js';
import { logger } from '../utils/logger.js';

export class ForensicsAgent extends BaseAgent {
  constructor(geminiClient: GeminiClient) {
    super(
      'forensics-01',
      'Digital Forensics Agent',
      'ForensicsAgent',
      ['analyze_memory', 'investigate_files', 'build_timeline', 'collect_evidence'],
      geminiClient
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");

    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing forensics request",
        `Received ${task.taskName} task for ${task.target || 'target'}. Deploying forensic sub-agents for evidence collection and analysis.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'analyze_memory':
          return await this.analyzeMemory(task);
        case 'investigate_files':
          return await this.investigateFiles(task);
        case 'build_timeline':
          return await this.buildTimeline(task);
        case 'collect_evidence':
          return await this.collectEvidence(task);
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
   * Sub-agent: MemoryAnalyzer - Volatile data examination
   */
  private async analyzeMemory(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    const volatilityTool = this.getTool('volatility');
    const velociraptorTool = this.getTool('velociraptor');

    this.logChainOfThought(
      2,
      "analysis",
      "[MemoryAnalyzer] Memory forensics",
      `Sub-agent MemoryAnalyzer examining volatile memory on ${target}. Using ${volatilityTool?.name || 'Volatility 3'} for process analysis, DLL injection detection, and rootkit scanning.`,
      { target, context, sub_agent: 'MemoryAnalyzer', tools: ['volatility', 'velociraptor'] }
    );

    if (volatilityTool) this.logToolUsage('volatility', `vol3 -f memdump.raw windows.pslist windows.netscan windows.malfind`, target, {}, task.taskId);
    if (velociraptorTool) this.logToolUsage('velociraptor', `velociraptor collect -a Windows.Memory.Acquisition`, target, {}, task.taskId);

    await this.delay(4000, 7000);

    const memResult = await this.getGeminiDecision<any>(
      PROMPTS.FORENSICS_MEMORY_ANALYSIS(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[MemoryAnalyzer] Memory analysis results",
      `Found ${memResult.suspicious_processes?.length || 0} suspicious processes, ${memResult.injected_dlls?.length || 0} injected DLLs, ${memResult.network_connections?.length || 0} suspicious network connections.`,
      {
        processes: memResult.suspicious_processes?.length,
        injections: memResult.injected_dlls?.length,
        connections: memResult.network_connections?.length,
        sub_agent: 'MemoryAnalyzer',
      },
      memResult.confidence
    );

    return this.emitEvent(
      EventType.FORENSIC_ANALYSIS_COMPLETE,
      {
        analysis_id: `forensics-mem-${Date.now()}`,
        target,
        analysis_type: 'memory',
        sub_agent: 'MemoryAnalyzer',
        evidence_collected: memResult.evidence || [],
        suspicious_processes: memResult.suspicious_processes || [],
        injected_dlls: memResult.injected_dlls || [],
        network_connections: memResult.network_connections || [],
        root_cause: memResult.root_cause,
        timeline: memResult.timeline || [],
        iocs_discovered: memResult.iocs || [],
        recommendations: memResult.recommendations || [],
      },
      memResult.suspicious_processes?.length > 0 ? 'High' : 'Medium',
      target,
      task.taskId
    );
  }

  /**
   * Sub-agent: FileInvestigator - Artifact extraction and hashing
   */
  private async investigateFiles(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    const autopsyTool = this.getTool('autopsy');
    const yaraTool = this.getTool('yara');

    this.logChainOfThought(
      2,
      "analysis",
      "[FileInvestigator] File system forensics",
      `Sub-agent FileInvestigator examining file system artifacts on ${target}. Using ${autopsyTool?.name || 'Autopsy'} for disk analysis and ${yaraTool?.name || 'YARA'} for malware scanning.`,
      { target, context, sub_agent: 'FileInvestigator', tools: ['autopsy', 'yara'] }
    );

    if (autopsyTool) this.logToolUsage('autopsy', `autopsy --case forensic-${Date.now()} --image disk.img`, target, {}, task.taskId);
    if (yaraTool) this.logToolUsage('yara', `yara -r malware_rules.yar /suspicious/path`, target, { recursive: true }, task.taskId);

    await this.delay(4000, 7000);

    const fileResult = await this.getGeminiDecision<any>(
      PROMPTS.FORENSICS_FILE_INVESTIGATION(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "[FileInvestigator] File investigation results",
      `Found ${fileResult.artifacts?.length || 0} artifacts, ${fileResult.malware_matches?.length || 0} YARA matches, ${fileResult.deleted_files_recovered?.length || 0} recovered deleted files.`,
      {
        artifacts: fileResult.artifacts?.length,
        malware: fileResult.malware_matches?.length,
        recovered: fileResult.deleted_files_recovered?.length,
        sub_agent: 'FileInvestigator',
      },
      fileResult.confidence
    );

    return this.emitEvent(
      EventType.FORENSIC_ANALYSIS_COMPLETE,
      {
        analysis_id: `forensics-file-${Date.now()}`,
        target,
        analysis_type: 'disk',
        sub_agent: 'FileInvestigator',
        evidence_collected: fileResult.artifacts || [],
        malware_matches: fileResult.malware_matches || [],
        deleted_files_recovered: fileResult.deleted_files_recovered || [],
        file_hashes: fileResult.file_hashes || [],
        root_cause: fileResult.root_cause,
        timeline: fileResult.timeline || [],
        iocs_discovered: fileResult.iocs || [],
        recommendations: fileResult.recommendations || [],
      },
      fileResult.malware_matches?.length > 0 ? 'Critical' : 'Medium',
      target,
      task.taskId
    );
  }

  /**
   * Combined: Build comprehensive incident timeline
   */
  private async buildTimeline(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    this.logChainOfThought(
      2,
      "analysis",
      "[MemoryAnalyzer+FileInvestigator] Timeline reconstruction",
      `Both sub-agents contributing to incident timeline for ${target}. Correlating memory artifacts with disk evidence.`,
      { target, context, sub_agents: ['MemoryAnalyzer', 'FileInvestigator'] }
    );

    this.logToolUsage('volatility', `vol3 -f memdump.raw timeliner.TimeLiner`, target, {}, task.taskId);
    this.logToolUsage('autopsy', `autopsy --timeline --case forensic`, target, {}, task.taskId);

    await this.delay(5000, 8000);

    const timelineResult = await this.getGeminiDecision<any>(
      PROMPTS.FORENSICS_TIMELINE(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Timeline reconstruction results",
      `Reconstructed ${timelineResult.events?.length || 0} timeline events. Initial compromise: ${timelineResult.initial_compromise || 'unknown'}. Attack duration: ${timelineResult.attack_duration || 'unknown'}.`,
      {
        events: timelineResult.events?.length,
        initial_compromise: timelineResult.initial_compromise,
        attack_duration: timelineResult.attack_duration,
      },
      timelineResult.confidence
    );

    return this.emitEvent(
      EventType.FORENSIC_ANALYSIS_COMPLETE,
      {
        analysis_id: `forensics-timeline-${Date.now()}`,
        target,
        analysis_type: 'timeline',
        sub_agent: 'MemoryAnalyzer',
        evidence_collected: [],
        root_cause: timelineResult.root_cause,
        initial_compromise: timelineResult.initial_compromise,
        attack_duration: timelineResult.attack_duration,
        timeline: timelineResult.events || [],
        iocs_discovered: timelineResult.iocs || [],
        recommendations: timelineResult.recommendations || [],
      },
      'High',
      target,
      task.taskId
    );
  }

  /**
   * Combined: Full evidence collection operation
   */
  private async collectEvidence(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.100';
    const context = task.details || {};

    const grrTool = this.getTool('grr');

    this.logChainOfThought(
      2,
      "analysis",
      "[MemoryAnalyzer+FileInvestigator] Evidence collection",
      `Full evidence collection from ${target}. Using ${grrTool?.name || 'GRR'} for remote acquisition, then deploying both sub-agents for analysis.`,
      { target, context, sub_agents: ['MemoryAnalyzer', 'FileInvestigator'], tools: ['grr', 'volatility', 'autopsy'] }
    );

    if (grrTool) this.logToolUsage('grr', `grr_client --collect artifacts --target ${target}`, target, {}, task.taskId);
    this.logToolUsage('volatility', `vol3 -f memdump.raw windows.pslist windows.malfind`, target, {}, task.taskId);
    this.logToolUsage('autopsy', `autopsy --ingest --case evidence-${Date.now()}`, target, {}, task.taskId);

    await this.delay(5000, 9000);

    const evidenceResult = await this.getGeminiDecision<any>(
      PROMPTS.FORENSICS_EVIDENCE_COLLECTION(target, context)
    );

    this.logChainOfThought(
      3,
      "evaluation",
      "Evidence collection results",
      `Collected ${evidenceResult.evidence_items?.length || 0} evidence items. Chain of custody preserved: ${evidenceResult.chain_preserved !== false}. ${evidenceResult.iocs?.length || 0} IOCs discovered.`,
      {
        evidence: evidenceResult.evidence_items?.length,
        chain_preserved: evidenceResult.chain_preserved,
        iocs: evidenceResult.iocs?.length,
      },
      evidenceResult.confidence
    );

    return this.emitEvent(
      EventType.FORENSIC_ANALYSIS_COMPLETE,
      {
        analysis_id: `forensics-evidence-${Date.now()}`,
        target,
        analysis_type: 'disk',
        sub_agent: 'FileInvestigator',
        evidence_collected: evidenceResult.evidence_items || [],
        chain_of_custody: evidenceResult.chain_preserved !== false,
        root_cause: evidenceResult.root_cause,
        timeline: evidenceResult.timeline || [],
        iocs_discovered: evidenceResult.iocs || [],
        recommendations: evidenceResult.recommendations || [],
      },
      'High',
      target,
      task.taskId
    );
  }
}
