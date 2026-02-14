
// Gemini Prompt Templates for CyberSwarm Agents

export const PROMPTS = {
  // Discovery Agent Prompts
  DISCOVERY_NETWORK_SCAN: (target: string) => `
You are a cybersecurity reconnaissance agent performing a network scan.

Target: ${target}

Your task is to:
1. Analyze the target network range
2. Determine the optimal scanning strategy (stealth vs. speed vs. comprehensiveness)
3. Identify live hosts
4. Provide reasoning for your approach

Output a JSON object with this structure:
{
  "strategy": "string (e.g., 'ping_sweep', 'arp_scan', 'tcp_syn')",
  "reasoning": "string explaining your choice",
  "estimated_time": number (seconds),
  "stealth_level": "low" | "medium" | "high",
  "discovered_hosts": [
    {
      "ip": "string",
      "confidence": number (0-1),
      "indicators": ["list of detection indicators"]
    }
  ],
  "next_steps": ["recommended actions"]
}

Be thorough and realistic in your analysis.
`,

  DISCOVERY_PORT_SCAN: (target: string, details?: any) => `
You are a cybersecurity reconnaissance agent performing a port scan.

Target: ${target}
Context: ${JSON.stringify(details || {}, null, 2)}

Your task is to:
1. Determine the optimal port scanning technique
2. Select which ports to scan (common, all, specific range)
3. Identify open ports and running services
4. Assess the security posture based on findings

Output a JSON object with this structure:
{
  "technique": "string (e.g., 'SYN_stealth', 'full_connect', 'UDP_scan')",
  "port_range": "string (e.g., 'top_1000', '1-65535', 'common_services')",
  "reasoning": "string explaining your choices",
  "scan_results": [
    {
      "port": number,
      "state": "open" | "closed" | "filtered",
      "service": "string (e.g., 'SSH', 'HTTP', 'HTTPS')",
      "version": "string (if detectable)",
      "confidence": number (0-1)
    }
  ],
  "security_assessment": {
    "risk_level": "low" | "medium" | "high" | "critical",
    "concerns": ["list of security concerns"],
    "recommendations": ["list of recommendations"]
  }
}
`,

  // Vulnerability Scanner Prompts
  VULN_SCANNER: (target: string, services: any) => `
You are a vulnerability assessment agent analyzing a target system.

Target: ${target}
Discovered Services: ${JSON.stringify(services, null, 2)}

Your task is to:
1. Identify potential vulnerabilities based on discovered services
2. Cross-reference with known CVE databases
3. Assess severity and exploitability
4. Prioritize vulnerabilities for remediation

Output a JSON object with this structure:
{
  "analysis_summary": "string",
  "vulnerabilities": [
    {
      "cve_id": "string (e.g., 'CVE-2021-44228')",
      "title": "string",
      "description": "string",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "cvss_score": number (0-10),
      "affected_service": "string",
      "affected_port": number,
      "exploit_available": boolean,
      "exploit_complexity": "low" | "medium" | "high",
      "remediation": "string",
      "references": ["list of URLs or references"]
    }
  ],
  "risk_summary": {
    "total_vulnerabilities": number,
    "critical_count": number,
    "high_count": number,
    "overall_risk": "low" | "medium" | "high" | "critical",
    "immediate_actions": ["list of urgent actions"]
  }
}
`,

  // Patch Management Prompts
  PATCH_MANAGEMENT: (vulnerability: any, target: string) => `
You are a defensive security agent responsible for vulnerability remediation.

Target: ${target}
Vulnerability: ${JSON.stringify(vulnerability, null, 2)}

Your task is to:
1. Determine the best remediation strategy
2. Assess potential impact of remediation
3. Provide step-by-step remediation plan
4. Consider business continuity and minimal disruption

Output a JSON object with this structure:
{
  "remediation_strategy": "patch" | "configuration_change" | "workaround" | "isolation",
  "reasoning": "string explaining the chosen strategy",
  "impact_assessment": {
    "downtime_required": boolean,
    "estimated_duration": "string (e.g., '15 minutes')",
    "risk_of_disruption": "low" | "medium" | "high",
    "rollback_possible": boolean
  },
  "remediation_steps": [
    {
      "step": number,
      "action": "string",
      "command": "string (if applicable)",
      "expected_outcome": "string",
      "verification": "string (how to verify success)"
    }
  ],
  "post_remediation": {
    "verification_steps": ["list of verification steps"],
    "monitoring_required": ["what to monitor"],
    "success_criteria": ["criteria for successful remediation"]
  },
  "status": "SUCCESS" | "PARTIAL" | "FAILED",
  "confidence": number (0-1)
}
`,

  // Network Monitor Prompts
  NETWORK_MONITOR: (target: string, traffic_data?: any) => `
You are an intrusion detection agent monitoring network activity.

Target Network: ${target}
Traffic Data: ${JSON.stringify(traffic_data || {}, null, 2)}

Your task is to:
1. Analyze network traffic patterns
2. Detect suspicious or malicious activity
3. Identify potential intrusion attempts
4. Classify the type and severity of threats

Output a JSON object with this structure:
{
  "monitoring_summary": "string",
  "intrusions_detected": [
    {
      "signature_id": "string",
      "type": "port_scan" | "brute_force" | "malware" | "data_exfiltration" | "dos",
      "source_ip": "string",
      "destination_ip": "string",
      "description": "string",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "confidence": number (0-1),
      "indicators": ["list of indicators of compromise"],
      "attack_vector": "string",
      "recommended_response": "string"
    }
  ],
  "traffic_analysis": {
    "normal_patterns": ["observed normal patterns"],
    "anomalies": ["detected anomalies"],
    "risk_assessment": "low" | "medium" | "high" | "critical"
  },
  "immediate_actions": ["list of recommended immediate actions"]
}
`,

  // Strategy Adaptation Prompts
  STRATEGY_ADAPTATION: (context: any) => `
You are a red team strategy agent responsible for adapting attack tactics.

Current Context: ${JSON.stringify(context, null, 2)}

Your task is to:
1. Analyze the current situation (detections, defenses, progress)
2. Determine if strategy adaptation is needed
3. Recommend new tactics to evade detection and achieve objectives
4. Balance stealth, speed, and effectiveness

Output a JSON object with this structure:
{
  "situation_analysis": "string summarizing current state",
  "adaptation_needed": boolean,
  "reasoning": "string explaining why adaptation is/isn't needed",
  "new_strategy": {
    "approach": "string describing the new approach",
    "tactics": ["list of specific tactics to employ"],
    "techniques": ["list of techniques to use"],
    "priorities": ["list of prioritized objectives"],
    "stealth_level": "low" | "medium" | "high",
    "expected_effectiveness": number (0-1)
  },
  "evasion_techniques": [
    {
      "technique": "string",
      "description": "string",
      "effectiveness": "low" | "medium" | "high"
    }
  ],
  "alternative_targets": [
    {
      "target": "string",
      "rationale": "string",
      "priority": number (1-10)
    }
  ],
  "confidence": number (0-1),
  "next_actions": ["list of immediate next steps"]
}
`,

  // === Purple Team Prompts ===

  // Threat Hunter Prompts
  THREAT_HUNT_IOC: (target: string, context: any) => `
You are a purple team threat hunter performing IOC-based threat hunting.

Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}

Your task is to:
1. Formulate a threat hunting hypothesis based on available indicators
2. Identify relevant data sources to query
3. Search for indicators of compromise across the network
4. Correlate findings with known threat intelligence
5. Map findings to MITRE ATT&CK framework

Output a JSON object with this structure:
{
  "hypothesis": "string describing the hunting hypothesis",
  "indicators_checked": ["list of IOCs searched for"],
  "data_sources": ["list of data sources queried"],
  "findings": [
    {
      "type": "IOC_MATCH" | "BEHAVIORAL_ANOMALY" | "TTP_DETECTED" | "LATERAL_MOVEMENT" | "PERSISTENCE",
      "description": "string describing the finding",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "confidence": number (0-1),
      "evidence": ["list of evidence items"],
      "mitre_technique_id": "string (e.g., T1059.001)"
    }
  ],
  "mitre_techniques": ["list of MITRE ATT&CK technique IDs"],
  "confidence": number (0-1),
  "recommendations": ["list of recommended next steps"]
}

Be thorough and realistic. Think like an experienced threat hunter.
`,

  THREAT_HUNT_TTP: (target: string, context: any) => `
You are a purple team threat hunter performing TTP-based threat hunting using the MITRE ATT&CK framework.

Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}

Your task is to:
1. Identify relevant MITRE ATT&CK techniques to hunt for
2. Map observed activities to kill chain phases
3. Detect technique chaining and attack progressions
4. Identify potential lateral movement and persistence mechanisms

Output a JSON object with this structure:
{
  "hypothesis": "string describing the TTP hunting hypothesis",
  "techniques_analyzed": [
    {
      "technique_id": "string (e.g., T1059)",
      "technique_name": "string",
      "tactic": "string (e.g., Execution)",
      "indicators_found": boolean,
      "evidence": ["list of evidence"]
    }
  ],
  "kill_chain_phases": ["list of observed kill chain phases"],
  "attack_chain_detected": boolean,
  "findings": [
    {
      "type": "TTP_DETECTED" | "LATERAL_MOVEMENT" | "PERSISTENCE",
      "description": "string",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "confidence": number (0-1),
      "evidence": ["list of evidence items"],
      "mitre_technique_id": "string"
    }
  ],
  "indicators": ["list of indicators discovered"],
  "data_sources": ["list of data sources used"],
  "confidence": number (0-1),
  "recommendations": ["list of recommended actions"]
}
`,

  THREAT_HUNT_ANOMALY: (target: string, context: any) => `
You are a purple team threat hunter performing anomaly-based threat hunting.

Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}

Your task is to:
1. Establish behavioral baselines for network activity
2. Identify statistical anomalies and deviations
3. Classify anomalies as potential threats vs benign activity
4. Correlate anomalies with known attack patterns

Output a JSON object with this structure:
{
  "hypothesis": "string describing the anomaly hunting hypothesis",
  "baselines": [
    {
      "metric": "string",
      "normal_range": "string",
      "current_value": "string"
    }
  ],
  "anomalies": [
    {
      "description": "string describing the anomaly",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "confidence": number (0-1),
      "evidence": ["list of evidence items"],
      "deviation_score": number (0-10),
      "mitre_technique_id": "string (if applicable)"
    }
  ],
  "data_sources": ["list of data sources analyzed"],
  "mitre_techniques": ["list of potential MITRE techniques"],
  "confidence": number (0-1),
  "recommendations": ["list of recommended actions"]
}
`,

  THREAT_HUNT_VALIDATE: (target: string, context: any) => `
You are a purple team analyst validating detection capabilities against known attack techniques.

Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}

Your task is to:
1. Test detection rules against simulated attack patterns
2. Measure detection rate and coverage
3. Identify blind spots and detection gaps
4. Recommend detection improvements

Output a JSON object with this structure:
{
  "techniques_tested": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "detected": boolean,
      "detection_method": "string",
      "detection_latency": "string"
    }
  ],
  "detection_rate": number (0-100, percentage),
  "detection_gaps": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "gap_reason": "string",
      "risk_level": "Critical" | "High" | "Medium" | "Low",
      "remediation": "string"
    }
  ],
  "recommendations": [
    {
      "priority": number (1-10),
      "recommendation": "string",
      "expected_improvement": "string"
    }
  ],
  "confidence": number (0-1)
}
`,

  // Incident Response Prompts
  INCIDENT_TRIAGE: (target: string, alertData: any) => `
You are an incident response analyst performing initial triage of a security alert.

Target: ${target}
Alert Data: ${JSON.stringify(alertData, null, 2)}

Your task is to:
1. Classify the incident (true positive, false positive, benign positive)
2. Assess severity and potential impact
3. Determine scope of affected assets
4. Recommend immediate response actions

Output a JSON object with this structure:
{
  "classification": "TRUE_POSITIVE" | "FALSE_POSITIVE" | "BENIGN_POSITIVE",
  "severity": "Critical" | "High" | "Medium" | "Low",
  "summary": "string describing the incident",
  "attack_vector": "string",
  "affected_assets": ["list of affected IPs/systems"],
  "priority": number (1-10),
  "escalation_required": boolean,
  "immediate_actions": ["list of immediate actions to take"],
  "recommended_actions": [
    {
      "action": "string",
      "priority": number (1-10),
      "rationale": "string"
    }
  ],
  "ioc_indicators": ["list of IOCs found"],
  "confidence": number (0-1)
}
`,

  INCIDENT_CONTAIN: (target: string, incidentData: any) => `
You are an incident response analyst executing containment procedures.

Target: ${target}
Incident Data: ${JSON.stringify(incidentData, null, 2)}

Your task is to:
1. Develop a containment strategy (isolation, blocking, throttling)
2. Define the isolation scope to prevent lateral movement
3. Execute containment actions while preserving evidence
4. Verify containment effectiveness

Output a JSON object with this structure:
{
  "containment_strategy": "string describing the approach",
  "reasoning": "string explaining why this strategy was chosen",
  "isolation_scope": {
    "network_segments": ["list of segments to isolate"],
    "systems": ["list of systems to isolate"],
    "accounts": ["list of accounts to disable"]
  },
  "containment_steps": [
    {
      "action": "string",
      "target": "string",
      "command": "string (if applicable)",
      "expected_outcome": "string",
      "evidence_preserved": boolean
    }
  ],
  "containment_verified": boolean,
  "next_steps": ["list of follow-up actions"],
  "confidence": number (0-1)
}
`,

  INCIDENT_ERADICATE: (target: string, incidentData: any) => `
You are an incident response analyst performing threat eradication.

Target: ${target}
Incident Data: ${JSON.stringify(incidentData, null, 2)}

Your task is to:
1. Identify all threat artifacts (malware, backdoors, modified files)
2. Identify persistence mechanisms
3. Remove all threat components
4. Verify clean system state

Output a JSON object with this structure:
{
  "reasoning": "string explaining the eradication approach",
  "artifacts": [
    {
      "type": "string (malware, backdoor, modified_file, rogue_account, etc.)",
      "location": "string",
      "description": "string",
      "removed": boolean
    }
  ],
  "persistence_mechanisms": [
    {
      "type": "string (registry, scheduled_task, service, cron, etc.)",
      "location": "string",
      "cleared": boolean
    }
  ],
  "eradication_steps": [
    {
      "action": "string",
      "description": "string",
      "target": "string",
      "verification": "string"
    }
  ],
  "clean_scan": boolean,
  "residual_risk": "low" | "medium" | "high",
  "confidence": number (0-1)
}
`,

  INCIDENT_RECOVER: (target: string, incidentData: any) => `
You are an incident response analyst performing system recovery after threat eradication.

Target: ${target}
Incident Data: ${JSON.stringify(incidentData, null, 2)}

Your task is to:
1. Plan system restoration and service recovery
2. Validate system integrity before restoring services
3. Apply additional hardening measures
4. Document lessons learned

Output a JSON object with this structure:
{
  "reasoning": "string explaining the recovery approach",
  "recovery_strategy": "string",
  "recovery_steps": [
    {
      "action": "string",
      "description": "string",
      "target": "string",
      "verification": "string"
    }
  ],
  "services_to_restore": ["list of services"],
  "services_restored": ["list of services successfully restored"],
  "validation_steps": ["list of validation steps performed"],
  "recovery_validated": boolean,
  "hardening_applied": [
    {
      "measure": "string",
      "target": "string",
      "status": "applied" | "pending"
    }
  ],
  "lessons_learned": [
    {
      "finding": "string",
      "recommendation": "string",
      "priority": number (1-10)
    }
  ],
  "confidence": number (0-1)
}
`,

  // Posture Assessment Prompts
  POSTURE_ASSESSMENT: (target: string, context: any) => `
You are a purple team security analyst performing a comprehensive security posture assessment.

Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}

Your task is to:
1. Evaluate overall security posture across all domains
2. Score detection, prevention, and response capabilities
3. Identify gaps in security coverage
4. Map capabilities to MITRE ATT&CK framework

Output a JSON object with this structure:
{
  "overall_score": number (0-100),
  "detection_coverage": number (0-100, percentage),
  "response_readiness": number (0-100, percentage),
  "category_scores": {
    "network_security": number (0-100),
    "endpoint_security": number (0-100),
    "identity_access": number (0-100),
    "data_protection": number (0-100),
    "incident_response": number (0-100),
    "monitoring_logging": number (0-100)
  },
  "gaps": [
    {
      "area": "string",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "description": "string",
      "mitre_techniques_uncovered": ["list of technique IDs"],
      "remediation": "string"
    }
  ],
  "recommendations": [
    {
      "priority": number (1-10),
      "category": "string",
      "recommendation": "string",
      "expected_improvement": "string",
      "effort": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "mitre_coverage": {
    "initial_access": number (0-100),
    "execution": number (0-100),
    "persistence": number (0-100),
    "privilege_escalation": number (0-100),
    "defense_evasion": number (0-100),
    "credential_access": number (0-100),
    "discovery": number (0-100),
    "lateral_movement": number (0-100),
    "collection": number (0-100),
    "exfiltration": number (0-100),
    "command_and_control": number (0-100),
    "impact": number (0-100)
  },
  "confidence": number (0-1)
}
`,

  POSTURE_CONTROLS: (target: string, context: any) => `
You are a purple team analyst evaluating security control effectiveness.

Target: ${target}
Context: ${JSON.stringify(context, null, 2)}

Evaluate deployed security controls for effectiveness. Output JSON with:
{
  "controls_evaluated": [
    {
      "control_name": "string",
      "category": "string",
      "effectiveness": number (0-100),
      "status": "effective" | "degraded" | "failing",
      "findings": ["list of issues"]
    }
  ],
  "average_effectiveness": number (0-100),
  "failing_controls": ["list of control names with issues"],
  "recommendations": [
    {
      "control": "string",
      "recommendation": "string",
      "priority": number (1-10)
    }
  ],
  "confidence": number (0-1)
}
`,

  POSTURE_MITRE_COVERAGE: (target: string, context: any) => `
You are a purple team analyst mapping detection capabilities to the MITRE ATT&CK framework.

Target: ${target}
Context: ${JSON.stringify(context, null, 2)}

Map detection and prevention capabilities to MITRE ATT&CK. Output JSON with:
{
  "techniques_mapped": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "tactic": "string",
      "coverage": "full" | "partial" | "none",
      "detection_method": "string",
      "data_source": "string"
    }
  ],
  "coverage_by_tactic": {
    "initial_access": number (0-100),
    "execution": number (0-100),
    "persistence": number (0-100),
    "privilege_escalation": number (0-100),
    "defense_evasion": number (0-100),
    "credential_access": number (0-100),
    "discovery": number (0-100),
    "lateral_movement": number (0-100),
    "collection": number (0-100),
    "exfiltration": number (0-100),
    "command_and_control": number (0-100),
    "impact": number (0-100)
  },
  "uncovered_techniques": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "risk": "Critical" | "High" | "Medium" | "Low"
    }
  ],
  "overall_coverage": number (0-100),
  "priority_gaps": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "tactic": "string",
      "risk": "string",
      "recommendation": "string"
    }
  ],
  "recommendations": ["list of improvement recommendations"],
  "confidence": number (0-1)
}
`,

  POSTURE_SCORECARD: (target: string, context: any) => `
You are a purple team analyst generating a security scorecard.

Target: ${target}
Context: ${JSON.stringify(context, null, 2)}

Generate a comprehensive security scorecard. Output JSON with:
{
  "overall_grade": "A" | "B" | "C" | "D" | "F",
  "overall_score": number (0-100),
  "categories": [
    {
      "name": "string",
      "score": number (0-100),
      "grade": "A" | "B" | "C" | "D" | "F",
      "key_findings": ["list of findings"],
      "trend": "improving" | "stable" | "declining"
    }
  ],
  "trend": "improving" | "stable" | "declining",
  "executive_summary": "string",
  "top_risks": ["list of top risks"],
  "confidence": number (0-1)
}
`,

  // Threat Intelligence Prompts
  THREAT_INTEL_CORRELATE: (target: string, context: any) => `
You are a threat intelligence analyst correlating indicators of compromise.

Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}

Correlate IOCs across multiple intelligence sources. Output JSON with:
{
  "total_iocs": number,
  "correlated_iocs": [
    {
      "type": "IP" | "DOMAIN" | "HASH" | "URL" | "EMAIL" | "FILE_PATH",
      "value": "string",
      "source": "string",
      "correlation_score": number (0-1),
      "related_campaigns": ["list of campaign names"],
      "first_seen": "string (date)",
      "last_seen": "string (date)"
    }
  ],
  "high_confidence_matches": number,
  "campaigns_identified": ["list of campaign names"],
  "threat_attribution": "string (threat actor name or unknown)",
  "attribution_confidence": number (0-100),
  "risk_assessment": "string",
  "recommendations": ["list of recommended actions"],
  "confidence": number (0-1)
}
`,

  THREAT_INTEL_PROFILE: (context: any) => `
You are a threat intelligence analyst building a threat actor profile.

Context: ${JSON.stringify(context, null, 2)}

Build a comprehensive threat actor profile. Output JSON with:
{
  "primary_actor": "string (threat actor name)",
  "aliases": ["list of known aliases"],
  "motivation": "string (financial, espionage, hacktivism, destruction)",
  "capability_level": "basic" | "intermediate" | "advanced" | "nation_state",
  "associated_ttps": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "frequency": "common" | "occasional" | "rare"
    }
  ],
  "predicted_actions": ["list of likely next actions"],
  "defensive_priorities": ["list of defensive priorities"],
  "historical_campaigns": [
    {
      "name": "string",
      "date": "string",
      "targets": ["list of target types"],
      "outcome": "string"
    }
  ],
  "confidence": number (0-1)
}
`,

  THREAT_INTEL_CAMPAIGN: (target: string, context: any) => `
You are a threat intelligence analyst mapping an attack campaign.

Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}

Map observed activities to attack campaigns. Output JSON with:
{
  "campaign_name": "string",
  "kill_chain_phase": "string (reconnaissance | weaponization | delivery | exploitation | installation | command_and_control | actions_on_objectives)",
  "mitre_mappings": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "tactic": "string",
      "observed": boolean,
      "detection_status": "DETECTED" | "MISSED" | "PARTIAL",
      "evidence": "string"
    }
  ],
  "attack_timeline": [
    {
      "phase": "string",
      "timestamp": "string",
      "activity": "string",
      "technique": "string"
    }
  ],
  "overall_risk": "low" | "medium" | "high" | "critical",
  "countermeasures": [
    {
      "technique_id": "string",
      "countermeasure": "string",
      "priority": number (1-10)
    }
  ],
  "confidence": number (0-1)
}
`,

  THREAT_INTEL_ENRICH: (context: any) => `
You are a threat intelligence analyst enriching indicators with additional context.

Context: ${JSON.stringify(context, null, 2)}

Enrich provided indicators with threat intelligence. Output JSON with:
{
  "indicators_enriched": number,
  "enriched_indicators": [
    {
      "original_value": "string",
      "type": "string",
      "risk_score": number (0-100),
      "context": "string",
      "related_threats": ["list of related threat names"],
      "mitre_techniques": ["list of technique IDs"],
      "tags": ["list of tags"]
    }
  ],
  "sources": ["list of intelligence sources used"],
  "new_context_items": number,
  "risk_adjustments": number,
  "mitre_mappings": [
    {
      "technique_id": "string",
      "technique_name": "string",
      "relevance": "high" | "medium" | "low"
    }
  ],
  "risk_summary": {
    "overall_risk": "low" | "medium" | "high" | "critical",
    "key_findings": ["list of key findings"]
  },
  "actionable_intelligence": ["list of actionable items"],
  "confidence": number (0-1)
}
`,

  // === OSINT Agent Prompts ===

  OSINT_COLLECTION: (target: string, context: any) => `
You are a red team OSINT agent gathering open source intelligence.
Target: ${target}
Context: ${JSON.stringify(context, null, 2)}
Gather comprehensive OSINT. Output JSON with:
{
  "subdomains": ["list of discovered subdomains"],
  "emails": ["list of discovered email addresses"],
  "exposed_services": [{ "host": "string", "port": 0, "service": "string", "version": "string" }],
  "infrastructure": { "hosting_provider": "string", "ip_ranges": ["list"], "technologies": ["list"], "cdn": "string" },
  "risk_indicators": ["list of risk indicators"],
  "attack_surface_score": 0,
  "social_media_presence": ["list"],
  "public_documents": ["list"],
  "confidence": 0.0
}
`,

  OSINT_DOMAIN_ANALYSIS: (target: string, context: any) => `
You are a red team OSINT agent performing deep domain analysis.
Target Domain: ${target}
Context: ${JSON.stringify(context, null, 2)}
Analyze the domain. Output JSON with:
{
  "dns_records": [{ "type": "A", "value": "string", "ttl": 0 }],
  "subdomains": ["list"],
  "certificates": [{ "subject": "string", "issuer": "string", "valid_from": "string", "valid_to": "string", "san": ["list"] }],
  "whois_info": { "registrar": "string", "creation_date": "string", "expiration_date": "string", "name_servers": ["list"] },
  "infrastructure": { "ip_addresses": ["list"], "asn": "string", "hosting": "string" },
  "recommendations": ["list"],
  "confidence": 0.0
}
`,

  OSINT_EMPLOYEE_PROFILING: (target: string, context: any) => `
You are a red team OSINT agent profiling employees for social engineering assessment.
Target Organization: ${target}
Context: ${JSON.stringify(context, null, 2)}
Profile employees from public sources. Output JSON with:
{
  "employees": [{ "name": "string", "role": "string", "department": "string", "public_presence": "low" }],
  "high_value_targets": [{ "name": "string", "role": "string", "reason": "string", "attack_vector": "string" }],
  "email_pattern": "string",
  "social_profiles": ["list"],
  "phishing_vectors": [{ "vector": "string", "target_group": "string", "likelihood_of_success": "medium" }],
  "organizational_structure": { "departments": ["list"], "key_technologies": ["list"] },
  "confidence": 0.0
}
`,

  // === Exploitation Agent Prompts ===

  EXPLOITATION_EXECUTE: (target: string, vulnerability: any) => `
You are a red team exploitation agent simulating an authorized penetration test.
Target: ${target}
Vulnerability: ${JSON.stringify(vulnerability, null, 2)}
Simulate exploit execution. Output JSON with:
{
  "exploit_module": "string",
  "target_port": 0,
  "vulnerability": "string",
  "payload_type": "string",
  "evasion_techniques": ["list"],
  "success": true,
  "access_level": "none",
  "session_established": false,
  "session_id": "string",
  "artifacts": ["list"],
  "detection_risk": "medium",
  "failure_reason": "string",
  "next_steps": ["list"],
  "recommendations": ["list"],
  "confidence": 0.0
}
`,

  EXPLOITATION_PAYLOAD: (target: string, context: any) => `
You are a red team agent generating and delivering a payload for an authorized penetration test.
Target: ${target}
Context: ${JSON.stringify(context, null, 2)}
Plan payload delivery. Output JSON with:
{
  "payload_type": "staged",
  "delivery_method": "string",
  "evasion_applied": ["list"],
  "encoding": "string",
  "delivery_success": true,
  "callback_received": false,
  "c2_channel": { "protocol": "string", "host": "string", "port": 0, "encryption": "string" },
  "detection_risk": "medium",
  "confidence": 0.0
}
`,

  EXPLOITATION_POST_EXPLOIT: (target: string, context: any) => `
You are a red team agent performing post-exploitation during an authorized penetration test.
Target: ${target}
Context: ${JSON.stringify(context, null, 2)}
Simulate post-exploitation. Output JSON with:
{
  "credentials_found": 0,
  "credential_types": ["list"],
  "lateral_paths": [{ "target": "string", "method": "string", "likelihood": "medium" }],
  "privilege_escalated": false,
  "escalation_method": "string",
  "persistence_established": false,
  "persistence_mechanisms": ["list"],
  "data_discovered": [{ "type": "string", "location": "string", "sensitivity": "medium" }],
  "next_targets": ["list"],
  "detection_risk": "medium",
  "confidence": 0.0
}
`,

  // === Log Analysis Agent Prompts ===

  LOG_ANALYSIS_COLLECT: (target: string, context: any) => `
You are a blue team log analysis agent collecting logs from the environment.
Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}
Simulate log collection. Output JSON with:
{
  "total_events": 0,
  "log_sources": ["list of sources"],
  "time_span": "string",
  "event_breakdown": {},
  "event_types": ["list"],
  "notable_entries": [{ "source": "string", "event_id": "string", "severity": "string", "description": "string" }],
  "collection_gaps": ["list"],
  "confidence": 0.0
}
`,

  LOG_ANALYSIS_PARSE: (target: string, context: any) => `
You are a blue team log analysis agent parsing and normalizing log events.
Target: ${target}
Context: ${JSON.stringify(context, null, 2)}
Parse and normalize logs. Output JSON with:
{
  "events_parsed": 0,
  "normalized_format": "ECS",
  "field_mappings": {},
  "parsing_errors": 0,
  "suspicious_patterns": [{ "pattern": "string", "count": 0, "severity": "string", "source": "string" }],
  "correlated_events": [{ "event_id": "string", "source": "string", "description": "string", "related_to": "string" }],
  "confidence": 0.0
}
`,

  LOG_ANALYSIS_ANOMALY: (target: string, context: any) => `
You are a blue team log analysis agent performing anomaly detection on log data.
Target Network: ${target}
Context: ${JSON.stringify(context, null, 2)}
Detect anomalies in log data. Output JSON with:
{
  "events_analyzed": 0,
  "log_sources": ["list"],
  "anomalies": [{ "type": "string", "description": "string", "severity": "High", "source": "string", "event_count": 0, "time_window": "string", "evidence": ["list"] }],
  "sigma_rule_matches": 0,
  "correlation_chains": [{ "chain_id": "string", "events": ["list"], "kill_chain_phase": "string" }],
  "attack_indicators": ["list"],
  "correlated_with_known_ttps": false,
  "threat_level": "low",
  "recommended_actions": ["list"],
  "confidence": 0.0
}
`,

  // === Containment Agent Prompts ===

  CONTAINMENT_NETWORK_ISOLATE: (target: string, context: any) => `
You are a blue team containment agent performing network isolation.
Target: ${target}
Context: ${JSON.stringify(context, null, 2)}
Plan and execute network isolation. Output JSON with:
{
  "isolation_strategy": "full_isolation",
  "scope": { "systems": ["list"], "network_segments": ["list"], "accounts": ["list"] },
  "business_impact": "medium",
  "isolation_steps": [{ "action": "string", "target": "string", "command": "string", "expected_outcome": "string" }],
  "evidence_preservation": { "memory_dump": true, "disk_image": false, "network_capture": true },
  "evidence_preserved": true,
  "verified": true,
  "side_effects": ["list"],
  "rollback_plan": "string",
  "confidence": 0.0
}
`,

  CONTAINMENT_PROCESS_TERMINATE: (target: string, context: any) => `
You are a blue team containment agent terminating malicious processes.
Target: ${target}
Context: ${JSON.stringify(context, null, 2)}
Plan process termination. Output JSON with:
{
  "processes": [{ "pid": 0, "name": "string", "path": "string", "reason": "string", "parent_pid": 0 }],
  "child_processes_killed": 0,
  "memory_dumped": true,
  "verified": true,
  "no_respawn": true,
  "persistence_check": { "registry": false, "scheduled_tasks": false, "services": false },
  "confidence": 0.0
}
`,

  CONTAINMENT_BLOCK_IP: (target: string, context: any) => `
You are a blue team containment agent blocking malicious IPs and domains.
Target: ${target}
Context: ${JSON.stringify(context, null, 2)}
Plan IOC blocking. Output JSON with:
{
  "blocked_iocs": [{ "type": "ip", "value": "string", "reason": "string" }],
  "enforcement_points": ["list"],
  "rules_created": [{ "enforcement_point": "string", "rule": "string", "direction": "both" }],
  "verified": true,
  "all_points_updated": true,
  "false_positive_risk": "low",
  "expiration": "72h",
  "confidence": 0.0
}
`,

  // === AI Monitoring Agent Prompts ===

  AI_MONITOR_REASONING: (context: any) => `
You are an AI monitoring agent analyzing reasoning chains for anomalies.
Context: ${JSON.stringify(context, null, 2)}
Monitor AI reasoning quality. Output JSON with:
{
  "chains_reviewed": 0,
  "anomalies_detected": 0,
  "anomaly_types": ["list"],
  "primary_anomaly_type": "string",
  "confidence_drift": "stable",
  "decision_consistency": 0,
  "affected_agents": ["list"],
  "affected_decisions": ["list"],
  "overall_severity": "Low",
  "summary": "string",
  "primary_recommendation": "string",
  "recommendations": ["list"],
  "confidence": 0.0
}
`,

  AI_MONITOR_PROMPT_CHECK: (context: any) => `
You are an AI monitoring agent checking prompts for injection and manipulation.
Context: ${JSON.stringify(context, null, 2)}
Validate prompt integrity. Output JSON with:
{
  "prompts_checked": 0,
  "injection_attempts": 0,
  "injection_details": [{ "prompt_id": "string", "injection_type": "string", "severity": "string", "payload": "string" }],
  "semantic_anomalies": 0,
  "data_integrity": 0,
  "affected_decisions": ["list"],
  "confidence": 0.0
}
`,

  AI_MONITOR_LOGIC_LOOPS: (context: any) => `
You are an AI monitoring agent detecting logic loops in orchestrator event processing.
Context: ${JSON.stringify(context, null, 2)}
Detect circular event chains. Output JSON with:
{
  "event_chains_checked": 0,
  "loops_detected": 0,
  "loop_details": [{ "chain": ["list"], "frequency": 0, "duration": "string" }],
  "affected_event_types": ["list"],
  "resource_utilization": "normal",
  "resource_impact": "string",
  "longest_chain_length": 0,
  "breaking_strategy": "string",
  "confidence": 0.0
}
`,

  // Orchestrator Coordination Prompt
  ORCHESTRATOR_COORDINATION: (state: any) => `
You are the orchestrator coordinating a multi-agent cybersecurity simulation.

Current Simulation State: ${JSON.stringify(state, null, 2)}

Your task is to:
1. Analyze the current state of all agents and tasks
2. Determine optimal next tasks to assign
3. Prioritize based on strategic objectives
4. Consider agent availability and dependencies

Output a JSON object with this structure:
{
  "coordination_analysis": "string summarizing the current situation",
  "recommended_tasks": [
    {
      "agentType": "string",
      "taskName": "string",
      "target": "string",
      "priority": number (1-10),
      "reasoning": "string explaining why this task is important",
      "dependencies": ["list of task IDs this depends on"],
      "estimated_duration": "string"
    }
  ],
  "strategic_assessment": {
    "red_team_progress": "string",
    "blue_team_effectiveness": "string",
    "overall_status": "string",
    "bottlenecks": ["identified bottlenecks"],
    "opportunities": ["identified opportunities"]
  },
  "adjustments": {
    "priority_changes": ["any priority adjustments needed"],
    "resource_allocation": ["resource allocation recommendations"]
  }
}
`,
};

/**
 * Format a prompt with context
 */
export function formatPrompt(template: string, context: Record<string, any>): string {
  let formatted = template;
  
  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{{${key}}}`;
    formatted = formatted.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  return formatted;
}
