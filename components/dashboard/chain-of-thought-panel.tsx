
// Chain of Thought Panel Component

'use client';

import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChainOfThought } from '../../lib/types';

interface ChainOfThoughtPanelProps {
  chainOfThoughts: ChainOfThought[];
  selectedAgent?: string | null;
}

const STEP_TYPE_COLORS = {
  'analysis': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'decision': 'text-green-400 bg-green-400/10 border-green-400/20',
  'action': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'evaluation': 'text-purple-400 bg-purple-400/10 border-purple-400/20'
};

const STEP_TYPE_ICONS = {
  'analysis': Lightbulb,
  'decision': CheckCircle,
  'action': AlertCircle,
  'evaluation': Brain
};

export function ChainOfThoughtPanel({
  chainOfThoughts,
  selectedAgent
}: ChainOfThoughtPanelProps) {
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');

  const filteredThoughts = chainOfThoughts.filter(thought => {
    if (selectedAgent && thought.agentId !== selectedAgent) return false;
    if (filter !== 'all' && thought.stepType !== filter) return false;
    return true;
  }).slice(0, 50); // Limit to 50 most recent thoughts

  const toggleExpanded = (thoughtId: string) => {
    const newExpanded = new Set(expandedThoughts);
    if (newExpanded.has(thoughtId)) {
      newExpanded.delete(thoughtId);
    } else {
      newExpanded.add(thoughtId);
    }
    setExpandedThoughts(newExpanded);
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'N/A';
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  };

  const getAgentShortName = (agentId: string) => {
    if (agentId.includes('discovery')) return 'DISC';
    if (agentId.includes('vuln')) return 'VULN';
    if (agentId.includes('patch')) return 'PATCH';
    if (agentId.includes('monitor')) return 'MON';
    if (agentId.includes('strategy')) return 'STRAT';
    return agentId.slice(0, 4).toUpperCase();
  };

  const stepTypes = Array.from(new Set(chainOfThoughts.map(t => t.stepType)));

  return (
    <Card className="bg-gray-900/50 border-gray-700 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Chain of Thought
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border-gray-600 text-green-400 rounded px-2 py-1 text-xs"
            >
              <option value="all">All Steps</option>
              {stepTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            
            <div className="text-xs text-gray-400">
              {filteredThoughts.length} thoughts
            </div>
          </div>
        </div>
        
        {selectedAgent && (
          <p className="text-xs text-gray-400">
            Showing thoughts for: {selectedAgent}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredThoughts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No reasoning data yet. Agents will share their thought processes here.</p>
            </div>
          ) : (
            filteredThoughts.map((thought) => {
              const isExpanded = expandedThoughts.has(thought.id);
              const StepIcon = STEP_TYPE_ICONS[thought.stepType as keyof typeof STEP_TYPE_ICONS] || Brain;
              
              return (
                <div
                  key={thought.id}
                  className={`p-3 rounded border transition-all ${
                    STEP_TYPE_COLORS[thought.stepType as keyof typeof STEP_TYPE_COLORS] || 'border-gray-700 bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      <div className="flex flex-col items-center mt-0.5">
                        <StepIcon className="h-4 w-4" />
                        <div className="text-xs mt-1 px-1 py-0.5 bg-gray-700 rounded">
                          {thought.stepNumber}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                            {getAgentShortName(thought.agentId)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(thought.timestamp).toLocaleTimeString()}
                          </span>
                          {thought.confidence !== undefined && (
                            <span className={`text-xs ${getConfidenceColor(thought.confidence)}`}>
                              {getConfidenceLabel(thought.confidence)} ({(thought.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-sm font-medium text-white mb-1">
                          {thought.description}
                        </h4>
                        
                        <p className={`text-xs text-gray-300 ${
                          isExpanded ? '' : 'line-clamp-2'
                        }`}>
                          {thought.reasoning}
                        </p>
                        
                        {thought.data && isExpanded && (
                          <div className="mt-2 p-2 bg-gray-800 rounded">
                            <span className="text-xs text-gray-400 block mb-1">Supporting Data:</span>
                            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                              {JSON.stringify(thought.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => toggleExpanded(thought.id)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {isExpanded && thought.taskId && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <span className="text-xs text-gray-400">Task ID:</span>
                      <p className="text-xs text-green-400 font-mono">
                        {thought.taskId}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {filteredThoughts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing {filteredThoughts.length} of {chainOfThoughts.length} total thoughts
              </span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded"></div>
                  <span>Analysis</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded"></div>
                  <span>Decision</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded"></div>
                  <span>Action</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded"></div>
                  <span>Evaluation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
