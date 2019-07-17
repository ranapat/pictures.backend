import mysql from 'mysql';

import { addPicture } from './addPicture';
import { toIdentify } from './toIdentify';
import { toMetadata } from './toMetadata';
import { toGeo } from './toGeo';
import { getByFullPath } from './getByFullPath';
import { identify } from './identify';
import { metadata } from './metadata';
import { geo } from './geo';

const commands = {
  'addPicture': addPicture,
  'toIdentify': toIdentify,
  'toMetadata': toMetadata,
  'toGeo': toGeo,
  'getByFullPath': getByFullPath,
  'identify': identify,
  'metadata': metadata,
  'geo': geo
};

let connection;
let connected = false;

const init = (config) => {
  connection = mysql.createConnection({
    host: config.get('database.host'),
    user: config.get('database.username'),
    password: config.get('database.password'),
    database: config.get('database.database')
  });

  connection.on('error', (err) => {
    connected = false;

    throw error;
  });

  connection.connect((error) => {
    if (error) {
      connected = false;

      throw error;
    }

    connected = true;
  });
};

const destroy = () => {
  connection.destroy();
};

const isConnected = () => {
  return connected;
};

const execute = (method, ...parameters) => {
  if (commands[method]) {
    return commands[method](connection, ...parameters);
  }
};

export { init, destroy, isConnected };
export { execute };
