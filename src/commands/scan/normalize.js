import fs from 'fs';
import path from 'path';

const normalize = (fromConfig, fromArguments, recursiveMode) => {
  const result = [];

  for (const obj of fromArguments) {
    if (fs.existsSync(obj)) {
      if (fs.lstatSync(obj).isDirectory()) {
        result.push({ path: `${path.resolve(obj)}/`, recursive: recursiveMode });
      } else {
        result.push({ path: `${path.resolve(obj)}`, file: true });
      }
    }
  }

  if (result.length === 0) {
    for (const obj of fromConfig) {
      if (fs.existsSync(obj.path)) {
        if (fs.lstatSync(obj.path).isDirectory()) {
          result.push({ path: `${path.resolve(obj.path)}/`, recursive: obj.recursive });
        } else {
          result.push({ path: `${path.resolve(obj.path)}`, file: true });
        }
      }
    }
  }

  return result;
};

export { normalize };
