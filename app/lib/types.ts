// Cybersecurity Agent Swarm Platform Types

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
}

export interface Intrusion {
  source_ip: string;
  destination_ip: string;
  signature_id: string;
  description?: string;
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
  STRATEGY_ADAPTATION = "StrategyAdaptationAgent"
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
  TASK_ERROR = "TASK_ERROR"
}

// Logic Pipe Rules
export enum LogicPipeRule {
  RED_DISCOVERS_BLUE_REACTS = "RED_DISCOVERS_BLUE_REACTS",
  BLUE_DETECTS_RED_ADAPTS = "BLUE_DETECTS_RED_ADAPTS", 
  BLUE_DEFENDS_RED_REEVALUATES = "BLUE_DEFENDS_RED_REEVALUATES"
}

// Real-time Stream Events
export interface StreamEvent {
  type: 'agent_status' | 'task_update' | 'event_created' | 'chain_of_thought' | 'logic_pipe_execution' | 'initial_status' | 'heartbeat';
  data: any;
  timestamp: Date;
}

// Dashboard State
export interface DashboardState {
  agents: Agent[];
  activeTasks: Task[];
  recentEvents: CyberEvent[];
  knowledgeBase: KnowledgeEntry[];
  logicPipeExecutions: LogicPipeExecution[];
  isSimulationRunning: boolean;
  selectedAgent?: Agent;
  selectedEvent?: CyberEvent;
}