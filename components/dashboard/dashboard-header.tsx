
// Dashboard Header Component

'use client';

import { Shield, Play, Square, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardHeaderProps {
  isConnected: boolean;
  isRunning: boolean;
  agentStats: any;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  error?: string;
}

export function DashboardHeader({
  isConnected,
  isRunning,
  agentStats,
  onStartSimulation,
  onStopSimulation,
  error
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-red-900/20 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/75">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Cybersecurity Agent Swarm
                </h1>
                <p className="text-sm text-gray-400">
                  Real-time Security Operations Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Agent Stats */}
            {agentStats && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400">{agentStats.idle} Idle</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400">{agentStats.busy} Busy</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400">{agentStats.error} Error</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Simulation Controls */}
            <div className="flex items-center space-x-2">
              {!isRunning ? (
                <Button
                  onClick={onStartSimulation}
                  disabled={!isConnected}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
              ) : (
                <Button
                  onClick={onStopSimulation}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Simulation
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
