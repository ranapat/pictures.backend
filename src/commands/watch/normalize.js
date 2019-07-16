import fs from 'fs';
import path from 'path';

const normalize = (fromConfig, fromArguments, recursiveMode) => {
  const result = [];

  for (const obj of fromConfig) {
    if (fs.existsSync(obj.path)) {
      result.push({ path: `${path.resolve(obj.path)}/`, recursive: obj.recursive });
    }
  }

  for (const obj of fromArguments) {
    if (fs.existsSync(obj)) {
      result.push({ path: `${path.resolve(obj)}/`, recursive: recursiveMode });
    }
  }

  return result;
};

export { normalize };
