import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import exitHook from 'exit-hook';
import watch from 'node-watch';
import { tf } from 'tasksf';
import { icons, escapes } from 'clicomp';
import { Renderer, Label } from 'clicomp';

import { normalize } from './normalize';

let renderer;
let workInProgress;
let label;

let modified = [];
let deleted = [];

let sequence;

const clearScreen = () => {
  renderer = Renderer.instance;

  renderer.clearScreen();

  workInProgress = new Label(0, 0, 'Working...', icons.earth, {
    maxWidth: 60,
    interval: 250,
    labelForegroundColor: escapes.colors.Foreground.Yellow
  });
  workInProgress.show();

  label = new Label(0, 2, 'Scanning directories...', undefined, {
    maxWidth: 60,
    interval: 250,
    labelForegroundColor: escapes.colors.Foreground.Green,
    iconForegroundColor: escapes.colors.Foreground.Red
  });
  label.show();
};

const updateLabel = (value) => {
  label.label = value;
};

const watchSingle = (directory, recursive) => {
  watch(directory, { recursive: recursive }, (event, name) => {
    if (event === 'remove') {
      deleted.push(name);

      handleDeleted();
    } else if (name && fs.existsSync(name) && fs.lstatSync(name).isFile()) {
      modified.push(name);

      handleModified();
    }
  });
};

const handleModified = () => {
  sequence.push(tf.task((complete, self) => {
    if (modified.length > 0) {
      const picture = modified.pop();

      updateLabel(`Files to process ${modified.length}, files to delete ${deleted.length}, updating...`);

      spawn('./app', [ 'file', picture ]).on('exit', (code) => {
        updateLabel(`Files to process ${modified.length}, files to delete ${deleted.length}, doing nothing...`);
        complete();
      });
    }
  }, 0));

  if (!sequence.running) {
    sequence.run();
  }
};

const handleDeleted = () => {
  sequence.push(tf.task((complete, self) => {
    if (deleted.length > 0) {
      const picture = deleted.pop();

      updateLabel(`Files to process ${modified.length}, files to delete ${deleted.length}, updating...`);

      spawn('./app', [ 'remove', picture ]).on('exit', (code) => {
        updateLabel(`Files to process ${modified.length}, files to delete ${deleted.length}, doing nothing...`);
        complete();
      });
    }
  }, 0));

  if (!sequence.running) {
    sequence.run();
  }
};

const init = (config, command, args, database, complete) => {
  const directories = normalize(
    config.get('pictures.directories'),
    args, command.recursive === true
  );

  clearScreen();

  exitHook(() => {
    renderer.cursorTo(0, 5);
    complete();
  });

  sequence = tf.sequence();

  for (const directory of directories) {
    watchSingle(directory.path, directory.recursive);
  }

  updateLabel(`Files to process ${modified.length}, files to delete ${deleted.length}, doing nothing...`);
};

export { init };
