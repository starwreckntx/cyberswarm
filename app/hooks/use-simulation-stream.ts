
// Real-time Simulation Event Stream Hook

'use client';

import { useState, useEffect, useRef } from 'react';
import { StreamEvent, Agent, CyberEvent, ChainOfThought, LogicPipeExecution } from '../lib/types';

interface SimulationState {
  isConnected: boolean;
  isRunning: boolean;
  agents: Agent[];
  recentEvents: CyberEvent[];
  recentChainOfThoughts: ChainOfThought[];
  logicPipeExecutions: LogicPipeExecution[];
  agentStats: any;
  error?: string;
}

export function useSimulationStream() {
  const [state, setState] = useState<SimulationState>({
    isConnected: false,
    isRunning: false,
    agents: [],
    recentEvents: [],
    recentChainOfThoughts: [],
    logicPipeExecutions: [],
    agentStats: null
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to Server-Sent Events stream
    console.log('🔄 Connecting to simulation stream...');
    
    const eventSource = new EventSource('/api/simulation/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Stream connected');
      setState(prev => ({ ...prev, isConnected: true, error: undefined }));
    };

    eventSource.onmessage = (event) => {
      try {
        const streamEvent: StreamEvent = JSON.parse(event.data);
        
        setState(prev => {
          const newState = { ...prev };
          
          switch (streamEvent.type) {
            case 'initial_status':
              const status = streamEvent.data;
              newState.isRunning = status.isRunning;
              newState.agents = status.agents || [];
              newState.agentStats = status.agentStats;
              newState.recentEvents = status.recentEvents || [];
              newState.recentChainOfThoughts = status.recentChainOfThoughts || [];
              break;
              
            case 'agent_status':
              newState.agents = newState.agents.map(agent => 
                agent.agentId === streamEvent.data.agentId 
                  ? { ...agent, status: streamEvent.data.status, lastSeen: new Date() }
                  : agent
              );
              break;
              
            case 'event_created':
              const newEvent = streamEvent.data as CyberEvent;
              newState.recentEvents = [newEvent, ...newState.recentEvents.slice(0, 19)];
              break;
              
            case 'chain_of_thought':
              const newThought = streamEvent.data as ChainOfThought;
              newState.recentChainOfThoughts = [newThought, ...newState.recentChainOfThoughts.slice(0, 49)];
              break;
              
            case 'logic_pipe_execution':
              const newExecution = streamEvent.data as LogicPipeExecution;
              newState.logicPipeExecutions = [newExecution, ...newState.logicPipeExecutions.slice(0, 29)];
              break;
              
            case 'heartbeat':
              // Keep connection alive
              break;
              
            default:
              console.log('Unknown stream event type:', streamEvent.type);
          }
          
          return newState;
        });
        
      } catch (error) {
        console.error('Error parsing stream event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Stream error:', error);
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: 'Connection lost. Attempting to reconnect...' 
      }));
    };

    // Cleanup on unmount
    return () => {
      console.log('🔄 Closing stream connection');
      eventSource.close();
    };
  }, []);

  const startSimulation = async (targetNetwork?: string) => {
    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', targetNetwork })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start simulation');
      }
      
      const result = await response.json();
      console.log('🎬 Simulation started:', result);
      
    } catch (error) {
      console.error('Error starting simulation:', error);
      setState(prev => ({ ...prev, error: 'Failed to start simulation' }));
    }
  };

  const stopSimulation = async () => {
    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop simulation');
      }
      
      const result = await response.json();
      console.log('🛑 Simulation stopped:', result);
      
    } catch (error) {
      console.error('Error stopping simulation:', error);
      setState(prev => ({ ...prev, error: 'Failed to stop simulation' }));
    }
  };

  const injectTask = async (agentType: string, taskName: string, target?: string, details?: any) => {
    try {
      const response = await fetch('/api/simulation/inject-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType, taskName, target, details })
      });
      
      if (!response.ok) {
        throw new Error('Failed to inject task');
      }
      
      const result = await response.json();
      console.log('🔧 Task injected:', result);
      
      return result;
      
    } catch (error) {
      console.error('Error injecting task:', error);
      setState(prev => ({ ...prev, error: 'Failed to inject task' }));
      throw error;
    }
  };

  const controlAgent = async (agentId: string, action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, action })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} agent`);
      }
      
      const result = await response.json();
      console.log(`🤖 Agent ${action}ed:`, result);
      
    } catch (error) {
      console.error(`Error ${action}ing agent:`, error);
      setState(prev => ({ ...prev, error: `Failed to ${action} agent` }));
    }
  };

  return {
    ...state,
    startSimulation,
    stopSimulation,
    injectTask,
    controlAgent
  };
}
