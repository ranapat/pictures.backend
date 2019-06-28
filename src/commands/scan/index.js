import fs from 'fs';
import path from 'path';

import { normalize } from './normalize';
import { iterate } from './iterate';

const init = (config, command, args, database, complete) => {
  const directories = normalize(
    config.get('pictures.directories'),
    args, command.recursive === true
  );

  const pictures = iterate(directories);

  for (const picture of pictures) {
    const stats = fs.statSync(picture);
    database.addPicture(
      path.dirname(picture) + '/', path.basename(picture),
      stats.mtime
    );
  }
//  complete();
};

export { init };
