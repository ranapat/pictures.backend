import config from 'config';
import program from 'commander';

import * as packageJson from '../package.json';
import * as database from './database';
import * as scan from './commands/scan';

const complete = () => {
  database.destroy();

  process.exit(0);
};

const handleCommand = (command, cmd, args) => {
  if (command === 'scan') {
    database.init(config);

    scan.init(config, cmd, args, database, complete);
  } else if (command === 'help') {
    const helpFor = args.length > 0 ? args[0] : undefined;
    if (helpFor === 'scan') {
      console.log('custom help for scan...');
    } else {
      console.log('custom help for...', helpFor);
    }
    process.exit(0);
  } else {
    program.outputHelp();

    process.exit(0);
  }
};

program
  .version(packageJson.version)

  .option('-r, --recursive', 'Recursive mode')
  .command('scan [folders...]', 'Scan folders for pictures')

  .action((command, ...args) => {
    const cmd = args[args.length - 1];
    args.splice(-1, 1);

    handleCommand(command, cmd, args);
  })

  .parse(process.argv);
