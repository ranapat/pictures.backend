import fs from 'fs';
import recursiveReadSync from 'recursive-readdir-sync';

const isPicture = (file) => {
  return file.match(/\.(jpg|jpeg|png|gif)/);
};

const iterate = (directories) => {
  const pictures = [];

  for (const obj of directories) {
    let files = [];

    if (obj.recursive) {
      files = recursiveReadSync(obj.path);
    } else if (obj.file) {
      files = [ obj.path ];
    } else {
      files = fs.readdirSync(obj.path);
      files.forEach((part, index) => {
        files[index] = obj.path + part;
      });
    }

    for (const file of files) {
      if (isPicture(file)) {
        pictures.push(file);
      }
    }
  }

  return pictures;
};

export { iterate };
