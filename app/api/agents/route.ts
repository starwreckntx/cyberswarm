
// Agent Management API - Control individual agents

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { CyberSecurityOrchestrator } from '../../../lib/orchestrator/cybersecurity-orchestrator';

// Global orchestrator instance
let orchestrator: CyberSecurityOrchestrator | null = null;

function getOrchestrator(): CyberSecurityOrchestrator {
  if (!orchestrator) {
    orchestrator = new CyberSecurityOrchestrator();
  }
  return orchestrator;
}

export async function GET() {
  try {
    const orch = getOrchestrator();
    const status = orch.getSimulationStatus();
    
    return NextResponse.json({
      agents: status.agents,
      agentStats: status.agentStats
    });
  } catch (error) {
    console.error('Agent status error:', error);
    return NextResponse.json(
      { error: 'Failed to get agent status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, action } = body;
    
    if (!agentId || !action) {
      return NextResponse.json(
        { error: 'agentId and action are required' },
        { status: 400 }
      );
    }
    
    const orch = getOrchestrator();
    let success = false;
    
    switch (action) {
      case 'start':
        success = orch.startAgent(agentId);
        break;
      case 'stop':
        success = orch.stopAgent(agentId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "start" or "stop"' },
          { status: 400 }
        );
    }
    
    if (success) {
      return NextResponse.json({
        message: `Agent ${agentId} ${action}ed successfully`,
        agentId,
        action
      });
    } else {
      return NextResponse.json(
        { error: `Failed to ${action} agent ${agentId}` },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Agent control error:', error);
    return NextResponse.json(
      { error: 'Failed to control agent' },
      { status: 500 }
    );
  }
}
