import mysql from 'mysql';

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

const addPicture = (path, name, modifiedAt) => {
  connection.query(
    'insert into files (path, name, modified_at) values ?',
    [[
      [ path, name, modifiedAt ]
    ]],
    (error, result) => {
      if (error) {
        throw error;
      }

    }
  );
}

export { init, destroy, isConnected };
export { addPicture };
