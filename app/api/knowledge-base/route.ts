
// Knowledge Base API - Access cybersecurity event data and analytics

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const orch = getOrchestrator();
    
    if (category === 'events') {
      const events = orch.getEventHistory(limit);
      return NextResponse.json({ events });
    }
    
    if (category === 'chain-of-thought') {
      const thoughts = orch.getChainOfThoughtHistory(limit);
      return NextResponse.json({ chainOfThoughts: thoughts });
    }
    
    if (category === 'logic-pipe') {
      const executions = orch.getLogicPipeExecutions(limit);
      return NextResponse.json({ logicPipeExecutions: executions });
    }
    
    if (category === 'analytics') {
      const analytics = orch.getAnalytics();
      return NextResponse.json({ analytics });
    }
    
    // Default: return knowledge base summary
    const knowledgeBase = orch.getKnowledgeBase();
    return NextResponse.json({ knowledgeBase });
    
  } catch (error) {
    console.error('Knowledge base error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve knowledge base data' },
      { status: 500 }
    );
  }
}
