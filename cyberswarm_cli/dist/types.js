// CyberSwarm CLI - Type Definitions
// Agent Types Enum
export var AgentType;
(function (AgentType) {
    AgentType["DISCOVERY"] = "DiscoveryAgent";
    AgentType["VULNERABILITY_SCANNER"] = "VulnerabilityScannerAgent";
    AgentType["PATCH_MANAGEMENT"] = "PatchManagementAgent";
    AgentType["NETWORK_MONITOR"] = "NetworkMonitorAgent";
    AgentType["STRATEGY_ADAPTATION"] = "StrategyAdaptationAgent";
})(AgentType || (AgentType = {}));
// Event Types Enum
export var EventType;
(function (EventType) {
    EventType["RECON_DATA"] = "RECON_DATA";
    EventType["VULNERABILITY_FOUND"] = "VULNERABILITY_FOUND";
    EventType["INTRUSION_DETECTED"] = "INTRUSION_DETECTED";
    EventType["DEFENSE_ACTION"] = "DEFENSE_ACTION";
    EventType["ATTACK_ADAPTATION"] = "ATTACK_ADAPTATION";
    EventType["TARGET_REEVALUATION"] = "TARGET_REEVALUATION";
    EventType["SCAN_COMPLETE"] = "SCAN_COMPLETE";
    EventType["CONFIG_AUDIT_COMPLETE"] = "CONFIG_AUDIT_COMPLETE";
    EventType["WEBAPP_SCAN_COMPLETE"] = "WEBAPP_SCAN_COMPLETE";
    EventType["MONITORING_COMPLETE"] = "MONITORING_COMPLETE";
    EventType["DEFENSE_ANALYSIS_COMPLETE"] = "DEFENSE_ANALYSIS_COMPLETE";
    EventType["TASK_ERROR"] = "TASK_ERROR";
})(EventType || (EventType = {}));
// Logic Pipe Rules
export var LogicPipeRule;
(function (LogicPipeRule) {
    LogicPipeRule["RED_DISCOVERS_BLUE_REACTS"] = "RED_DISCOVERS_BLUE_REACTS";
    LogicPipeRule["BLUE_DETECTS_RED_ADAPTS"] = "BLUE_DETECTS_RED_ADAPTS";
    LogicPipeRule["BLUE_DEFENDS_RED_REEVALUATES"] = "BLUE_DEFENDS_RED_REEVALUATES";
})(LogicPipeRule || (LogicPipeRule = {}));
//# sourceMappingURL=types.js.map