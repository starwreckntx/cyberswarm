// CyberSwarm CLI - Type Definitions

export type AgentStatus = "IDLE" | "BUSY" | "ERROR" | "OFFLINE";
export type TaskStatus = "PENDING" | "ASSIGNED" | "EXECUTING" | "COMPLETED" | "FAILED";
export type Severity = "Critical" | "High" | "Medium" | "Low";

// Security Tool Types
export type ToolCategory =
  | "reconnaissance"
  | "vulnerability_scanning"
  | "exploitation"
  | "post_exploitation"
  | "forensics"
  | "threat_hunting"
  | "incident_response"
  | "threat_intelligence"
  | "network_monitoring"
  | "defense_evasion"
  | "payload_generation"
  | "credential_access"
  | "lateral_movement"
  | "persistence"
  | "detection_engineering";

export interface SecurityTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  subcategories: string[];
  capabilities: string[];
  mitreTechniques: string[];
  platforms: ("linux" | "windows" | "macos" | "network" | "cloud" | "cross_platform")[];
  defaultOptions: Record<string, any>;
  outputFormat: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresPrivilege: boolean;
  documentation?: string;
}

export interface ToolExecution {
  toolId: string;
  toolName: string;
  command: string;
  options: Record<string, any>;
  target?: string;
  startedAt: Date;
  completedAt?: Date;
  exitCode?: number;
  output?: any;
  agentId: string;
  taskId?: string;
}

export interface ToolResult {
  toolId: string;
  success: boolean;
  output: any;
  parsedData?: any;
  executionTime: number;
  errorMessage?: string;
}

export interface MitreTechnique {
  techniqueId: string;
  name: string;
  tactic: string;
  description: string;
  platforms: string[];
  dataSources: string[];
  detectionMethods: string[];
  tools: string[];
  severity: Severity;
}

export interface MitreAttackData {
  techniques: MitreTechnique[];
  tactics: string[];
  version: string;
}

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

// OSINT Data Payload
export interface OSINTData {
  target: string;
  collection_type: "domain_analysis" | "employee_profiling" | "osint_collection" | "cert_log_analysis";
  subdomains?: string[];
  emails?: string[];
  social_profiles?: string[];
  exposed_credentials?: number;
  public_documents?: string[];
  infrastructure?: Record<string, any>;
  risk_indicators?: string[];
}

// Exploitation Payload
export interface ExploitResult {
  exploit_id: string;
  target_ip: string;
  target_port: number;
  vulnerability_used: string;
  exploit_module: string;
  payload_type: string;
  access_level: "none" | "user" | "admin" | "system";
  session_id?: string;
  artifacts_created?: string[];
  detection_risk: "low" | "medium" | "high";
}

// Containment Payload
export interface ContainmentAction {
  containment_id: string;
  action_type: "network_isolate" | "process_terminate" | "block_ip_domain" | "disable_account";
  target: string;
  scope: string[];
  success: boolean;
  evidence_preserved: boolean;
  side_effects?: string[];
}

// Log Analysis Payload
export interface LogAnalysisResult {
  analysis_id: string;
  log_sources: string[];
  events_analyzed: number;
  anomalies_found: number;
  correlated_events: Array<{
    event_id: string;
    source: string;
    severity: Severity;
    description: string;
    timestamp: string;
  }>;
  patterns_detected: string[];
  risk_assessment: string;
}

// AI Monitoring Payload
export interface AIReasoningAlert {
  alert_id: string;
  monitored_component: string;
  alert_type: "logic_loop" | "model_drift" | "adversarial_input" | "confidence_anomaly" | "prompt_injection";
  description: string;
  severity: Severity;
  affected_decisions: string[];
  recommended_action: string;
}

// Agent Manifest Types
export interface AgentManifest {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  team: "red" | "blue" | "purple";
  supported_tasks: string[];
  c2_server: {
    host: string;
    port: number;
    protocol: string;
  };
  security: {
    client_cert_path: string;
    client_key_path: string;
  };
  heartbeat_interval_seconds: number;
  task_timeout_seconds: number;
}

// MCP Server Config Types
export interface MCPServerConfig {
  server: {
    agent_listener: { host: string; port: number; protocol: string };
    security: {
      mTLS_enabled: boolean;
      ca_cert_path: string;
      server_cert_path: string;
      server_key_path: string;
      crl_path: string;
    };
  };
  knowledge_base: {
    type: string;
    host: string;
    port: number;
    credentials_secret_name: string;
  };
  logic_pipe: {
    tempo_control: {
      red_team_max_tasks_per_minute: number;
      target_cooldown_seconds: number;
    };
    high_impact_confidence_threshold: number;
  };
  api_endpoints: Record<string, string>;
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

// Reconnaissance Payload
export interface ReconScanResult {
  scan_id: string;
  target: string;
  scan_type: "port_scan" | "service_enum" | "web_crawl" | "footprint";
  sub_agent: "NetworkScanner" | "WebCrawler";
  hosts_discovered: number;
  services_found: Array<{
    host: string;
    port: number;
    service: string;
    version?: string;
  }>;
  web_assets?: Array<{
    url: string;
    technology: string;
    status_code: number;
  }>;
  vulnerabilities_hinted: string[];
}

// Persistence Payload
export interface PersistenceResult {
  persistence_id: string;
  target: string;
  method: "backdoor" | "scheduled_task" | "registry_key" | "web_shell" | "rootkit";
  sub_agent: "ImplantDeployer" | "EvasionTuner";
  success: boolean;
  access_maintained: boolean;
  evasion_techniques: string[];
  detection_risk: "low" | "medium" | "high";
  mitre_techniques: string[];
  artifacts_created: string[];
}

// Forensics Payload
export interface ForensicAnalysis {
  analysis_id: string;
  target: string;
  analysis_type: "memory" | "disk" | "network" | "timeline";
  sub_agent: "MemoryAnalyzer" | "FileInvestigator";
  evidence_collected: Array<{
    evidence_id: string;
    type: string;
    description: string;
    hash?: string;
    timestamp?: string;
  }>;
  root_cause?: string;
  timeline: Array<{
    timestamp: string;
    event: string;
    source: string;
    significance: "low" | "medium" | "high" | "critical";
  }>;
  iocs_discovered: string[];
  recommendations: string[];
}

// Recovery Payload
export interface RecoveryResult {
  recovery_id: string;
  target: string;
  action_type: "backup_restore" | "integrity_verify" | "rollback" | "rebuild";
  sub_agent: "BackupRestorer" | "IntegrityVerifier";
  success: boolean;
  systems_restored: string[];
  integrity_checks: Array<{
    component: string;
    status: "passed" | "failed" | "warning";
    details?: string;
  }>;
  rollback_point?: string;
  downtime_seconds: number;
}

// Adaptation Payload
export interface AdaptationInsight {
  insight_id: string;
  analysis_type: "incident_learning" | "strategy_optimization" | "model_tuning";
  sub_agent: "IncidentLearner" | "StrategyOptimizer";
  lessons_learned: Array<{
    category: string;
    finding: string;
    recommendation: string;
    priority: "low" | "medium" | "high" | "critical";
  }>;
  strategy_updates: Array<{
    rule_id: string;
    old_value?: string;
    new_value: string;
    rationale: string;
  }>;
  detection_improvements: string[];
  confidence_score: number;
}

// Swarm Health Status
export interface SwarmHealthStatus {
  swarm_id: string;
  timestamp: Date;
  agents_healthy: number;
  agents_degraded: number;
  agents_failed: number;
  anomalies: Array<{
    agent_id: string;
    anomaly_type: "logic_loop" | "timeout" | "crash" | "drift" | "resource_exhaustion";
    severity: Severity;
    description: string;
  }>;
  overall_status: "healthy" | "degraded" | "critical";
}

// Agent Types Enum
export enum AgentType {
  // Red Team
  DISCOVERY = "DiscoveryAgent",
  OSINT = "OSINTAgent",
  RECON = "ReconAgent",
  VULNERABILITY_SCANNER = "VulnerabilityScannerAgent",
  EXPLOITATION = "ExploitationAgent",
  PERSISTENCE = "PersistenceAgent",
  STRATEGY_ADAPTATION = "StrategyAdaptationAgent",
  // Blue Team
  NETWORK_MONITOR = "NetworkMonitorAgent",
  LOG_ANALYSIS = "LogAnalysisAgent",
  PATCH_MANAGEMENT = "PatchManagementAgent",
  CONTAINMENT = "ContainmentAgent",
  FORENSICS = "ForensicsAgent",
  RECOVERY = "RecoveryAgent",
  AI_MONITORING = "AIMonitoringAgent",
  // Purple Team
  THREAT_HUNTER = "ThreatHunterAgent",
  INCIDENT_RESPONSE = "IncidentResponseAgent",
  POSTURE_ASSESSMENT = "PostureAssessmentAgent",
  THREAT_INTELLIGENCE = "ThreatIntelligenceAgent",
  ADAPTATION = "AdaptationAgent"
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
  // Extended Red Team Events
  OSINT_DATA_COLLECTED = "OSINT_DATA_COLLECTED",
  ACCESS_GAINED = "ACCESS_GAINED",
  DATA_EXFILTRATED = "DATA_EXFILTRATED",
  EXPLOIT_FAILED = "EXPLOIT_FAILED",
  PAYLOAD_DELIVERED = "PAYLOAD_DELIVERED",
  // Extended Blue Team Events
  LOG_ANOMALY_DETECTED = "LOG_ANOMALY_DETECTED",
  CONTAINMENT_ACTION = "CONTAINMENT_ACTION",
  SYSTEM_ISOLATED = "SYSTEM_ISOLATED",
  PROCESS_TERMINATED = "PROCESS_TERMINATED",
  AI_REASONING_ALERT = "AI_REASONING_ALERT",
  THREAT_HUNT_RESULT = "THREAT_HUNT_RESULT",
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
  MITRE_MAPPING_COMPLETE = "MITRE_MAPPING_COMPLETE",
  // Extended Swarm Events
  RECON_SCAN_COMPLETE = "RECON_SCAN_COMPLETE",
  PERSISTENCE_ACHIEVED = "PERSISTENCE_ACHIEVED",
  PERSISTENCE_DETECTED = "PERSISTENCE_DETECTED",
  FORENSIC_ANALYSIS_COMPLETE = "FORENSIC_ANALYSIS_COMPLETE",
  RECOVERY_COMPLETE = "RECOVERY_COMPLETE",
  RECOVERY_FAILED = "RECOVERY_FAILED",
  ADAPTATION_INSIGHT = "ADAPTATION_INSIGHT",
  STRATEGY_OPTIMIZED = "STRATEGY_OPTIMIZED",
  SWARM_ANOMALY = "SWARM_ANOMALY"
}

// Logic Pipe Rules
export enum LogicPipeRule {
  RED_DISCOVERS_BLUE_REACTS = "RED_DISCOVERS_BLUE_REACTS",
  BLUE_DETECTS_RED_ADAPTS = "BLUE_DETECTS_RED_ADAPTS",
  BLUE_DEFENDS_RED_REEVALUATES = "BLUE_DEFENDS_RED_REEVALUATES",
  // Extended Rules
  OSINT_ENRICHES_DISCOVERY = "OSINT_ENRICHES_DISCOVERY",
  VULN_TRIGGERS_EXPLOIT = "VULN_TRIGGERS_EXPLOIT",
  EXPLOIT_TRIGGERS_CONTAINMENT = "EXPLOIT_TRIGGERS_CONTAINMENT",
  LOG_ANOMALY_TRIGGERS_HUNT = "LOG_ANOMALY_TRIGGERS_HUNT",
  INTRUSION_TRIGGERS_CONTAINMENT = "INTRUSION_TRIGGERS_CONTAINMENT",
  AI_MONITORS_REASONING = "AI_MONITORS_REASONING",
  // Purple Team Rules
  PURPLE_HUNT_ON_INTRUSION = "PURPLE_HUNT_ON_INTRUSION",
  PURPLE_INCIDENT_ON_HUNT_FINDING = "PURPLE_INCIDENT_ON_HUNT_FINDING",
  PURPLE_POSTURE_ON_DEFENSE = "PURPLE_POSTURE_ON_DEFENSE",
  PURPLE_INTEL_ON_ADAPTATION = "PURPLE_INTEL_ON_ADAPTATION",
  // Extended Swarm Rules
  RECON_ENRICHES_OSINT = "RECON_ENRICHES_OSINT",
  PERSISTENCE_TRIGGERS_FORENSICS = "PERSISTENCE_TRIGGERS_FORENSICS",
  FORENSIC_TRIGGERS_RECOVERY = "FORENSIC_TRIGGERS_RECOVERY",
  RECOVERY_TRIGGERS_ADAPTATION = "RECOVERY_TRIGGERS_ADAPTATION",
  ADAPTATION_ENRICHES_BLUE = "ADAPTATION_ENRICHES_BLUE",
  SWARM_ANOMALY_TRIGGERS_HEAL = "SWARM_ANOMALY_TRIGGERS_HEAL"
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
