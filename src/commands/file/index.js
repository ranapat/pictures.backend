import fs from 'fs';
import path from 'path';
import { tf } from 'tasksf';

const init = (config, command, args, database, complete) => {
  const picture = args.length > 0 ? args[0] : undefined;

  if (picture && fs.existsSync(picture)) {
    console.log(path.dirname(picture) + ' / ' + path.basename(picture))
  } else {
    complete();
  }

  /*
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
  */
};

export { init };
