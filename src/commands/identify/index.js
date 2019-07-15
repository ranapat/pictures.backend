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

  label = new Label(0, 2, 'Getting pictures to identify...', undefined, {
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

  const toIdentify = database.execute(
    'toIdentify',
    limit
  );

  toIdentify._complete = (self) => {
    const pictures = self.get('result');

    const sequence = tf.sequence(() => {
      disposeRenderer();

      complete();
    });

    let i = 0;

    updateLabel(`Identify picture 0 out of ${pictures.length}`);

    for (const picture of pictures) {
      sequence.push(tf.task((complete, self) => {
        im.identify(picture.path + picture.name, (error, features) => {
          if (error) {
            //
          }

          updateProgress(++i / pictures.length);
          updateLabel(`Identify picture ${i} out of ${pictures.length}`);

          //console.log(JSON.stringify(features));
          complete();
        });
      }, 0));
    }

    sequence.run();
  };

  toIdentify.run();
};

export { init };
