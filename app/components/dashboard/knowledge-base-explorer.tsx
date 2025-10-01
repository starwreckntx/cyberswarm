
// Knowledge Base Explorer Component

'use client';

import { useState } from 'react';
import { Database, Search, Filter, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CyberEvent } from '../../lib/types';

interface KnowledgeBaseExplorerProps {
  events: CyberEvent[];
}

const CATEGORY_ICONS = {
  'recon': '🔍',
  'vulnerabilities': '🎯',
  'intrusions': '🚨',
  'defense_actions': '🛡️',
  'adaptations': '🧠'
};

const CATEGORY_COLORS = {
  'recon': 'text-blue-400 bg-blue-400/10',
  'vulnerabilities': 'text-orange-400 bg-orange-400/10',
  'intrusions': 'text-red-400 bg-red-400/10',
  'defense_actions': 'text-green-400 bg-green-400/10',
  'adaptations': 'text-purple-400 bg-purple-400/10'
};

export function KnowledgeBaseExplorer({ events }: KnowledgeBaseExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categorizeEvents = () => {
    const categories: Record<string, CyberEvent[]> = {
      recon: events.filter(e => e.eventType === 'RECON_DATA'),
      vulnerabilities: events.filter(e => e.eventType === 'VULNERABILITY_FOUND'),
      intrusions: events.filter(e => e.eventType === 'INTRUSION_DETECTED'),
      defense_actions: events.filter(e => e.eventType === 'DEFENSE_ACTION'),
      adaptations: events.filter(e => e.eventType === 'ATTACK_ADAPTATION' || e.eventType === 'TARGET_REEVALUATION')
    };
    return categories;
  };

  const categories = categorizeEvents();

  const filteredEvents = () => {
    let filtered = events;

    if (selectedCategory !== 'all') {
      filtered = categories[selectedCategory] || [];
    }

    if (searchTerm) {
      filtered = filtered.filter(event =>
        JSON.stringify(event.payload).toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.target && event.target.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered.slice(0, 20); // Limit to 20 results
  };

  const getInsights = () => {
    const insights = [];
    
    if (categories.vulnerabilities.length > 0) {
      const criticalVulns = categories.vulnerabilities.filter(e => e.severity === 'Critical').length;
      insights.push({
        type: 'vulnerability',
        message: `${criticalVulns} critical vulnerabilities detected`,
        color: 'text-red-400'
      });
    }

    if (categories.intrusions.length > 0) {
      const uniqueIPs = new Set(
        categories.intrusions.map(e => e.payload?.source_ip).filter(Boolean)
      ).size;
      insights.push({
        type: 'intrusion',
        message: `Attacks from ${uniqueIPs} unique IP addresses`,
        color: 'text-orange-400'
      });
    }

    if (categories.defense_actions.length > 0) {
      const successfulDefenses = categories.defense_actions.filter(
        e => e.payload?.status === 'SUCCESS'
      ).length;
      insights.push({
        type: 'defense',
        message: `${successfulDefenses}/${categories.defense_actions.length} defense actions successful`,
        color: 'text-green-400'
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <Card className="bg-gray-900/50 border-gray-700 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Knowledge Base Explorer
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-gray-800 border-gray-600 text-green-400 rounded text-sm w-48"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border-gray-600 text-green-400 rounded px-2 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="recon">Reconnaissance</option>
              <option value="vulnerabilities">Vulnerabilities</option>
              <option value="intrusions">Intrusions</option>
              <option value="defense_actions">Defense Actions</option>
              <option value="adaptations">Adaptations</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Category Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Categories
            </h3>
            
            <div className="space-y-2">
              {Object.entries(categories).map(([category, categoryEvents]) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category ? 'all' : category
                  )}
                  className={`w-full p-2 rounded border text-left transition-all ${
                    selectedCategory === category
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
                      </span>
                      <span className="text-sm text-white capitalize">
                        {category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
                    }`}>
                      {categoryEvents.length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Security Insights
            </h3>
            
            <div className="space-y-2">
              {insights.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-xs">No insights available yet</p>
                </div>
              ) : (
                insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-800/30 rounded border border-gray-700"
                  >
                    <p className={`text-xs ${insight.color}`}>
                      {insight.message}
                    </p>
                  </div>
                ))
              )}
              
              {events.length > 0 && (
                <div className="p-2 bg-gray-800/30 rounded border border-gray-700">
                  <p className="text-xs text-blue-400">
                    Total events processed: {events.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">
              Event Details ({filteredEvents().length})
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredEvents().length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-xs">No events match your search</p>
                </div>
              ) : (
                filteredEvents().map((event) => (
                  <div
                    key={event.id}
                    className="p-2 bg-gray-800/30 rounded border border-gray-700 hover:bg-gray-800/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white">
                        {event.eventType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {event.target && (
                      <p className="text-xs text-gray-400 mb-1">
                        Target: {event.target}
                      </p>
                    )}
                    
                    {event.severity && (
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        event.severity === 'Critical' ? 'text-red-400 bg-red-400/20' :
                        event.severity === 'High' ? 'text-orange-400 bg-orange-400/20' :
                        event.severity === 'Medium' ? 'text-yellow-400 bg-yellow-400/20' :
                        'text-green-400 bg-green-400/20'
                      }`}>
                        {event.severity}
                      </span>
                    )}
                    
                    <p className="text-xs text-gray-300 mt-1 truncate">
                      {typeof event.payload === 'object' 
                        ? Object.entries(event.payload)
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')
                        : String(event.payload)}
                    </p>
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
