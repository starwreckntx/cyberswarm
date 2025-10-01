
// Logic Pipe Visualization Component

'use client';

import { useState } from 'react';
import { GitBranch, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LogicPipeExecution, Agent } from '../../lib/types';

interface LogicPipeVisualizationProps {
  executions: LogicPipeExecution[];
  agents: Agent[];
}

const RULE_COLORS = {
  'RED_DISCOVERS_BLUE_REACTS': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  'BLUE_DETECTS_RED_ADAPTS': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  'BLUE_DEFENDS_RED_REEVALUATES': 'text-green-400 border-green-400/30 bg-green-400/10'
};

const RULE_DESCRIPTIONS = {
  'RED_DISCOVERS_BLUE_REACTS': 'Red Team discovers vulnerabilities → Blue Team reacts with defenses',
  'BLUE_DETECTS_RED_ADAPTS': 'Blue Team detects intrusions → Red Team adapts strategy',
  'BLUE_DEFENDS_RED_REEVALUATES': 'Blue Team implements defenses → Red Team re-evaluates targets'
};

const FLOW_PATTERNS = [
  {
    id: 'pattern1',
    name: 'Discovery → Response',
    rule: 'RED_DISCOVERS_BLUE_REACTS',
    steps: ['Reconnaissance', 'Vulnerability Detection', 'Defense Deployment'],
    color: 'orange'
  },
  {
    id: 'pattern2',
    name: 'Detection → Adaptation',
    rule: 'BLUE_DETECTS_RED_ADAPTS',
    steps: ['Intrusion Detection', 'Strategy Analysis', 'Tactical Adaptation'],
    color: 'blue'
  },
  {
    id: 'pattern3',
    name: 'Defense → Re-evaluation',
    rule: 'BLUE_DEFENDS_RED_REEVALUATES',
    steps: ['Defense Action', 'Impact Assessment', 'Target Re-evaluation'],
    color: 'green'
  }
];

export function LogicPipeVisualization({
  executions,
  agents
}: LogicPipeVisualizationProps) {
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  const recentExecutions = executions.slice(0, 5);
  
  const getExecutionStats = () => {
    const total = executions.length;
    const successful = executions.filter(e => e.success).length;
    const avgTime = executions.length > 0 
      ? executions.reduce((sum, e) => sum + (e.executionTime || 0), 0) / executions.length 
      : 0;

    return { total, successful, avgTime };
  };

  const { total, successful, avgTime } = getExecutionStats();

  return (
    <Card className="bg-gray-900/50 border-gray-700 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center">
            <GitBranch className="h-5 w-5 mr-2" />
            Logic Pipe Flow Analysis
          </CardTitle>
          
          <div className="flex items-center space-x-4 text-xs">
            <div className="text-gray-400">
              Executions: <span className="text-green-400">{total}</span>
            </div>
            <div className="text-gray-400">
              Success: <span className="text-green-400">{successful}/{total}</span>
            </div>
            <div className="text-gray-400">
              Avg Time: <span className="text-green-400">{avgTime.toFixed(1)}ms</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Flow Patterns */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Interaction Flows</h3>
            {FLOW_PATTERNS.map((pattern) => {
              const patternExecutions = executions.filter(e => e.ruleApplied === pattern.rule);
              const isActive = patternExecutions.length > 0 && 
                               patternExecutions[0].timestamp > new Date(Date.now() - 30000);
              
              return (
                <div
                  key={pattern.id}
                  className={`p-3 rounded border transition-all ${
                    isActive 
                      ? RULE_COLORS[pattern.rule as keyof typeof RULE_COLORS]
                      : 'border-gray-700 bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-medium ${
                      isActive 
                        ? `text-${pattern.color}-400`
                        : 'text-gray-400'
                    }`}>
                      {pattern.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">
                        {patternExecutions.length}x
                      </span>
                      {isActive && (
                        <div className={`w-2 h-2 rounded-full bg-${pattern.color}-400 animate-pulse`} />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    {pattern.steps.map((step, index) => (
                      <div key={step} className="flex items-center space-x-1">
                        <span className={`${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}>
                          {step}
                        </span>
                        {index < pattern.steps.length - 1 && (
                          <ArrowRight className={`h-3 w-3 ${
                            isActive ? `text-${pattern.color}-400` : 'text-gray-600'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {RULE_DESCRIPTIONS[pattern.rule as keyof typeof RULE_DESCRIPTIONS]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent Executions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Recent Executions</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentExecutions.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No executions yet</p>
                </div>
              ) : (
                recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      selectedExecution === execution.id
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedExecution(
                      selectedExecution === execution.id ? null : execution.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {execution.success ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <div>
                          <p className="text-xs font-medium text-white">
                            {execution.triggerEvent.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {execution.executionTime}ms
                          </p>
                        </div>
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        {new Date(execution.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {selectedExecution === execution.id && (
                      <div className="mt-2 pt-2 border-t border-gray-700 text-xs space-y-1">
                        <div>
                          <span className="text-gray-400">Rule:</span>
                          <p className="text-green-400">
                            {execution.ruleApplied.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Tasks Created:</span>
                          <p className="text-green-400">
                            {Array.isArray(execution.outputTasks) 
                              ? execution.outputTasks.length 
                              : 0}
                          </p>
                        </div>
                        {execution.errorMessage && (
                          <div>
                            <span className="text-gray-400">Error:</span>
                            <p className="text-red-400">
                              {execution.errorMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
