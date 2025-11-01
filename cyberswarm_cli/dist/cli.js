// CLI interface using Commander.js
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import { CyberSecurityOrchestrator } from './orchestrator/cybersecurity-orchestrator.js';
import { loadConfig, loadScenario, listScenarios } from './utils/config.js';
import { saveSimulationResults, loadSimulationResults, generateMarkdownReport, saveMarkdownReport, loadCVEDatabase, } from './utils/file-tools.js';
import { formatSectionHeader, formatSuccess, formatError, formatWarning, formatInfo, formatAgentsTable, formatEventsTable, formatTasksTable, formatChainOfThought, formatStats, } from './output/console-formatter.js';
const program = new Command();
// Display banner
function showBanner() {
    console.log(chalk.cyan(figlet.textSync('CyberSwarm', {
        font: 'Standard',
        horizontalLayout: 'default',
    })));
    console.log(chalk.gray('Multi-Agent Cybersecurity Simulation with Gemini AI\n'));
}
/**
 * Start simulation command
 */
program
    .command('start')
    .description('Start a cybersecurity simulation')
    .option('-t, --target <network>', 'Target network (e.g., 192.168.1.0/24)')
    .option('-s, --scenario <name>', 'Load scenario from config/scenarios/')
    .option('-c, --config <path>', 'Custom configuration file')
    .option('-d, --duration <seconds>', 'Simulation duration in seconds', '60')
    .option('-o, --output <path>', 'Output file for results')
    .action(async (options) => {
    showBanner();
    const spinner = ora('Initializing CyberSwarm...').start();
    try {
        // Load configuration
        const config = loadConfig(options.config);
        spinner.succeed('Configuration loaded');
        // Load scenario if specified
        let scenarioConfig = {};
        if (options.scenario) {
            spinner.start(`Loading scenario: ${options.scenario}`);
            scenarioConfig = loadScenario(options.scenario);
            spinner.succeed(`Scenario loaded: ${options.scenario}`);
        }
        // Initialize orchestrator
        spinner.start('Initializing orchestrator and agents...');
        const orchestrator = new CyberSecurityOrchestrator(config);
        spinner.succeed('Orchestrator initialized');
        // Determine target
        const target = options.target ||
            scenarioConfig.target ||
            config.simulation.targetNetwork;
        // Determine duration
        const duration = parseInt(options.duration) * 1000 ||
            scenarioConfig.duration ||
            config.simulation.timeout;
        console.log(formatInfo(`Target: ${target}`));
        console.log(formatInfo(`Duration: ${duration / 1000}s`));
        console.log('');
        // Start simulation
        spinner.start('Starting simulation...');
        await orchestrator.startSimulation(target, duration);
        spinner.succeed('Simulation started');
        console.log(formatSuccess('Simulation is running...'));
        console.log(formatWarning('Press Ctrl+C to stop the simulation\n'));
        // Monitor simulation
        const monitorInterval = setInterval(() => {
            const state = orchestrator.getSimulationState();
            console.clear();
            showBanner();
            console.log(formatSectionHeader('Simulation Status'));
            console.log(formatSuccess('Simulation running...'));
            console.log('');
            console.log(formatSectionHeader('Agents'));
            console.log(formatAgentsTable(state.agents));
            console.log('');
            console.log(formatSectionHeader('Recent Events'));
            console.log(formatEventsTable(state.eventHistory, 10));
            console.log('');
            console.log(formatSectionHeader('Active Tasks'));
            const activeTasks = state.taskQueue.filter(t => t.status === 'EXECUTING' || t.status === 'ASSIGNED');
            if (activeTasks.length > 0) {
                console.log(formatTasksTable(activeTasks));
            }
            else {
                console.log(formatInfo('No active tasks'));
            }
            console.log('');
            console.log(formatSectionHeader('Recent Chain of Thought'));
            console.log(formatChainOfThought(state.chainOfThoughts, 3));
        }, 5000);
        // Handle Ctrl+C
        process.on('SIGINT', async () => {
            clearInterval(monitorInterval);
            console.log('\n');
            spinner.start('Stopping simulation...');
            orchestrator.stopSimulation();
            spinner.succeed('Simulation stopped');
            // Get final state
            const finalState = orchestrator.getSimulationState();
            const stats = orchestrator.getStats();
            console.log('');
            console.log(formatStats(stats));
            // Save results
            if (options.output) {
                spinner.start('Saving results...');
                const outputFile = saveSimulationResults(finalState.eventHistory, finalState.chainOfThoughts, {
                    target: finalState.targetNetwork,
                    duration: stats.simulation.duration,
                    startTime: finalState.startTime,
                    endTime: finalState.endTime,
                }, options.output);
                spinner.succeed(`Results saved to ${outputFile}`);
                // Generate report
                spinner.start('Generating report...');
                const report = generateMarkdownReport(finalState.eventHistory, finalState.chainOfThoughts, {
                    targetNetwork: finalState.targetNetwork,
                    duration: `${(stats.simulation.duration / 1000).toFixed(2)}s`,
                });
                const reportFile = saveMarkdownReport(report);
                spinner.succeed(`Report saved to ${reportFile}`);
            }
            process.exit(0);
        });
        // Auto-stop after duration
        setTimeout(() => {
            clearInterval(monitorInterval);
            console.log('\n');
            spinner.start('Simulation duration completed...');
            orchestrator.stopSimulation();
            spinner.succeed('Simulation stopped');
            // Get final state
            const finalState = orchestrator.getSimulationState();
            const stats = orchestrator.getStats();
            console.log('');
            console.log(formatStats(stats));
            // Save results
            spinner.start('Saving results...');
            const outputFile = saveSimulationResults(finalState.eventHistory, finalState.chainOfThoughts, {
                target: finalState.targetNetwork,
                duration: stats.simulation.duration,
                startTime: finalState.startTime,
                endTime: finalState.endTime,
            }, options.output);
            spinner.succeed(`Results saved to ${outputFile}`);
            // Generate report
            spinner.start('Generating report...');
            const report = generateMarkdownReport(finalState.eventHistory, finalState.chainOfThoughts, {
                targetNetwork: finalState.targetNetwork,
                duration: `${(stats.simulation.duration / 1000).toFixed(2)}s`,
            });
            const reportFile = saveMarkdownReport(report);
            spinner.succeed(`Report saved to ${reportFile}`);
            process.exit(0);
        }, duration);
    }
    catch (error) {
        spinner.fail('Error starting simulation');
        console.error(formatError(error.message));
        process.exit(1);
    }
});
/**
 * Report command
 */
program
    .command('report')
    .description('Generate report from simulation results')
    .requiredOption('-i, --input <path>', 'Input simulation results file')
    .option('-f, --format <type>', 'Report format (markdown, json)', 'markdown')
    .option('-o, --output <path>', 'Output report file')
    .action(async (options) => {
    showBanner();
    const spinner = ora('Loading simulation results...').start();
    try {
        const results = loadSimulationResults(options.input);
        spinner.succeed('Results loaded');
        spinner.start('Generating report...');
        const report = generateMarkdownReport(results.events, results.chainOfThoughts, results.metadata);
        const outputFile = saveMarkdownReport(report, options.output);
        spinner.succeed(`Report saved to ${outputFile}`);
        console.log(formatSuccess('Report generated successfully!'));
    }
    catch (error) {
        spinner.fail('Error generating report');
        console.error(formatError(error.message));
        process.exit(1);
    }
});
/**
 * Scenarios command
 */
program
    .command('scenarios')
    .description('List available simulation scenarios')
    .action(() => {
    showBanner();
    console.log(formatSectionHeader('Available Scenarios'));
    const scenarios = listScenarios();
    if (scenarios.length === 0) {
        console.log(formatWarning('No scenarios found in config/scenarios/'));
    }
    else {
        for (const scenario of scenarios) {
            console.log(`  ${chalk.cyan('•')} ${scenario}`);
        }
    }
    console.log('');
    console.log(formatInfo('Use: cyberswarm start --scenario <name>'));
});
/**
 * Validate command
 */
program
    .command('validate')
    .description('Validate configuration')
    .option('-c, --config <path>', 'Configuration file to validate')
    .action((options) => {
    showBanner();
    const spinner = ora('Validating configuration...').start();
    try {
        const config = loadConfig(options.config);
        spinner.succeed('Configuration is valid');
        console.log('');
        console.log(formatSectionHeader('Configuration Details'));
        console.log(`${chalk.bold('Gemini Model:')} ${config.gemini.model}`);
        console.log(`${chalk.bold('Target Network:')} ${config.simulation.targetNetwork}`);
        console.log(`${chalk.bold('Timeout:')} ${config.simulation.timeout / 1000}s`);
        console.log(`${chalk.bold('Max Agents:')} ${config.simulation.maxConcurrentAgents}`);
        console.log(`${chalk.bold('Log Level:')} ${config.logging.level}`);
        console.log('');
        // Test Gemini API key
        if (config.gemini.apiKey) {
            console.log(formatSuccess('Gemini API key is set'));
        }
        else {
            console.log(formatError('Gemini API key is missing'));
        }
        // Check CVE database
        const cveDb = loadCVEDatabase();
        console.log(formatInfo(`CVE Database: ${cveDb.length} entries loaded`));
    }
    catch (error) {
        spinner.fail('Configuration validation failed');
        console.error(formatError(error.message));
        process.exit(1);
    }
});
/**
 * Version command
 */
program
    .version('1.0.0')
    .description('CyberSwarm CLI - Multi-Agent Cybersecurity Simulation');
export default program;
//# sourceMappingURL=cli.js.map