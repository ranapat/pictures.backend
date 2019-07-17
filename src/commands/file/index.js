import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const init = (config, command, args, database, complete) => {
  const picture = args.length > 0 ? args[0] : undefined;

  if (picture && fs.existsSync(picture) && fs.lstatSync(picture).isFile()) {
    spawn('./app', [ 'scan', picture, '-q' ]).on('exit', (code) => {
      if (code !== 0) { complete(); return; }
      spawn('./app', [ 'identify', picture, '-q' ]).on('exit', (code) => {
        if (code !== 0) { complete(); return; }
        spawn('./app', [ 'metadata', picture, '-q' ]).on('exit', (code) => {
          if (code !== 0) { complete(); return; }
          spawn('./app', [ 'geo', picture, '-q' ]).on('exit', (code) => {
            complete();
          });
        });
      });
    });
  } else {
    complete();
  }
};

export { init };
