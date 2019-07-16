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
  clearScreen();

  const limit = args.length > 0 ? parseInt(args[0]) : undefined;

  const toMetadata = database.execute(
    'toMetadata',
    limit
  );

  toMetadata._complete = (self) => {
    const pictures = self.get('result');

    const sequence = tf.sequence(() => {
      disposeRenderer();

      complete();
    });

    let i = 0;

    updateLabel(`Metadata discover picture 0 out of ${pictures.length}`);

    for (const picture of pictures) {
      sequence.push(tf.task((complete, self) => {
        im.readMetadata(picture.path + picture.name, (error, data) => {
          if (!error) {
            const task = database.execute(
              'metadata',
              picture.id, data
            );
            task._complete = () => {
              updateProgress(++i / pictures.length);
              updateLabel(`Metadata discover picture ${i} out of ${pictures.length}`);
            };
            sequence.unshift(task);
          } else {
            updateProgress(++i / pictures.length);
            updateLabel(`Metadata discover picture ${i} out of ${pictures.length}`);
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
