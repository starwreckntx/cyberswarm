
// Manual Task Injection API for testing and demonstration

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { CyberSecurityOrchestrator } from '../../../../lib/orchestrator/cybersecurity-orchestrator';

// Global orchestrator instance
let orchestrator: CyberSecurityOrchestrator | null = null;

function getOrchestrator(): CyberSecurityOrchestrator {
  if (!orchestrator) {
    orchestrator = new CyberSecurityOrchestrator();
  }
  return orchestrator;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentType, taskName, target, details, priority } = body;
    
    // Validate required fields
    if (!agentType || !taskName) {
      return NextResponse.json(
        { error: 'agentType and taskName are required' },
        { status: 400 }
      );
    }
    
    // Validate agent type
    const validAgentTypes = [
      'DiscoveryAgent',
      'VulnerabilityScannerAgent',
      'PatchManagementAgent', 
      'NetworkMonitorAgent',
      'StrategyAdaptationAgent'
    ];
    
    if (!validAgentTypes.includes(agentType)) {
      return NextResponse.json(
        { error: `Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    const orch = getOrchestrator();
    
    // Inject the task
    const task = orch.injectTask(agentType, taskName, target, details);
    
    console.log(`🔧 Manual task injected: ${taskName} for ${agentType}`);
    
    return NextResponse.json({
      message: 'Task injected successfully',
      task: {
        taskId: task.taskId,
        agentType: task.agentType,
        taskName: task.taskName,
        target: task.target,
        status: task.status,
        createdAt: task.createdAt
      }
    });
    
  } catch (error) {
    console.error('Task injection error:', error);
    return NextResponse.json(
      { error: 'Failed to inject task' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orch = getOrchestrator();
    const taskQueue = orch.getSimulationStatus().taskQueue;
    
    return NextResponse.json({
      pendingTasks: taskQueue.filter(t => t.status === 'PENDING'),
      executingTasks: taskQueue.filter(t => t.status === 'EXECUTING'),
      totalTasks: taskQueue.length
    });
    
  } catch (error) {
    console.error('Task queue error:', error);
    return NextResponse.json(
      { error: 'Failed to get task queue' },
      { status: 500 }
    );
  }
}
