import * as mysql from './mysql';

let active;

const init = (config) => {
  const type = config.get('database.type');
  if (type == 'mysql') {
    active = mysql;
  }

  if (active) {
    mysql.init(config);

    return true;
  } else {
    console.log('database not supported...');

    return false;
  }
};

const destroy = () => {
  if (active) {
    active.destroy();
  }
};

const isConnected = () => {
  return active ? active.isConnected() : undefined;
};

const addPicture = (path, name, modifiedAt) => {
  if (active) {
    active.addPicture(path, name, modifiedAt);
  }
};

export { init, destroy, isConnected };
export { addPicture };
