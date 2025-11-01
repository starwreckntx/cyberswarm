// CyberSwarm CLI Entry Point
import program from './cli.js';
// Parse command line arguments
program.parse(process.argv);
// If no command specified, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map