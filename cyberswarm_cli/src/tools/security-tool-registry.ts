
// Security Tool Registry - Defines all security tools available to agents

import { SecurityTool, ToolCategory } from '../types.js';
import { logger } from '../utils/logger.js';

export class SecurityToolRegistry {
  private tools: Map<string, SecurityTool> = new Map();

  constructor() {
    this.registerDefaultTools();
    logger.info(`Security Tool Registry initialized with ${this.tools.size} tools`);
  }

  /**
   * Register a security tool
   */
  registerTool(tool: SecurityTool): void {
    this.tools.set(tool.id, tool);
  }

  /**
   * Get tool by ID
   */
  getTool(toolId: string): SecurityTool | undefined {
    return this.tools.get(toolId);
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: ToolCategory): SecurityTool[] {
    return Array.from(this.tools.values()).filter(t => t.category === category);
  }

  /**
   * Get tools that cover a specific MITRE technique
   */
  getToolsForTechnique(techniqueId: string): SecurityTool[] {
    return Array.from(this.tools.values()).filter(
      t => t.mitreTechniques.includes(techniqueId)
    );
  }

  /**
   * Get tools available for an agent type
   */
  getToolsForAgent(agentType: string): SecurityTool[] {
    const agentToolMap: Record<string, ToolCategory[]> = {
      DiscoveryAgent: ['reconnaissance'],
      VulnerabilityScannerAgent: ['vulnerability_scanning'],
      PatchManagementAgent: ['incident_response', 'defense_evasion'],
      NetworkMonitorAgent: ['network_monitoring', 'detection_engineering'],
      StrategyAdaptationAgent: ['exploitation', 'post_exploitation', 'defense_evasion', 'lateral_movement'],
      ThreatHunterAgent: ['threat_hunting', 'forensics', 'detection_engineering', 'network_monitoring'],
      IncidentResponseAgent: ['incident_response', 'forensics', 'network_monitoring'],
      PostureAssessmentAgent: ['vulnerability_scanning', 'detection_engineering', 'network_monitoring'],
      ThreatIntelligenceAgent: ['threat_intelligence', 'threat_hunting'],
    };

    const categories = agentToolMap[agentType] || [];
    return Array.from(this.tools.values()).filter(
      t => categories.includes(t.category)
    );
  }

  /**
   * Get all tools
   */
  getAllTools(): SecurityTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Register all default security tools
   */
  private registerDefaultTools(): void {
    // === RECONNAISSANCE TOOLS ===

    this.registerTool({
      id: 'nmap',
      name: 'Nmap',
      description: 'Network exploration and security auditing tool. Discovers hosts, services, OS fingerprinting, and vulnerability detection via NSE scripts.',
      category: 'reconnaissance',
      subcategories: ['port_scanning', 'host_discovery', 'service_detection', 'os_fingerprinting'],
      capabilities: [
        'tcp_syn_scan', 'tcp_connect_scan', 'udp_scan', 'ping_sweep',
        'service_version_detection', 'os_detection', 'nse_scripting',
        'traceroute', 'aggressive_scan', 'stealth_scan',
      ],
      mitreTechniques: ['T1046', 'T1595', 'T1590', 'T1018'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        scanType: '-sS',
        timing: '-T3',
        ports: '--top-ports 1000',
        serviceDetection: '-sV',
        osDetection: '-O',
      },
      outputFormat: 'xml',
      riskLevel: 'medium',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'masscan',
      name: 'Masscan',
      description: 'High-speed TCP port scanner. Can scan the entire internet in under 6 minutes.',
      category: 'reconnaissance',
      subcategories: ['port_scanning', 'host_discovery'],
      capabilities: [
        'high_speed_scan', 'banner_grabbing', 'syn_scan',
        'large_scale_scanning', 'rate_control',
      ],
      mitreTechniques: ['T1046', 'T1595'],
      platforms: ['linux', 'windows', 'cross_platform'],
      defaultOptions: {
        rate: '--rate 1000',
        ports: '-p1-65535',
      },
      outputFormat: 'json',
      riskLevel: 'high',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'amass',
      name: 'OWASP Amass',
      description: 'In-depth attack surface mapping and external asset discovery via OSINT.',
      category: 'reconnaissance',
      subcategories: ['subdomain_enumeration', 'osint', 'attack_surface'],
      capabilities: [
        'subdomain_discovery', 'dns_enumeration', 'certificate_transparency',
        'web_archive_search', 'api_integration', 'network_mapping',
      ],
      mitreTechniques: ['T1590', 'T1593', 'T1596'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        mode: 'enum',
        passive: true,
      },
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'shodan',
      name: 'Shodan',
      description: 'Search engine for internet-connected devices. Finds specific device types, vulnerabilities, and exposed services.',
      category: 'reconnaissance',
      subcategories: ['osint', 'device_discovery', 'vulnerability_search'],
      capabilities: [
        'device_search', 'vulnerability_lookup', 'banner_analysis',
        'dns_lookup', 'exploit_search', 'honeypot_detection',
      ],
      mitreTechniques: ['T1596', 'T1593', 'T1590'],
      platforms: ['cloud', 'cross_platform'],
      defaultOptions: {
        apiEndpoint: 'api.shodan.io',
      },
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    // === VULNERABILITY SCANNING TOOLS ===

    this.registerTool({
      id: 'nessus',
      name: 'Nessus',
      description: 'Comprehensive vulnerability scanner for network, web app, and compliance auditing.',
      category: 'vulnerability_scanning',
      subcategories: ['network_vuln_scan', 'compliance_audit', 'configuration_audit'],
      capabilities: [
        'vulnerability_scanning', 'compliance_checking', 'configuration_audit',
        'malware_detection', 'patch_audit', 'web_application_scan',
        'credential_scanning', 'plugin_based_detection',
      ],
      mitreTechniques: ['T1595.002'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        scanPolicy: 'Advanced Scan',
        credentials: false,
      },
      outputFormat: 'nessus',
      riskLevel: 'medium',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'openvas',
      name: 'OpenVAS / Greenbone',
      description: 'Open-source vulnerability scanner with comprehensive NVT feed for network vulnerability testing.',
      category: 'vulnerability_scanning',
      subcategories: ['network_vuln_scan', 'host_assessment'],
      capabilities: [
        'network_vulnerability_scan', 'authenticated_scan', 'nvt_based_detection',
        'compliance_checking', 'report_generation',
      ],
      mitreTechniques: ['T1595.002'],
      platforms: ['linux', 'cross_platform'],
      defaultOptions: {
        scanConfig: 'Full and fast',
      },
      outputFormat: 'xml',
      riskLevel: 'medium',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'nuclei',
      name: 'Nuclei',
      description: 'Fast, template-based vulnerability scanner. Community-driven templates for CVE detection.',
      category: 'vulnerability_scanning',
      subcategories: ['web_vuln_scan', 'cve_detection', 'template_scanning'],
      capabilities: [
        'template_scanning', 'cve_detection', 'misconfiguration_detection',
        'exposed_panel_detection', 'takeover_detection', 'fuzzing',
        'headless_browser', 'workflow_scanning',
      ],
      mitreTechniques: ['T1595.002', 'T1190'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        templates: 'cves,misconfigurations,exposures',
        severity: 'critical,high,medium',
        rateLimit: 150,
      },
      outputFormat: 'json',
      riskLevel: 'medium',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'nikto',
      name: 'Nikto',
      description: 'Web server scanner that tests for dangerous files, outdated software, and server configuration issues.',
      category: 'vulnerability_scanning',
      subcategories: ['web_vuln_scan', 'server_audit'],
      capabilities: [
        'web_server_scanning', 'cgi_scanning', 'ssl_testing',
        'outdated_software_detection', 'dangerous_file_detection',
      ],
      mitreTechniques: ['T1595.002', 'T1190'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        tuning: '1234567890abc',
      },
      outputFormat: 'html',
      riskLevel: 'medium',
      requiresPrivilege: false,
    });

    // === EXPLOITATION TOOLS ===

    this.registerTool({
      id: 'metasploit',
      name: 'Metasploit Framework',
      description: 'Penetration testing framework with exploit modules, payloads, encoders, and post-exploitation capabilities.',
      category: 'exploitation',
      subcategories: ['exploit_framework', 'payload_generation', 'post_exploitation'],
      capabilities: [
        'exploit_execution', 'payload_delivery', 'encoder_evasion',
        'session_management', 'pivot_routing', 'credential_harvesting',
        'port_forwarding', 'meterpreter_sessions', 'auxiliary_modules',
        'post_exploitation_modules',
      ],
      mitreTechniques: [
        'T1190', 'T1210', 'T1068', 'T1059', 'T1055', 'T1021',
        'T1071', 'T1095', 'T1572', 'T1570',
      ],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        workspace: 'default',
        lhost: '0.0.0.0',
        lport: 4444,
      },
      outputFormat: 'json',
      riskLevel: 'critical',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'cobalt-strike',
      name: 'Cobalt Strike',
      description: 'Adversary simulation and red team operations platform with Beacon payload for C2 operations.',
      category: 'exploitation',
      subcategories: ['c2_framework', 'adversary_simulation', 'post_exploitation'],
      capabilities: [
        'beacon_deployment', 'malleable_c2', 'lateral_movement',
        'credential_harvesting', 'process_injection', 'privilege_escalation',
        'pivoting', 'data_exfiltration', 'spear_phishing',
      ],
      mitreTechniques: [
        'T1059', 'T1055', 'T1071', 'T1572', 'T1021', 'T1547',
        'T1053', 'T1078', 'T1550',
      ],
      platforms: ['linux', 'windows', 'cross_platform'],
      defaultOptions: {
        listener: 'https-beacon',
        sleep: 60,
        jitter: 20,
      },
      outputFormat: 'json',
      riskLevel: 'critical',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'sqlmap',
      name: 'SQLMap',
      description: 'Automatic SQL injection detection and exploitation tool supporting multiple database backends.',
      category: 'exploitation',
      subcategories: ['web_exploitation', 'sql_injection'],
      capabilities: [
        'sql_injection_detection', 'database_enumeration', 'data_extraction',
        'os_command_execution', 'file_read_write', 'password_cracking',
        'tamper_scripts',
      ],
      mitreTechniques: ['T1190', 'T1059'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        level: 3,
        risk: 2,
        batch: true,
      },
      outputFormat: 'json',
      riskLevel: 'high',
      requiresPrivilege: false,
    });

    // === POST EXPLOITATION TOOLS ===

    this.registerTool({
      id: 'mimikatz',
      name: 'Mimikatz',
      description: 'Windows credential extraction tool. Extracts plaintext passwords, hashes, PIN codes, and Kerberos tickets from memory.',
      category: 'post_exploitation',
      subcategories: ['credential_access', 'privilege_escalation'],
      capabilities: [
        'lsass_dump', 'pass_the_hash', 'pass_the_ticket', 'golden_ticket',
        'silver_ticket', 'dcsync', 'skeleton_key', 'sam_dump',
        'dpapi_extraction', 'kerberoasting',
      ],
      mitreTechniques: [
        'T1003', 'T1003.001', 'T1003.002', 'T1003.003', 'T1003.006',
        'T1550.002', 'T1550.003', 'T1558.001', 'T1558.003',
      ],
      platforms: ['windows'],
      defaultOptions: {
        module: 'sekurlsa',
        command: 'logonpasswords',
      },
      outputFormat: 'text',
      riskLevel: 'critical',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'bloodhound',
      name: 'BloodHound',
      description: 'Active Directory attack path analysis using graph theory to find relationships and privilege escalation paths.',
      category: 'post_exploitation',
      subcategories: ['ad_enumeration', 'attack_path_analysis'],
      capabilities: [
        'ad_enumeration', 'attack_path_discovery', 'privilege_escalation_paths',
        'kerberoastable_users', 'as_rep_roastable', 'unconstrained_delegation',
        'gpo_abuse', 'acl_analysis',
      ],
      mitreTechniques: ['T1087', 'T1069', 'T1482', 'T1615'],
      platforms: ['windows', 'linux', 'cross_platform'],
      defaultOptions: {
        collector: 'SharpHound',
        collectionMethod: 'All',
      },
      outputFormat: 'json',
      riskLevel: 'high',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'impacket',
      name: 'Impacket',
      description: 'Collection of Python classes for working with network protocols. Provides tools for SMB, MSRPC, Kerberos, and LDAP operations.',
      category: 'post_exploitation',
      subcategories: ['lateral_movement', 'credential_access', 'remote_execution'],
      capabilities: [
        'psexec', 'wmiexec', 'smbexec', 'atexec', 'dcomexec',
        'secretsdump', 'ntlmrelayx', 'kerberoast', 'getTGT',
        'getST', 'smb_client', 'ldap_query',
      ],
      mitreTechniques: [
        'T1021.002', 'T1021.003', 'T1021.006', 'T1003.003',
        'T1003.006', 'T1557', 'T1558.003',
      ],
      platforms: ['linux', 'windows', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'text',
      riskLevel: 'critical',
      requiresPrivilege: true,
    });

    // === FORENSICS TOOLS ===

    this.registerTool({
      id: 'volatility',
      name: 'Volatility 3',
      description: 'Memory forensics framework for analyzing RAM dumps. Extracts processes, network connections, registry data, and malware artifacts.',
      category: 'forensics',
      subcategories: ['memory_forensics', 'malware_analysis'],
      capabilities: [
        'process_listing', 'dll_analysis', 'network_connections',
        'registry_extraction', 'malware_detection', 'rootkit_detection',
        'timeline_analysis', 'yara_scanning', 'dumping_processes',
      ],
      mitreTechniques: ['T1055', 'T1003', 'T1547'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        framework: 'volatility3',
      },
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'autopsy',
      name: 'Autopsy / Sleuth Kit',
      description: 'Digital forensics platform for disk image analysis, file recovery, timeline analysis, and keyword searching.',
      category: 'forensics',
      subcategories: ['disk_forensics', 'file_recovery', 'timeline_analysis'],
      capabilities: [
        'disk_image_analysis', 'file_carving', 'deleted_file_recovery',
        'timeline_generation', 'keyword_search', 'hash_analysis',
        'registry_analysis', 'email_analysis', 'web_artifact_analysis',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'windows', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'html',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'velociraptor',
      name: 'Velociraptor',
      description: 'Endpoint visibility and digital forensics tool for collecting, monitoring, and hunting across endpoints at scale.',
      category: 'forensics',
      subcategories: ['endpoint_forensics', 'threat_hunting', 'live_response'],
      capabilities: [
        'vql_queries', 'artifact_collection', 'live_response',
        'file_collection', 'process_monitoring', 'event_monitoring',
        'yara_scanning', 'hunt_orchestration', 'timeline_analysis',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        server: true,
      },
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: true,
    });

    // === THREAT HUNTING TOOLS ===

    this.registerTool({
      id: 'yara',
      name: 'YARA',
      description: 'Pattern matching tool for malware identification and classification using rule-based signatures.',
      category: 'threat_hunting',
      subcategories: ['malware_detection', 'pattern_matching'],
      capabilities: [
        'file_scanning', 'process_scanning', 'memory_scanning',
        'rule_matching', 'string_matching', 'hex_pattern_matching',
        'condition_evaluation', 'module_support',
      ],
      mitreTechniques: ['T1059', 'T1027'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        recursive: true,
        timeout: 60,
      },
      outputFormat: 'text',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'sigma',
      name: 'Sigma',
      description: 'Generic signature format for SIEM systems. Converts detection rules across platforms (Splunk, Elastic, QRadar, etc.).',
      category: 'threat_hunting',
      subcategories: ['detection_rules', 'siem_integration', 'log_analysis'],
      capabilities: [
        'rule_conversion', 'siem_rule_generation', 'log_pattern_matching',
        'multi_platform_rules', 'mitre_mapping', 'rule_validation',
      ],
      mitreTechniques: [],
      platforms: ['cross_platform'],
      defaultOptions: {
        target: 'elasticsearch',
      },
      outputFormat: 'yaml',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'osquery',
      name: 'osquery',
      description: 'SQL-powered operating system analytics framework for endpoint visibility and fleet interrogation.',
      category: 'threat_hunting',
      subcategories: ['endpoint_visibility', 'fleet_management', 'compliance'],
      capabilities: [
        'process_auditing', 'file_integrity_monitoring', 'network_monitoring',
        'user_auditing', 'hardware_inventory', 'software_inventory',
        'yara_integration', 'event_based_queries', 'scheduled_queries',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        distributed: true,
      },
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'elastic-siem',
      name: 'Elastic Security (SIEM)',
      description: 'SIEM and endpoint security platform with detection rules, timeline investigation, and case management.',
      category: 'threat_hunting',
      subcategories: ['siem', 'endpoint_detection', 'case_management'],
      capabilities: [
        'log_aggregation', 'detection_rules', 'timeline_investigation',
        'case_management', 'ml_anomaly_detection', 'threat_intelligence_integration',
        'endpoint_response', 'osquery_integration',
      ],
      mitreTechniques: [],
      platforms: ['cross_platform', 'cloud'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    // === NETWORK MONITORING TOOLS ===

    this.registerTool({
      id: 'zeek',
      name: 'Zeek (Bro)',
      description: 'Network security monitoring framework that produces detailed logs of network activity for analysis.',
      category: 'network_monitoring',
      subcategories: ['network_analysis', 'protocol_analysis', 'ids'],
      capabilities: [
        'protocol_analysis', 'connection_logging', 'http_analysis',
        'dns_analysis', 'ssl_analysis', 'file_extraction',
        'custom_scripting', 'intel_framework', 'notice_framework',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'macos', 'cross_platform'],
      defaultOptions: {
        interface: 'eth0',
        logFormat: 'json',
      },
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'suricata',
      name: 'Suricata',
      description: 'High-performance IDS/IPS and network security monitoring engine with multi-threaded architecture.',
      category: 'network_monitoring',
      subcategories: ['ids', 'ips', 'network_monitoring'],
      capabilities: [
        'signature_detection', 'protocol_detection', 'file_extraction',
        'tls_logging', 'flow_analysis', 'lua_scripting',
        'eve_json_logging', 'pcap_processing', 'ipfix_export',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'windows', 'cross_platform'],
      defaultOptions: {
        mode: 'ids',
        rulesets: ['et/open', 'suricata'],
      },
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'wireshark',
      name: 'Wireshark / TShark',
      description: 'Network protocol analyzer for deep packet inspection and traffic capture analysis.',
      category: 'network_monitoring',
      subcategories: ['packet_capture', 'protocol_analysis', 'traffic_analysis'],
      capabilities: [
        'packet_capture', 'protocol_dissection', 'display_filters',
        'capture_filters', 'follow_stream', 'io_statistics',
        'expert_analysis', 'decryption', 'voip_analysis',
      ],
      mitreTechniques: ['T1040'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {
        captureFilter: '',
        displayFilter: '',
      },
      outputFormat: 'pcap',
      riskLevel: 'low',
      requiresPrivilege: true,
    });

    // === INCIDENT RESPONSE TOOLS ===

    this.registerTool({
      id: 'thehive',
      name: 'TheHive',
      description: 'Security incident response platform with case management, task assignment, and observable analysis.',
      category: 'incident_response',
      subcategories: ['case_management', 'alert_management', 'observable_analysis'],
      capabilities: [
        'case_management', 'task_management', 'observable_analysis',
        'cortex_integration', 'misp_integration', 'alert_ingestion',
        'template_workflows', 'metrics_dashboard',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'cortex',
      name: 'Cortex',
      description: 'Observable analysis and active response engine. Automates IOC enrichment with 100+ analyzers.',
      category: 'incident_response',
      subcategories: ['observable_analysis', 'enrichment', 'active_response'],
      capabilities: [
        'ioc_analysis', 'hash_lookup', 'url_analysis', 'domain_analysis',
        'ip_reputation', 'file_analysis', 'sandbox_detonation',
        'active_response', 'analyzer_orchestration',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'grr',
      name: 'GRR Rapid Response',
      description: 'Remote live forensics and incident response framework for endpoint investigation at scale.',
      category: 'incident_response',
      subcategories: ['endpoint_response', 'live_forensics', 'fleet_interrogation'],
      capabilities: [
        'remote_file_collection', 'memory_analysis', 'registry_analysis',
        'process_monitoring', 'timeline_generation', 'hunt_scheduling',
        'flow_management', 'artifact_collection',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: true,
    });

    // === THREAT INTELLIGENCE TOOLS ===

    this.registerTool({
      id: 'misp',
      name: 'MISP',
      description: 'Open-source threat intelligence sharing platform for collecting, storing, distributing, and sharing cybersecurity indicators.',
      category: 'threat_intelligence',
      subcategories: ['ioc_sharing', 'threat_feeds', 'correlation'],
      capabilities: [
        'ioc_management', 'event_correlation', 'taxonomy_tagging',
        'galaxy_clustering', 'feed_management', 'sighting_tracking',
        'stix_export', 'api_integration', 'warninglists',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'opencti',
      name: 'OpenCTI',
      description: 'Open-source cyber threat intelligence platform using STIX 2.1 standard for structured threat intelligence management.',
      category: 'threat_intelligence',
      subcategories: ['cti_platform', 'stix_management', 'threat_analysis'],
      capabilities: [
        'stix_management', 'threat_actor_profiling', 'campaign_tracking',
        'indicator_management', 'relationship_mapping', 'mitre_integration',
        'connector_ecosystem', 'enrichment', 'reporting',
      ],
      mitreTechniques: [],
      platforms: ['linux', 'cross_platform', 'cloud'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'maltego',
      name: 'Maltego',
      description: 'OSINT and graphical link analysis tool for gathering and connecting information for investigative tasks.',
      category: 'threat_intelligence',
      subcategories: ['osint', 'link_analysis', 'investigation'],
      capabilities: [
        'entity_discovery', 'relationship_mapping', 'transform_execution',
        'graph_visualization', 'data_mining', 'social_media_analysis',
        'infrastructure_mapping', 'domain_investigation',
      ],
      mitreTechniques: ['T1593', 'T1596'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'xml',
      riskLevel: 'low',
      requiresPrivilege: false,
    });

    // === DETECTION ENGINEERING TOOLS ===

    this.registerTool({
      id: 'atomic-red-team',
      name: 'Atomic Red Team',
      description: 'Library of tests mapped to MITRE ATT&CK. Small, portable detection tests for validating security controls.',
      category: 'detection_engineering',
      subcategories: ['attack_simulation', 'control_validation', 'mitre_testing'],
      capabilities: [
        'technique_simulation', 'detection_testing', 'control_validation',
        'mitre_mapped_tests', 'automated_execution', 'custom_atomics',
      ],
      mitreTechniques: [
        'T1059', 'T1053', 'T1547', 'T1055', 'T1003',
        'T1021', 'T1071', 'T1027', 'T1562',
      ],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'high',
      requiresPrivilege: true,
    });

    this.registerTool({
      id: 'caldera',
      name: 'MITRE Caldera',
      description: 'Automated adversary emulation system. Plans and executes attack operations mapped to MITRE ATT&CK.',
      category: 'detection_engineering',
      subcategories: ['adversary_emulation', 'automated_testing', 'purple_team'],
      capabilities: [
        'adversary_emulation', 'automated_operations', 'agent_management',
        'plugin_system', 'fact_gathering', 'ability_execution',
        'reporting', 'debrief_analysis',
      ],
      mitreTechniques: [
        'T1059', 'T1053', 'T1547', 'T1003', 'T1021',
        'T1082', 'T1083', 'T1057',
      ],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'high',
      requiresPrivilege: true,
    });

    // === CREDENTIAL ACCESS TOOLS ===

    this.registerTool({
      id: 'hashcat',
      name: 'Hashcat',
      description: 'Advanced password recovery tool using GPU acceleration. Supports 300+ hash types.',
      category: 'credential_access',
      subcategories: ['password_cracking', 'hash_recovery'],
      capabilities: [
        'dictionary_attack', 'brute_force', 'rule_based_attack',
        'combinator_attack', 'mask_attack', 'hybrid_attack',
        'gpu_acceleration', 'distributed_cracking',
      ],
      mitreTechniques: ['T1110.002', 'T1003'],
      platforms: ['linux', 'windows', 'cross_platform'],
      defaultOptions: {
        attackMode: 0,
        workload: 3,
      },
      outputFormat: 'text',
      riskLevel: 'high',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'john',
      name: 'John the Ripper',
      description: 'Open-source password cracker supporting many cipher and hash types.',
      category: 'credential_access',
      subcategories: ['password_cracking', 'hash_recovery'],
      capabilities: [
        'dictionary_attack', 'brute_force', 'incremental_mode',
        'wordlist_rules', 'format_detection', 'session_management',
      ],
      mitreTechniques: ['T1110.002', 'T1003'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'text',
      riskLevel: 'high',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'responder',
      name: 'Responder',
      description: 'LLMNR, NBT-NS, and MDNS poisoner for capturing NTLMv1/v2 hashes on the network.',
      category: 'credential_access',
      subcategories: ['credential_harvesting', 'network_poisoning'],
      capabilities: [
        'llmnr_poisoning', 'nbtns_poisoning', 'mdns_poisoning',
        'hash_capture', 'wpad_proxy', 'smb_relay',
        'http_authentication', 'fingerprinting',
      ],
      mitreTechniques: ['T1557.001', 'T1040', 'T1003'],
      platforms: ['linux', 'cross_platform'],
      defaultOptions: {
        interface: 'eth0',
        analyze: false,
      },
      outputFormat: 'text',
      riskLevel: 'critical',
      requiresPrivilege: true,
    });

    // === PAYLOAD GENERATION TOOLS ===

    this.registerTool({
      id: 'msfvenom',
      name: 'MSFVenom',
      description: 'Metasploit payload generator and encoder. Creates custom payloads for various platforms and architectures.',
      category: 'payload_generation',
      subcategories: ['payload_creation', 'encoding', 'evasion'],
      capabilities: [
        'payload_generation', 'encoding', 'multi_platform',
        'shellcode_generation', 'executable_generation', 'format_conversion',
        'nop_sleds', 'iteration_encoding',
      ],
      mitreTechniques: ['T1059', 'T1027', 'T1055'],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'raw',
      riskLevel: 'critical',
      requiresPrivilege: false,
    });

    this.registerTool({
      id: 'sliver',
      name: 'Sliver C2',
      description: 'Open-source cross-platform adversary emulation / red team framework with implant generation.',
      category: 'payload_generation',
      subcategories: ['c2_framework', 'implant_generation', 'adversary_simulation'],
      capabilities: [
        'implant_generation', 'mtls_c2', 'wireguard_c2', 'dns_c2',
        'http_c2', 'pivoting', 'process_injection',
        'credential_harvesting', 'stager_generation',
      ],
      mitreTechniques: [
        'T1059', 'T1071', 'T1572', 'T1055', 'T1021',
      ],
      platforms: ['linux', 'windows', 'macos', 'cross_platform'],
      defaultOptions: {},
      outputFormat: 'json',
      riskLevel: 'critical',
      requiresPrivilege: true,
    });
  }
}

// Singleton instance
let registryInstance: SecurityToolRegistry | undefined;

export function getToolRegistry(): SecurityToolRegistry {
  if (!registryInstance) {
    registryInstance = new SecurityToolRegistry();
  }
  return registryInstance;
}
