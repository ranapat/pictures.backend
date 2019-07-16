import { tf } from 'tasksf';

const toGeo = (connection, limit, modifiedAt) => {
  return tf.task((complete, self) => {
    const query = limit ? 'select f.* from files f left join file_flags ff on f.id=ff.file where request_reverse_geo_code = 1 limit ?' : 'select f.* from files f left join file_flags ff on f.id=ff.file where request_reverse_geo_code = 1';
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

export { toGeo };
