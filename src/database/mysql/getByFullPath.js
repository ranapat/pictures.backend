import { tf } from 'tasksf';

const getByFullPath = (connection, fullPath) => {
  return tf.task((complete, self) => {
    connection.query(
      'select f.* from files f where concat(path, name) = ? limit 1',
      [ fullPath ],
      (error, result) => {
        if (error) {
          //
        }

        self.attach('result', result);
        complete();
      }
    );
  }, 0);
};

export { getByFullPath };
