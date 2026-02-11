// CyberSwarm CLI - Type Definitions

export type AgentStatus = "IDLE" | "BUSY" | "ERROR" | "OFFLINE";
export type TaskStatus = "PENDING" | "ASSIGNED" | "EXECUTING" | "COMPLETED" | "FAILED";
export type Severity = "Critical" | "High" | "Medium" | "Low";

// Agent Types
export interface Agent {
  id: string;
  agentId: string;
  agentName: string;
  agentType: string;
  supportedTasks: string[];
  status: AgentStatus;
  lastSeen: Date;
  registeredAt: Date;
}

// Task Types
export interface Task {
  id: string;
  taskId: string;
  agentType: string;
  taskName: string;
  target?: string;
  details?: any;
  status: TaskStatus;
  priority: number;
  createdAt: Date;
  assignedAt?: Date;
  completedAt?: Date;
  agentId?: string;
}

// Event Types
export interface CyberEvent {
  id: string;
  eventType: string;
  payload: any;
  severity?: Severity;
  target?: string;
  processed: boolean;
  timestamp: Date;
  agentId?: string;
  taskId?: string;
  category?: string;
}

// Chain of Thought Types
export interface ChainOfThought {
  id: string;
  stepNumber: number;
  stepType: string;
  description: string;
  reasoning: string;
  data?: any;
  confidence?: number;
  timestamp: Date;
  agentId: string;
  taskId?: string;
}

// Knowledge Base Types
export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  description: string;
  data: any;
  severity?: Severity;
  tags: string[];
  source?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Logic Pipe Types
export interface LogicPipeExecution {
  id: string;
  triggerEvent: string;
  ruleApplied: string;
  inputData: any;
  outputTasks: any;
  executionTime?: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

// Agent Interaction Types
export interface AgentInteraction {
  id: string;
  interactionType: string;
  sourceAgentId: string;
  targetAgentId?: string;
  triggerEvent: string;
  resultEvent?: string;
  flowCompleted: boolean;
  duration?: number;
  timestamp: Date;
}

// Purple Team Payloads
export interface ThreatHunt {
  hunt_id: string;
  hypothesis: string;
  indicators: string[];
  data_sources: string[];
  findings: ThreatHuntFinding[];
  mitre_techniques: string[];
  status: "IN_PROGRESS" | "COMPLETED" | "ESCALATED";
}

export interface ThreatHuntFinding {
  finding_id: string;
  type: "IOC_MATCH" | "BEHAVIORAL_ANOMALY" | "TTP_DETECTED" | "LATERAL_MOVEMENT" | "PERSISTENCE";
  description: string;
  severity: Severity;
  confidence: number;
  evidence: string[];
  mitre_technique_id?: string;
}

export interface IncidentResponse {
  incident_id: string;
  classification: "TRUE_POSITIVE" | "FALSE_POSITIVE" | "BENIGN_POSITIVE";
  phase: "DETECTION" | "TRIAGE" | "CONTAINMENT" | "ERADICATION" | "RECOVERY" | "LESSONS_LEARNED";
  actions_taken: IncidentAction[];
  affected_assets: string[];
  timeline: IncidentTimelineEntry[];
  status: "OPEN" | "CONTAINED" | "ERADICATED" | "RECOVERED" | "CLOSED";
}

export interface IncidentAction {
  action: string;
  target: string;
  result: "SUCCESS" | "FAILED" | "PARTIAL";
  timestamp: Date;
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  event: string;
  source: string;
  details?: string;
}

export interface PostureAssessment {
  assessment_id: string;
  overall_score: number;
  detection_coverage: number;
  response_readiness: number;
  gap_analysis: PostureGap[];
  recommendations: PostureRecommendation[];
  mitre_coverage: Record<string, number>;
}

export interface PostureGap {
  area: string;
  severity: Severity;
  description: string;
  mitre_techniques_uncovered: string[];
  remediation: string;
}

export interface PostureRecommendation {
  priority: number;
  category: string;
  recommendation: string;
  expected_improvement: string;
  effort: "LOW" | "MEDIUM" | "HIGH";
}

export interface ThreatIntelReport {
  report_id: string;
  threat_actors: ThreatActorProfile[];
  iocs_correlated: CorrelatedIOC[];
  attack_patterns: AttackPattern[];
  risk_assessment: string;
  mitre_mapping: MitreMapping[];
}

export interface ThreatActorProfile {
  name: string;
  aliases: string[];
  motivation: string;
  capabilities: string[];
  ttps: string[];
  confidence: number;
}

export interface CorrelatedIOC {
  ioc_type: "IP" | "DOMAIN" | "HASH" | "URL" | "EMAIL" | "FILE_PATH";
  value: string;
  source: string;
  correlation_score: number;
  related_campaigns: string[];
}

export interface AttackPattern {
  pattern_id: string;
  name: string;
  description: string;
  mitre_technique: string;
  kill_chain_phase: string;
  indicators: string[];
}

export interface MitreMapping {
  technique_id: string;
  technique_name: string;
  tactic: string;
  observed: boolean;
  detection_status: "DETECTED" | "MISSED" | "PARTIAL";
}

// Cybersecurity Event Payloads
export interface ReconData {
  target_ip: string;
  live_status: boolean;
  open_ports: number[];
  scan_type: string;
  services?: Record<number, string>;
}

export interface Vulnerability {
  cve_id: string;
  target_ip: string;
  target_port: number;
  severity: Severity;
  description: string;
  exploit_available?: boolean;
  cvss_score?: number;
}

export interface Intrusion {
  source_ip: string;
  destination_ip: string;
  signature_id: string;
  description?: string;
  attack_vector?: string;
}

export interface DefenseAction {
  action_type: "REMEDIATE" | "CONTAIN";
  target_cve: string;
  status: "SUCCESS" | "FAILED";
  details?: string;
}

export interface AttackAdaptation {
  strategy_change: string;
  reason: string;
  new_techniques: string[];
  adaptation_type: string;
  confidence: number;
}

// Agent Types Enum
export enum AgentType {
  DISCOVERY = "DiscoveryAgent",
  VULNERABILITY_SCANNER = "VulnerabilityScannerAgent",
  PATCH_MANAGEMENT = "PatchManagementAgent",
  NETWORK_MONITOR = "NetworkMonitorAgent",
  STRATEGY_ADAPTATION = "StrategyAdaptationAgent",
  THREAT_HUNTER = "ThreatHunterAgent",
  INCIDENT_RESPONSE = "IncidentResponseAgent",
  POSTURE_ASSESSMENT = "PostureAssessmentAgent",
  THREAT_INTELLIGENCE = "ThreatIntelligenceAgent"
}

// Event Types Enum
export enum EventType {
  RECON_DATA = "RECON_DATA",
  VULNERABILITY_FOUND = "VULNERABILITY_FOUND",
  INTRUSION_DETECTED = "INTRUSION_DETECTED",
  DEFENSE_ACTION = "DEFENSE_ACTION",
  ATTACK_ADAPTATION = "ATTACK_ADAPTATION",
  TARGET_REEVALUATION = "TARGET_REEVALUATION",
  SCAN_COMPLETE = "SCAN_COMPLETE",
  CONFIG_AUDIT_COMPLETE = "CONFIG_AUDIT_COMPLETE",
  WEBAPP_SCAN_COMPLETE = "WEBAPP_SCAN_COMPLETE",
  MONITORING_COMPLETE = "MONITORING_COMPLETE",
  DEFENSE_ANALYSIS_COMPLETE = "DEFENSE_ANALYSIS_COMPLETE",
  TASK_ERROR = "TASK_ERROR",
  // Purple Team Events
  THREAT_HUNT_FINDING = "THREAT_HUNT_FINDING",
  THREAT_HUNT_COMPLETE = "THREAT_HUNT_COMPLETE",
  INCIDENT_DETECTED = "INCIDENT_DETECTED",
  INCIDENT_CONTAINED = "INCIDENT_CONTAINED",
  INCIDENT_ERADICATED = "INCIDENT_ERADICATED",
  INCIDENT_RECOVERED = "INCIDENT_RECOVERED",
  POSTURE_ASSESSMENT_COMPLETE = "POSTURE_ASSESSMENT_COMPLETE",
  DETECTION_GAP_FOUND = "DETECTION_GAP_FOUND",
  THREAT_INTEL_REPORT = "THREAT_INTEL_REPORT",
  IOC_CORRELATED = "IOC_CORRELATED",
  MITRE_MAPPING_COMPLETE = "MITRE_MAPPING_COMPLETE"
}

// Logic Pipe Rules
export enum LogicPipeRule {
  RED_DISCOVERS_BLUE_REACTS = "RED_DISCOVERS_BLUE_REACTS",
  BLUE_DETECTS_RED_ADAPTS = "BLUE_DETECTS_RED_ADAPTS",
  BLUE_DEFENDS_RED_REEVALUATES = "BLUE_DEFENDS_RED_REEVALUATES",
  // Purple Team Rules
  PURPLE_HUNT_ON_INTRUSION = "PURPLE_HUNT_ON_INTRUSION",
  PURPLE_INCIDENT_ON_HUNT_FINDING = "PURPLE_INCIDENT_ON_HUNT_FINDING",
  PURPLE_POSTURE_ON_DEFENSE = "PURPLE_POSTURE_ON_DEFENSE",
  PURPLE_INTEL_ON_ADAPTATION = "PURPLE_INTEL_ON_ADAPTATION"
}

// Configuration Types
export interface Config {
  gemini: {
    apiKey: string;
    model: string;
    temperature: number;
    maxOutputTokens: number;
  };
  simulation: {
    targetNetwork: string;
    timeout: number;
    maxConcurrentAgents: number;
  };
  logging: {
    level: string;
    toFile: boolean;
    dir: string;
  };
  output: {
    format: string;
    reportFormat: string;
  };
}

// Simulation State
export interface SimulationState {
  isRunning: boolean;
  startTime?: Date;
  endTime?: Date;
  agents: Agent[];
  taskQueue: Task[];
  eventHistory: CyberEvent[];
  chainOfThoughts: ChainOfThought[];
  logicPipeExecutions: LogicPipeExecution[];
  targetNetwork?: string;
}

// CLI Command Options
export interface StartOptions {
  target?: string;
  scenario?: string;
  config?: string;
  duration?: number;
  output?: string;
}

export interface ReportOptions {
  input: string;
  format: string;
  output?: string;
}
