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

const execute = (method, ...parameters) => {
  if (active) {
    return active.execute(method, ...parameters);
  }
};

export { init, destroy, isConnected };
export { execute };
