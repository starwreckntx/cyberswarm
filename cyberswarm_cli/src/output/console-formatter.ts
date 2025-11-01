
// Console output formatting utilities

import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';
import { Agent, CyberEvent, Task, ChainOfThought } from '../types.js';

/**
 * Format banner
 */
export function formatBanner(text: string): string {
  return boxen(chalk.bold.cyan(text), {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'cyan',
  });
}

/**
 * Format section header
 */
export function formatSectionHeader(text: string): string {
  return chalk.bold.yellow(`\n▶ ${text}`);
}

/**
 * Format success message
 */
export function formatSuccess(text: string): string {
  return chalk.green(`✓ ${text}`);
}

/**
 * Format error message
 */
export function formatError(text: string): string {
  return chalk.red(`✗ ${text}`);
}

/**
 * Format warning message
 */
export function formatWarning(text: string): string {
  return chalk.yellow(`⚠ ${text}`);
}

/**
 * Format info message
 */
export function formatInfo(text: string): string {
  return chalk.blue(`ℹ ${text}`);
}

/**
 * Format agent status
 */
export function formatAgentStatus(agent: Agent): string {
  const statusColors = {
    IDLE: chalk.green,
    BUSY: chalk.yellow,
    ERROR: chalk.red,
    OFFLINE: chalk.gray,
  };

  const statusColor = statusColors[agent.status] || chalk.white;
  return statusColor(`● ${agent.status.padEnd(7)} `);
}

/**
 * Format agents table
 */
export function formatAgentsTable(agents: Agent[]): string {
  const table = new Table({
    head: [
      chalk.bold('Agent ID'),
      chalk.bold('Name'),
      chalk.bold('Type'),
      chalk.bold('Status'),
      chalk.bold('Tasks'),
    ],
    colWidths: [20, 30, 30, 12, 30],
  });

  for (const agent of agents) {
    table.push([
      agent.agentId,
      agent.agentName,
      agent.agentType,
      formatAgentStatus(agent),
      agent.supportedTasks.slice(0, 2).join(', ') + '...',
    ]);
  }

  return table.toString();
}

/**
 * Format events table
 */
export function formatEventsTable(events: CyberEvent[], limit: number = 10): string {
  const table = new Table({
    head: [
      chalk.bold('Time'),
      chalk.bold('Type'),
      chalk.bold('Severity'),
      chalk.bold('Target'),
      chalk.bold('Agent'),
    ],
    colWidths: [12, 25, 12, 18, 20],
  });

  const recentEvents = events.slice(-limit);

  for (const event of recentEvents) {
    const severityColor =
      event.severity === 'Critical'
        ? chalk.red
        : event.severity === 'High'
        ? chalk.yellow
        : event.severity === 'Medium'
        ? chalk.blue
        : chalk.gray;

    table.push([
      new Date(event.timestamp).toLocaleTimeString(),
      event.eventType,
      severityColor(event.severity || 'N/A'),
      event.target || 'N/A',
      event.agentId || 'N/A',
    ]);
  }

  return table.toString();
}

/**
 * Format tasks table
 */
export function formatTasksTable(tasks: Task[]): string {
  const table = new Table({
    head: [
      chalk.bold('Task ID'),
      chalk.bold('Agent Type'),
      chalk.bold('Task'),
      chalk.bold('Status'),
      chalk.bold('Target'),
    ],
    colWidths: [25, 28, 20, 12, 18],
  });

  for (const task of tasks) {
    const statusColor =
      task.status === 'COMPLETED'
        ? chalk.green
        : task.status === 'EXECUTING'
        ? chalk.yellow
        : task.status === 'FAILED'
        ? chalk.red
        : chalk.gray;

    table.push([
      task.taskId.substring(0, 22) + '...',
      task.agentType,
      task.taskName,
      statusColor(task.status),
      task.target || 'N/A',
    ]);
  }

  return table.toString();
}

/**
 * Format chain of thought
 */
export function formatChainOfThought(thoughts: ChainOfThought[], limit: number = 5): string {
  let output = '';

  const recentThoughts = thoughts.slice(-limit);

  for (const thought of recentThoughts) {
    output += chalk.cyan(`\n[${thought.agentId}] Step ${thought.stepNumber}: ${thought.stepType}\n`);
    output += chalk.white(`  ${thought.description}\n`);
    output += chalk.gray(`  → ${thought.reasoning}\n`);
    if (thought.confidence !== undefined) {
      output += chalk.yellow(`  Confidence: ${(thought.confidence * 100).toFixed(0)}%\n`);
    }
  }

  return output;
}

/**
 * Format statistics
 */
export function formatStats(stats: any): string {
  let output = '';

  output += formatSectionHeader('Simulation Statistics');
  output += `\n${chalk.bold('Duration:')} ${(stats.simulation.duration / 1000).toFixed(2)}s`;
  output += `\n${chalk.bold('Status:')} ${stats.simulation.isRunning ? chalk.green('Running') : chalk.gray('Stopped')}`;

  output += formatSectionHeader('Agents');
  output += `\n${chalk.bold('Total:')} ${stats.agents.total}`;
  output += chalk.green(` | Idle: ${stats.agents.idle}`);
  output += chalk.yellow(` | Busy: ${stats.agents.busy}`);
  output += chalk.red(` | Error: ${stats.agents.error}`);
  output += chalk.gray(` | Offline: ${stats.agents.offline}`);

  output += formatSectionHeader('Events');
  output += `\n${chalk.bold('Total:')} ${stats.events.total}`;
  output += chalk.red(` | Critical: ${stats.events.bySeverity.Critical}`);
  output += chalk.yellow(` | High: ${stats.events.bySeverity.High}`);
  output += chalk.blue(` | Medium: ${stats.events.bySeverity.Medium}`);
  output += chalk.gray(` | Low: ${stats.events.bySeverity.Low}`);

  output += formatSectionHeader('Tasks');
  output += `\n${chalk.bold('Total:')} ${stats.tasks.total}`;
  output += ` | Pending: ${stats.tasks.pending}`;
  output += ` | Active: ${stats.tasks.active}`;

  output += formatSectionHeader('Chain of Thought');
  output += `\n${chalk.bold('Total Steps:')} ${stats.chainOfThoughts.total}`;

  output += formatSectionHeader('Logic Pipe');
  output += `\n${chalk.bold('Total Executions:')} ${stats.logicPipe.totalExecutions}`;
  output += ` | Successful: ${stats.logicPipe.successfulExecutions}`;
  output += ` | Failed: ${stats.logicPipe.failedExecutions}`;

  return output + '\n';
}

/**
 * Format progress indicator
 */
export function formatProgress(message: string, done: boolean = false): string {
  if (done) {
    return chalk.green(`✓ ${message}`);
  }
  return chalk.yellow(`⏳ ${message}`);
}
