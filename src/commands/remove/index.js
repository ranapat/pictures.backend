import fs from 'fs';
import path from 'path';

import { tf } from 'tasksf';

const init = (config, command, args, database, complete) => {
  const quiet = command.quiet === true;

  let file;

  if (args.length > 0) {
    const first = args[0];
    if (fs.existsSync(first) && fs.lstatSync(first).isFile()) {
      file = path.resolve(first);
    } else {
      file = first;
    }
  }

  if (file) {
    const sequence = tf.sequence(() => {
      complete();
    });

    sequence.push(database.execute(
      'remove',
      `${path.dirname(file)}/`, path.basename(file)
    ));
    sequence.run();
  } else {
    complete();
  }
};

export { init };
