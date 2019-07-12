import fs from 'fs';
import path from 'path';
import { tf } from 'tasksf';

import { normalize } from './normalize';
import { iterate } from './iterate';

const init = (config, command, args, database, complete) => {
  const directories = normalize(
    config.get('pictures.directories'),
    args, command.recursive === true
  );

  const pictures = iterate(directories);

  const sequence = tf.sequence(() => { complete() });

  for (const picture of pictures) {
    const stats = fs.statSync(picture);
    sequence.push(
      database.execute(
        'addPicture',
        path.dirname(picture) + '/', path.basename(picture),
        stats.mtime
      )
    );
  }

  sequence.run();
};

export { init };
