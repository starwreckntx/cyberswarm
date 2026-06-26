
// Network Monitor Agent - Intrusion detection and traffic analysis

import { BaseAgent } from './base-agent';
import { Task, CyberEvent, Intrusion, EventType } from '../types';

export class NetworkMonitorAgent extends BaseAgent {
  private detectionCount = 0;
  private monitoringPatterns = {
    portScans: ['2010935', '2010936', '2010937'],
    bruteForce: ['2010901', '2010902', '2010903'],
    malware: ['2010950', '2010951', '2010952'],
    dataExfiltration: ['2010970', '2010971', '2010972']
  };

  constructor() {
    super(
      'net-monitor-01',
      'Network Monitor Agent',
      'NetworkMonitorAgent',
      ['traffic_analysis', 'intrusion_detection']
    );
  }

  async executeTask(task: Task): Promise<CyberEvent> {
    this.setStatus("BUSY");
    
    try {
      this.logChainOfThought(
        1,
        "analysis",
        "Network monitoring initialization",
        `Starting ${task.taskName} with focus on detecting malicious activities and policy violations. Monitoring scope: ${task.details?.scope || 'comprehensive'}.`,
        { taskName: task.taskName, scope: task.details?.scope }
      );

      switch (task.taskName) {
        case 'traffic_analysis':
          return await this.trafficAnalysis(task);
        case 'intrusion_detection':
          return await this.intrusionDetection(task);
        default:
          throw new Error(`Unsupported task: ${task.taskName}`);
      }
    } finally {
      this.setStatus("IDLE");
    }
  }

  private async trafficAnalysis(task: Task): Promise<CyberEvent> {
    const duration = task.details?.duration || 60;
    
    this.logChainOfThought(
      2,
      "decision",
      "Traffic analysis methodology",
      `Implementing deep packet inspection and behavioral analysis for ${duration} seconds. Using ML-based anomaly detection to identify suspicious patterns.`,
      { 
        duration,
        techniques: ["Deep packet inspection", "Behavioral analysis", "ML anomaly detection"],
        baselines: "Established from historical data"
      }
    );

    await this.simulateNetworkOperation("traffic analysis", undefined, 1.5);

    const trafficFindings = this.analyzeNetworkTraffic();

    this.logChainOfThought(
      3,
      "evaluation",
      "Traffic analysis results",
      `Network traffic analysis completed. Processed ${trafficFindings.packetsAnalyzed} packets. Detected ${trafficFindings.anomalies.length} anomalies requiring investigation.`,
      { 
        findings: trafficFindings,
        riskLevel: this.assessTrafficRisk(trafficFindings),
        recommendations: this.generateTrafficRecommendations(trafficFindings)
      },
      0.85
    );

    return this.emitEvent(
      EventType.MONITORING_COMPLETE,
      {
        analysis_type: 'traffic_analysis',
        duration: duration,
        findings: trafficFindings,
        status: 'completed'
      },
      trafficFindings.anomalies.length > 3 ? 'High' : 'Medium',
      undefined,
      task.taskId
    );
  }

  private async intrusionDetection(task: Task): Promise<CyberEvent> {
    const duration = task.details?.duration || 60;
    
    this.logChainOfThought(
      2,
      "decision",
      "Intrusion detection strategy",
      `Activating signature-based and behavioral intrusion detection systems. Monitoring for ${duration} seconds with focus on known attack patterns and zero-day indicators.`,
      { 
        duration,
        detectionMethods: ["Signature-based", "Behavioral", "Heuristic"],
        alertThreshold: "Medium and above"
      }
    );

    await this.simulateNetworkOperation("intrusion detection", undefined, 2);

    // Simulate periodic monitoring
    this.detectionCount++;
    
    // Detect intrusion after some activity
    if (this.detectionCount >= 2 && Math.random() > 0.4) {
      const intrusion = this.generateIntrusionEvent();
      
      this.logChainOfThought(
        3,
        "evaluation",
        "Intrusion detection alert",
        `SECURITY ALERT: Detected ${intrusion.description} from ${intrusion.source_ip}. Signature ID: ${intrusion.signature_id}. Immediate response protocols activated.`,
        { 
          intrusionDetails: intrusion,
          severity: "High",
          responseActions: ["Block source IP", "Alert security team", "Increase monitoring"],
          correlatedEvents: this.getCorrelatedEvents()
        },
        0.92
      );

      return this.emitEvent(
        EventType.INTRUSION_DETECTED,
        intrusion,
        'High',
        intrusion.destination_ip,
        task.taskId
      );
    } else {
      this.logChainOfThought(
        3,
        "evaluation",
        "Monitoring period complete",
        `Intrusion detection monitoring completed. No malicious activity detected during ${duration}-second monitoring window. Network appears secure.`,
        { 
          monitoringDuration: duration,
          eventsProcessed: Math.floor(Math.random() * 1000) + 500,
          falsePositives: Math.floor(Math.random() * 5),
          securityStatus: "Clean"
        },
        0.78
      );

      return this.emitEvent(
        EventType.MONITORING_COMPLETE,
        {
          status: 'clean',
          monitoring_duration: duration,
          events_processed: Math.floor(Math.random() * 1000) + 500
        },
        'Low',
        undefined,
        task.taskId
      );
    }
  }

  private analyzeNetworkTraffic() {
    const packetsAnalyzed = Math.floor(Math.random() * 50000) + 10000;
    const protocols = ['HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'DNS'];
    
    const anomalies = [];
    const numAnomalies = Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numAnomalies; i++) {
      anomalies.push({
        type: this.getRandomAnomalyType(),
        severity: this.getRandomSeverity(),
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        sourceIp: this.generateRandomIP(),
        description: this.getAnomalyDescription()
      });
    }

    return {
      packetsAnalyzed,
      protocols: protocols,
      anomalies,
      bandwidthUsage: `${Math.floor(Math.random() * 100)}%`,
      topTalkers: this.generateTopTalkers()
    };
  }

  private generateIntrusionEvent(): Intrusion {
    const signatures = Object.values(this.monitoringPatterns).flat();
    const signatureId = signatures[Math.floor(Math.random() * signatures.length)];
    
    const descriptions: Record<string, string> = {
      '2010935': 'TCP Port Scan Detected',
      '2010936': 'UDP Port Scan Detected', 
      '2010937': 'SYN Flood Attack Detected',
      '2010901': 'SSH Brute Force Attack',
      '2010902': 'RDP Brute Force Attack',
      '2010903': 'Web Login Brute Force',
      '2010950': 'Malware Communication Detected',
      '2010951': 'Trojan Callback Detected',
      '2010952': 'Botnet Activity Detected',
      '2010970': 'Data Exfiltration Attempt',
      '2010971': 'Unauthorized File Transfer',
      '2010972': 'Suspicious DNS Queries'
    };

    return {
      source_ip: this.generateAttackerIP(),
      destination_ip: this.generateTargetIP(),
      signature_id: signatureId,
      description: descriptions[signatureId] || 'Unknown Attack Pattern'
    };
  }

  private getRandomAnomalyType(): string {
    const types = ['Unusual bandwidth', 'Suspicious protocol usage', 'Abnormal connection patterns', 'Potential data exfiltration'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomSeverity(): string {
    const severities = ['Low', 'Medium', 'High'];
    return severities[Math.floor(Math.random() * severities.length)];
  }

  private getAnomalyDescription(): string {
    const descriptions = [
      'Unusual spike in outbound traffic',
      'Abnormal protocol distribution',
      'Suspicious connection to external IP',
      'Potential lateral movement detected'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateRandomIP(): string {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private generateAttackerIP(): string {
    const attackerRanges = ['10.0.0', '172.16.0', '203.0.113'];
    const range = attackerRanges[Math.floor(Math.random() * attackerRanges.length)];
    return `${range}.${Math.floor(Math.random() * 255)}`;
  }

  private generateTargetIP(): string {
    return `192.168.1.${Math.floor(Math.random() * 50) + 10}`;
  }

  private generateTopTalkers() {
    return [
      { ip: '192.168.1.10', bytes: Math.floor(Math.random() * 1000000) },
      { ip: '192.168.1.15', bytes: Math.floor(Math.random() * 500000) },
      { ip: '192.168.1.20', bytes: Math.floor(Math.random() * 750000) }
    ];
  }

  private assessTrafficRisk(findings: any): string {
    const highSeverityAnomalies = findings.anomalies.filter((a: any) => a.severity === 'High').length;
    if (highSeverityAnomalies > 2) return 'High';
    if (findings.anomalies.length > 3) return 'Medium';
    return 'Low';
  }

  private generateTrafficRecommendations(findings: any): string[] {
    const recommendations = [];
    if (findings.anomalies.length > 0) {
      recommendations.push('Investigate flagged anomalies');
    }
    if (findings.bandwidthUsage > 80) {
      recommendations.push('Monitor bandwidth usage');
    }
    recommendations.push('Continue monitoring for patterns');
    return recommendations;
  }

  private getCorrelatedEvents(): string[] {
    return [
      'Previous port scan attempts',
      'Failed authentication logs',
      'Unusual network connections'
    ];
  }
}
