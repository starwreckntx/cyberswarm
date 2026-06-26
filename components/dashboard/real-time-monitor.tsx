
// Real-Time Event Monitor Component

'use client';

import { useState } from 'react';
import { Clock, AlertTriangle, Shield, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CyberEvent } from '../../lib/types';

interface RealTimeMonitorProps {
  events: CyberEvent[];
  selectedEvent: string | null;
  onSelectEvent: (eventId: string | null) => void;
}

const EVENT_COLORS = {
  'RECON_DATA': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'VULNERABILITY_FOUND': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'INTRUSION_DETECTED': 'text-red-400 bg-red-400/10 border-red-400/20',
  'DEFENSE_ACTION': 'text-green-400 bg-green-400/10 border-green-400/20',
  'ATTACK_ADAPTATION': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'TARGET_REEVALUATION': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
};

const EVENT_ICONS = {
  'RECON_DATA': '🔍',
  'VULNERABILITY_FOUND': '🎯',
  'INTRUSION_DETECTED': '🚨',
  'DEFENSE_ACTION': '🛡️',
  'ATTACK_ADAPTATION': '🧠',
  'TARGET_REEVALUATION': '📊'
};

const SEVERITY_COLORS = {
  'Critical': 'text-red-500',
  'High': 'text-orange-500',
  'Medium': 'text-yellow-500',
  'Low': 'text-green-500'
};

export function RealTimeMonitor({
  events,
  selectedEvent,
  onSelectEvent
}: RealTimeMonitorProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.eventType === filter;
  });

  const eventTypes = Array.from(new Set(events.map(e => e.eventType)));

  const formatPayload = (payload: any) => {
    if (typeof payload === 'object') {
      return Object.entries(payload)
        .slice(0, 3) // Show first 3 properties
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return String(payload);
  };

  const getEventDescription = (event: CyberEvent) => {
    switch (event.eventType) {
      case 'RECON_DATA':
        return `Reconnaissance on ${event.payload?.target_ip} - ${event.payload?.open_ports?.length || 0} ports`;
      case 'VULNERABILITY_FOUND':
        return `${event.payload?.cve_id} on ${event.payload?.target_ip}:${event.payload?.target_port}`;
      case 'INTRUSION_DETECTED':
        return `${event.payload?.description} from ${event.payload?.source_ip}`;
      case 'DEFENSE_ACTION':
        return `${event.payload?.action_type} - ${event.payload?.target_cve} (${event.payload?.status})`;
      case 'ATTACK_ADAPTATION':
        return event.payload?.strategy_change;
      case 'TARGET_REEVALUATION':
        return `${event.payload?.evaluation_result} - ${event.payload?.reasoning}`;
      default:
        return formatPayload(event.payload);
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Real-Time Security Events
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border-gray-600 text-green-400 rounded px-2 py-1 text-sm"
            >
              <option value="all">All Events</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <div className="text-sm text-gray-400">
              {filteredEvents.length} events
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No events yet. Start the simulation to see real-time activity.</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  selectedEvent === event.id
                    ? 'border-red-500 bg-red-500/10'
                    : EVENT_COLORS[event.eventType as keyof typeof EVENT_COLORS] || 'border-gray-700 bg-gray-800/30'
                } hover:bg-opacity-75`}
                onClick={() => onSelectEvent(
                  selectedEvent === event.id ? null : event.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-lg mt-0.5">
                      {EVENT_ICONS[event.eventType as keyof typeof EVENT_ICONS] || '📡'}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {event.eventType.replace('_', ' ')}
                        </h4>
                        
                        {event.severity && (
                          <span className={`text-xs px-2 py-1 rounded ${SEVERITY_COLORS[event.severity as keyof typeof SEVERITY_COLORS]} bg-opacity-20`}>
                            {event.severity}
                          </span>
                        )}
                        
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-300 truncate">
                        {getEventDescription(event)}
                      </p>
                      
                      {event.target && (
                        <p className="text-xs text-gray-500 mt-1">
                          Target: {event.target}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={(e) => e.stopPropagation()}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {selectedEvent === event.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {selectedEvent === event.id && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-400">Agent ID:</span>
                          <p className="text-green-400 font-mono">
                            {event.agentId || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Task ID:</span>
                          <p className="text-green-400 font-mono">
                            {event.taskId || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Payload:</span>
                        <pre className="text-green-400 font-mono bg-gray-800 p-2 rounded mt-1 overflow-x-auto text-xs">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
