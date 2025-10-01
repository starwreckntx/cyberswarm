
// Real-time Event Streaming API using Server-Sent Events

export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server';
import { CyberSecurityOrchestrator } from '../../../../lib/orchestrator/cybersecurity-orchestrator';
import { StreamEvent } from '../../../../lib/types';

// Global orchestrator instance
let orchestrator: CyberSecurityOrchestrator | null = null;

function getOrchestrator(): CyberSecurityOrchestrator {
  if (!orchestrator) {
    orchestrator = new CyberSecurityOrchestrator();
  }
  return orchestrator;
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const readable = new ReadableStream({
    start(controller) {
      console.log('🔄 Starting SSE stream for cybersecurity events');
      
      const orch = getOrchestrator();
      
      // Set up the stream event callback
      orch.setStreamEventCallback((event: StreamEvent) => {
        try {
          const data = JSON.stringify({
            type: event.type,
            data: event.data,
            timestamp: event.timestamp.toISOString()
          });
          
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error('Error encoding stream event:', error);
        }
      });
      
      // Send initial status
      const initialStatus = orch.getSimulationStatus();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'initial_status',
        data: initialStatus,
        timestamp: new Date().toISOString()
      })}\n\n`));
      
      // Keep connection alive with periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'heartbeat',
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString()
          })}\n\n`));
        } catch (error) {
          console.error('Heartbeat error:', error);
          clearInterval(heartbeatInterval);
        }
      }, 30000); // 30 second heartbeat
      
      // Handle stream cleanup
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        console.log('🔄 SSE stream closed');
      };
      
      // Cleanup on stream close
      request.signal.addEventListener('abort', cleanup);
      
      return () => cleanup();
    },
    
    cancel() {
      console.log('🔄 SSE stream cancelled');
    }
  });
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
