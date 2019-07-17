import fs from 'fs';
import path from 'path';
import im from 'imagemagick';

import { tf } from 'tasksf';
import { icons, escapes } from 'clicomp';
import { Renderer, Label, Progress } from 'clicomp';

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

  label = new Label(0, 2, 'Getting pictures to metadata discover...', undefined, {
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
  const quiet = command.quiet === true;

  let limit;
  let file;

  if (args.length > 0) {
    const first = args[0];
    if (fs.existsSync(first) && fs.lstatSync(first).isFile()) {
      file = path.resolve(first);
    } else if (!isNaN(first)) {
      limit = parseInt(first);
    }
  }

  if (!quiet) {
    clearScreen();
  }

  let toMetadata;

  if (file) {
    toMetadata = database.execute(
      'getByFullPath',
      file
    );
  } else {
    toMetadata = database.execute(
      'toMetadata',
      limit
    );
  }

  toMetadata._complete = (self) => {
    const pictures = self.get('result');

    const sequence = tf.sequence(() => {
      if (!quiet) {
        disposeRenderer();
      }

      complete();
    });

    let i = 0;

    if (!quiet) {
      updateLabel(`Metadata discover picture 0 out of ${pictures.length}`);
    }

    for (const picture of pictures) {
      sequence.push(tf.task((complete, self) => {
        im.readMetadata(picture.path + picture.name, (error, data) => {
          if (!error) {
            const task = database.execute(
              'metadata',
              picture.id, data
            );
            task._complete = () => {
              if (!quiet) {
                updateProgress(++i / pictures.length);
                updateLabel(`Metadata discover picture ${i} out of ${pictures.length}`);
              }
            };
            sequence.unshift(task);
          } else {
            if (!quiet) {
              updateProgress(++i / pictures.length);
              updateLabel(`Metadata discover picture ${i} out of ${pictures.length}`);
            }
          }

          complete();
        });
      }, 0));
    }

    sequence.run();
  };

  toMetadata.run();
};

export { init };
