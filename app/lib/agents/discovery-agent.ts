
// Discovery Agent - Network reconnaissance and port scanning

import { BaseAgent } from './base-agent';
import { Task, CyberEvent, ReconData, EventType } from '../types';

export class DiscoveryAgent extends BaseAgent {
  constructor() {
    super(
      'discovery-01',
      'Network Discovery Agent',
      'DiscoveryAgent',
      ['network_scan', 'port_scan', 'service_enum']
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");
    
    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Analyzing task requirements",
        `Received ${task.taskName} task for target ${task.target}. Preparing reconnaissance approach.`,
        { taskName: task.taskName, target: task.target }
      );

      switch (task.taskName) {
        case 'network_scan':
          return await this.networkScan(task);
        case 'port_scan':
          return await this.portScan(task);
        case 'service_enum':
          return await this.serviceEnum(task);
        default:
          throw new Error(`Unsupported task: ${task.taskName}`);
      }
    } finally {
      this.setStatus("IDLE");
    }
  }

  private async networkScan(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.0/24';
    
    this.logChainOfThought(
      2,
      "decision",
      "Network scan strategy selection",
      `Analyzing target network ${target}. Using ping sweep for host discovery to minimize detection while ensuring comprehensive coverage.`,
      { strategy: "ping_sweep", target, reasoning: "Stealth and speed balance" }
    );

    await this.simulateNetworkOperation("network discovery scan", target, 1.5);

    // Simulate finding live hosts
    const liveHosts = ['192.168.1.10', '192.168.1.15', '192.168.1.20'];
    const selectedHost = liveHosts[Math.floor(Math.random() * liveHosts.length)];

    this.logChainOfThought(
      3,
      "evaluation",
      "Network scan results analysis",
      `Network scan completed. Discovered ${liveHosts.length} live hosts. Selecting ${selectedHost} for further analysis based on response characteristics and potential value.`,
      { 
        discoveredHosts: liveHosts, 
        selectedHost, 
        criteria: "Response time and service fingerprints" 
      },
      0.85
    );

    const reconData: ReconData = {
      target_ip: selectedHost,
      live_status: true,
      open_ports: [],
      scan_type: 'network_discovery'
    };

    return this.emitEvent(
      EventType.RECON_DATA,
      reconData,
      'Medium',
      selectedHost,
      task.taskId
    );
  }

  private async portScan(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.10';
    
    this.logChainOfThought(
      2,
      "decision",
      "Port scanning strategy",
      `Target ${target} selected for port scanning. Using SYN stealth scan on top 1000 ports to avoid detection while gathering comprehensive service information.`,
      { 
        technique: "SYN_stealth", 
        portRange: "top_1000", 
        target,
        reasoning: "Balance between stealth and information gathering"
      }
    );

    await this.simulateNetworkOperation("port scan", target, 2);

    // Simulate port scan results
    const commonPorts = [22, 53, 80, 135, 139, 443, 445, 993, 995, 3389, 5985, 8080];
    const openPorts = commonPorts.filter(() => Math.random() > 0.7); // Random subset
    
    // Ensure at least a few ports are open for demonstration
    if (openPorts.length === 0) {
      openPorts.push(22, 80, 443);
    }

    this.logChainOfThought(
      3,
      "evaluation",
      "Port scan analysis",
      `Port scan revealed ${openPorts.length} open ports on ${target}. Notable services detected: ${this.analyzePortsForServices(openPorts)}. This indicates potential attack vectors.`,
      { 
        openPorts, 
        serviceAnalysis: this.analyzePortsForServices(openPorts),
        riskAssessment: this.assessPortRisk(openPorts)
      },
      0.9
    );

    const reconData: ReconData = {
      target_ip: target,
      live_status: true,
      open_ports: openPorts,
      scan_type: 'port_scan'
    };

    return this.emitEvent(
      EventType.RECON_DATA,
      reconData,
      'High',
      target,
      task.taskId
    );
  }

  private async serviceEnum(task: Task): Promise<CyberEvent> {
    const target = task.target || '192.168.1.10';
    
    this.logChainOfThought(
      2,
      "decision",
      "Service enumeration approach",
      `Performing service enumeration on ${target}. Using version detection to identify specific services and potential vulnerabilities without triggering security alerts.`,
      { technique: "version_detection", target }
    );

    await this.simulateNetworkOperation("service enumeration", target, 2.5);

    const services = {
      22: "OpenSSH 8.2p1",
      80: "Apache httpd 2.4.41",
      443: "Apache httpd 2.4.41 (SSL)",
      8080: "Apache Tomcat 9.0.31"
    };

    this.logChainOfThought(
      3,
      "evaluation",
      "Service fingerprinting results",
      `Service enumeration complete. Identified specific service versions that may contain known vulnerabilities. Apache Tomcat 9.0.31 particularly concerning due to recent CVEs.`,
      { 
        services,
        vulnerabilityIndicators: ["Apache Tomcat 9.0.31", "OpenSSH 8.2p1"],
        priorityTargets: [8080, 22]
      },
      0.92
    );

    const reconData: ReconData = {
      target_ip: target,
      live_status: true,
      open_ports: Object.keys(services).map(Number),
      services,
      scan_type: 'service_enum'
    };

    return this.emitEvent(
      EventType.RECON_DATA,
      reconData,
      'High',
      target,
      task.taskId
    );
  }

  private analyzePortsForServices(ports: number[]): string {
    const serviceMap: Record<number, string> = {
      22: "SSH",
      53: "DNS", 
      80: "HTTP",
      135: "RPC",
      139: "NetBIOS",
      443: "HTTPS",
      445: "SMB",
      993: "IMAPS",
      995: "POP3S",
      3389: "RDP",
      5985: "WinRM",
      8080: "HTTP-Alt"
    };

    return ports.map(port => serviceMap[port] || `Port ${port}`).join(', ');
  }

  private assessPortRisk(ports: number[]): string {
    const highRiskPorts = [22, 3389, 445, 135];
    const webPorts = [80, 443, 8080];
    
    const hasHighRisk = ports.some(p => highRiskPorts.includes(p));
    const hasWeb = ports.some(p => webPorts.includes(p));
    
    if (hasHighRisk && hasWeb) {
      return "High - Remote access and web services exposed";
    } else if (hasHighRisk) {
      return "High - Remote access services exposed";
    } else if (hasWeb) {
      return "Medium - Web services exposed";
    }
    return "Low - Limited exposed services";
  }
}
