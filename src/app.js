import config from 'config';
import program from 'commander';

import * as packageJson from '../package.json';
import * as database from './database';

import * as tags from './tags';

import * as search from './commands/search';
import * as file from './commands/file';
import * as scan from './commands/scan';
import * as watch from './commands/watch';
import * as identify from './commands/identify';
import * as metadata from './commands/metadata';
import * as geo from './commands/geo';
import * as tag from './commands/tag';
import * as remove from './commands/remove';

const complete = () => {
  database.destroy();

  process.exit(0);
};

const handleCommand = (command, cmd, args) => {
  if (command === 'search') {
    database.init(config);

    search.init(config, cmd, args, database, complete);
  } else if (command === 'file') {
    database.init(config);

    file.init(config, cmd, args, database, complete);
  } else if (command === 'watch') {
    database.init(config);

    watch.init(config, cmd, args, database, complete);
  } else if (command === 'scan') {
    database.init(config);

    scan.init(config, cmd, args, database, complete);
  } else if (command === 'identify') {
    database.init(config);

    identify.init(config, cmd, args, database, complete);
  } else if (command === 'metadata') {
    database.init(config);

    metadata.init(config, cmd, args, database, complete);
  } else if (command === 'geo') {
    database.init(config);

    geo.init(config, cmd, args, database, complete);
  } else if (command === 'tag') {
    database.init(config);

    tag.init(config, cmd, args, database, complete);
  } else if (command === 'remove') {
    database.init(config);

    remove.init(config, cmd, args, database, complete);
  } else if (command === 'help') {
    const helpFor = args.length > 0 ? args[0] : undefined;
    if (helpFor === 'search') {
      console.log('custom help for search...');
    } else if (helpFor === 'file') {
      console.log('custom help for file...');
    } else if (helpFor === 'watch') {
      console.log('custom help for watch...');
    } else if (helpFor === 'scan') {
      console.log('custom help for scan...');
    } else if (helpFor === 'identify') {
      console.log('custom help for identify...');
    } else if (helpFor === 'metadata') {
      console.log('custom help for metadata...');
    } else if (helpFor === 'geo') {
      console.log('custom help for reverse geo code...');
    } else if (helpFor === 'tag') {
      console.log('custom help for reverse tag...');
    } else if (helpFor === 'remove') {
      console.log('custom help for remove...');
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
  .option('-q, --quiet', 'Quiet mode')
  .command('search [free text...]', 'Search for pictures')
  .command('file [file]', 'Processes single pictures')
  .command('watch [folders...]', 'Watches folders for pictures')
  .command('scan [files or folders...]', 'Scan files or folders for pictures')
  .command('identify [limit or file]', 'Identify pictures up to a limit or a specific file')
  .command('metadata [limit or file]', 'Metadata discover pictures up to a limit or a specific file')
  .command('geo [limit or file]', 'Reverse Geo Code pictures up to a limit or a specific file')
  .command('tag [limit or file]', 'Tag pictures up to a limit or specific file')
  .command('remove [file]', 'Remove single picture from the database')

  .action((command, ...args) => {
    const cmd = args[args.length - 1];
    args.splice(-1, 1);

    handleCommand(command, cmd, args);
  })

  .parse(process.argv);
