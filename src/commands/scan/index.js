import fs from 'fs';
import path from 'path';
import { tf } from 'tasksf';
import { icons, escapes } from 'clicomp';
import { Renderer, Label, Progress } from 'clicomp';

import { normalize } from './normalize';
import { iterate } from './iterate';

let renderer;
let workInProgress;
let label;
let progress;

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

  progress = new Progress(0, 4, 60, 0, '', {});
  progress.show();

  renderer.cursorHide();
};

const updateLabel = (value) => {
  label.label = value;
};

const updateProgress = (value) => {
  progress.percentages = value;
};

const disposeRenderer = () => {
  workInProgress.label = 'All done.';

  label = new Label(0, 6, 'Scanning complete.', undefined, {
    maxWidth: 60,
    interval: 250,
    labelForegroundColor: escapes.colors.Foreground.Green,
    iconForegroundColor: escapes.colors.Foreground.Red
  });
  label.show();

  renderer.cursorTo(0, 8);

  renderer.cursorShow();
};

const init = (config, command, args, database, complete) => {
  const directories = normalize(
    config.get('pictures.directories'),
    args, command.recursive === true
  );

  clearScreen();

  const pictures = iterate(directories);

  updateLabel(`Checking picture 0 out of ${pictures.length}`);

  const sequence = tf.sequence(() => {
    disposeRenderer();

    complete();
  });

  let i = 0;

  for (const picture of pictures) {
    const stats = fs.statSync(picture);
    const task = database.execute(
      'addPicture',
      path.dirname(picture) + '/', path.basename(picture),
      stats.mtime
    );
    task._complete = () => {
      updateProgress(++i / pictures.length);
      updateLabel(`Checking picture ${i} out of ${pictures.length}`);
    };

    sequence.push(task);
  }

  sequence.run();
};

export { init };
