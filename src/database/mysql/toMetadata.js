import { tf } from 'tasksf';

const toMetadata = (connection, limit) => {
  return tf.task((complete, self) => {
    const query = limit ? 'select f.* from files f left join file_flags ff on f.id=ff.file where request_metadata = 1 limit ?' : 'select f.* from files f left join file_flags ff on f.id=ff.file where request_metadata = 1';
    const parameters = limit ? [ limit ] : [];
    connection.query(
      query, parameters,
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

export { toMetadata };
