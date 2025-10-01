
// Simulation Control API - Start, stop, and manage cybersecurity simulation

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
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Simulation status error:', error);
    return NextResponse.json(
      { error: 'Failed to get simulation status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, targetNetwork } = body;
    
    const orch = getOrchestrator();
    
    switch (action) {
      case 'start':
        orch.startSimulation(targetNetwork);
        return NextResponse.json({ 
          message: 'Simulation started',
          status: orch.getSimulationStatus()
        });
        
      case 'stop':
        orch.stopSimulation();
        return NextResponse.json({ 
          message: 'Simulation stopped',
          status: orch.getSimulationStatus()
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "start" or "stop"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Simulation control error:', error);
    return NextResponse.json(
      { error: 'Failed to control simulation' },
      { status: 500 }
    );
  }
}
