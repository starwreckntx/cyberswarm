
// Main Cybersecurity Dashboard Component

'use client';

import { useState } from 'react';
import { useSimulationStream } from '../../hooks/use-simulation-stream';
import { DashboardHeader } from './dashboard-header';
import { AgentControlPanel } from './agent-control-panel';
import { RealTimeMonitor } from './real-time-monitor';
import { LogicPipeVisualization } from './logic-pipe-visualization';
import { KnowledgeBaseExplorer } from './knowledge-base-explorer';
import { ChainOfThoughtPanel } from './chain-of-thought-panel';

export function CyberSecurityDashboard() {
  const {
    isConnected,
    isRunning,
    agents,
    recentEvents,
    recentChainOfThoughts,
    logicPipeExecutions,
    agentStats,
    error,
    startSimulation,
    stopSimulation,
    injectTask,
    controlAgent
  } = useSimulationStream();

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono">
      {/* Header */}
      <DashboardHeader 
        isConnected={isConnected}
        isRunning={isRunning}
        agentStats={agentStats}
        onStartSimulation={startSimulation}
        onStopSimulation={stopSimulation}
        error={error}
      />

      {/* Main Dashboard Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Sidebar - Agent Control */}
          <div className="col-span-3 space-y-6">
            <AgentControlPanel
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              onControlAgent={controlAgent}
              onInjectTask={injectTask}
            />
          </div>

          {/* Center Content */}
          <div className="col-span-6 space-y-6">
            {/* Real-Time Execution Monitor */}
            <div className="h-[40%]">
              <RealTimeMonitor
                events={recentEvents}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
              />
            </div>

            {/* Logic Pipe Visualization */}
            <div className="h-[25%]">
              <LogicPipeVisualization
                executions={logicPipeExecutions}
                agents={agents}
              />
            </div>

            {/* Knowledge Base Explorer */}
            <div className="h-[35%]">
              <KnowledgeBaseExplorer
                events={recentEvents}
              />
            </div>
          </div>

          {/* Right Sidebar - Chain of Thought */}
          <div className="col-span-3">
            <ChainOfThoughtPanel
              chainOfThoughts={recentChainOfThoughts}
              selectedAgent={selectedAgent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
