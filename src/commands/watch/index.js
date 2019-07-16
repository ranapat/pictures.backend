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
    if (event == 'remove') {
      deleted.push(name);
    } else {
      modified.push(name);
    }

    console.log(name)

    updateLabel(`Pictures in queue ${modified.length + deleted.length}`);
  });
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

  for (const directory of directories) {
    watchSingle(directory.path, directory.recursive);
  }

  updateLabel(`Pictures in queue ${modified.length + deleted.length}`);

  /*
  const sequence = tf.sequence();

  for (const picture of pictures) {
    //sequence.push(task);
  }

  sequence.run();
  */
};

export { init };
