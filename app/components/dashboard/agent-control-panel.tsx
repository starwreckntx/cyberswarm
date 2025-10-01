
// Agent Control Panel Component

'use client';

import { useState } from 'react';
import { Play, Square, Eye, Settings, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Agent } from '../../lib/types';

interface AgentControlPanelProps {
  agents: Agent[];
  selectedAgent: string | null;
  onSelectAgent: (agentId: string | null) => void;
  onControlAgent: (agentId: string, action: 'start' | 'stop') => void;
  onInjectTask: (agentType: string, taskName: string, target?: string, details?: any) => void;
}

const AGENT_COLORS = {
  'DiscoveryAgent': 'text-blue-400',
  'VulnerabilityScannerAgent': 'text-orange-400',
  'PatchManagementAgent': 'text-green-400',
  'NetworkMonitorAgent': 'text-purple-400',
  'StrategyAdaptationAgent': 'text-red-400'
};

const AGENT_TASKS = {
  'DiscoveryAgent': ['port_scan', 'network_scan', 'service_enum'],
  'VulnerabilityScannerAgent': ['vuln_scan', 'config_audit', 'webapp_scan'],
  'PatchManagementAgent': ['remediate_vuln', 'enforce_config'],
  'NetworkMonitorAgent': ['intrusion_detection', 'traffic_analysis'],
  'StrategyAdaptationAgent': ['adapt_attack_strategy', 're_evaluate_target', 'analyze_defenses']
};

export function AgentControlPanel({
  agents,
  selectedAgent,
  onSelectAgent,
  onControlAgent,
  onInjectTask
}: AgentControlPanelProps) {
  const [showTaskInject, setShowTaskInject] = useState(false);
  const [taskAgentType, setTaskAgentType] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskTarget, setTaskTarget] = useState('192.168.1.10');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDLE': return 'text-green-400 bg-green-400/10';
      case 'BUSY': return 'text-yellow-400 bg-yellow-400/10';
      case 'ERROR': return 'text-red-400 bg-red-400/10';
      case 'OFFLINE': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'DiscoveryAgent': return '🔍';
      case 'VulnerabilityScannerAgent': return '🎯';
      case 'PatchManagementAgent': return '🛡️';
      case 'NetworkMonitorAgent': return '👁️';
      case 'StrategyAdaptationAgent': return '🧠';
      default: return '🤖';
    }
  };

  const handleTaskInject = async () => {
    if (!taskAgentType || !taskName) return;
    
    try {
      await onInjectTask(taskAgentType, taskName, taskTarget || undefined);
      setShowTaskInject(false);
      setTaskAgentType('');
      setTaskName('');
      setTaskTarget('192.168.1.10');
    } catch (error) {
      console.error('Failed to inject task:', error);
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Agent Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Task Injection */}
        <div className="space-y-2">
          <Button
            onClick={() => setShowTaskInject(!showTaskInject)}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30"
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Manual Task Injection
          </Button>
          
          {showTaskInject && (
            <div className="space-y-2 p-3 bg-gray-800/50 rounded border border-gray-700">
              <select
                value={taskAgentType}
                onChange={(e) => {
                  setTaskAgentType(e.target.value);
                  setTaskName('');
                }}
                className="w-full bg-gray-800 border-gray-600 text-green-400 rounded px-2 py-1 text-sm"
              >
                <option value="">Select Agent Type</option>
                {Object.keys(AGENT_TASKS).map(type => (
                  <option key={type} value={type}>
                    {type.replace('Agent', '')}
                  </option>
                ))}
              </select>
              
              {taskAgentType && (
                <select
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full bg-gray-800 border-gray-600 text-green-400 rounded px-2 py-1 text-sm"
                >
                  <option value="">Select Task</option>
                  {AGENT_TASKS[taskAgentType as keyof typeof AGENT_TASKS]?.map(task => (
                    <option key={task} value={task}>
                      {task.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              )}
              
              <input
                type="text"
                value={taskTarget}
                onChange={(e) => setTaskTarget(e.target.value)}
                placeholder="Target (optional)"
                className="w-full bg-gray-800 border-gray-600 text-green-400 rounded px-2 py-1 text-sm"
              />
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleTaskInject}
                  disabled={!taskAgentType || !taskName}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                >
                  Inject
                </Button>
                <Button
                  onClick={() => setShowTaskInject(false)}
                  variant="outline"
                  className="flex-1 text-xs py-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Agent List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300">Active Agents</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {agents.map((agent) => (
              <div
                key={agent.agentId}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  selectedAgent === agent.agentId
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                }`}
                onClick={() => onSelectAgent(
                  selectedAgent === agent.agentId ? null : agent.agentId
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getAgentIcon(agent.agentType)}
                    </span>
                    <div>
                      <h4 className={`text-sm font-medium ${AGENT_COLORS[agent.agentType as keyof typeof AGENT_COLORS] || 'text-gray-400'}`}>
                        {agent.agentType.replace('Agent', '')}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {agent.agentId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                    
                    <div className="flex space-x-1">
                      {agent.status === 'OFFLINE' ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onControlAgent(agent.agentId, 'start');
                          }}
                          size="sm"
                          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onControlAgent(agent.agentId, 'stop');
                          }}
                          size="sm"
                          className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        onClick={(e) => e.stopPropagation()}
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {selectedAgent === agent.agentId && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Seen:</span>
                        <span className="text-green-400">
                          {new Date(agent.lastSeen).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Registered:</span>
                        <span className="text-green-400">
                          {new Date(agent.registeredAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-400 mt-2">
                        <div className="text-xs font-medium mb-1">Supported Tasks:</div>
                        <div className="flex flex-wrap gap-1">
                          {agent.supportedTasks.map(task => (
                            <span
                              key={task}
                              className="px-2 py-1 bg-gray-700 rounded text-xs"
                            >
                              {task.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
