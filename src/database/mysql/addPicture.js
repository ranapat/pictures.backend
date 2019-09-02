import { tf } from 'tasksf';

const isSmaller = (dateA, dateB) => {
  return Math.floor(dateA.getTime() / 1000) < Math.floor(dateB.getTime() / 1000);
};

const analyzePicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const parameters = chain.get('parameters');

    connection.query(
      'select modified_at from files where path = ? and name = ? limit 1',
      [ parameters.path, parameters.name ],
      (error, result) => {
        if (error) {
          //
        }

        if (result.length === 1) {
          if (isSmaller(result[0].modified_at, parameters.modifiedAt)) {
            chain.attach('delete', true);
            chain.attach('insert', true);
          }
        } else {
          chain.attach('insert', true);
        }
        complete();
      }
    );
  }, 0
);

const deletePicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const parameters = chain.get('parameters');

    if (chain.get('delete')) {
      connection.query(
        'delete from files where path = ? and name = ? limit 1',
        [ parameters.path, parameters.name ],
        (error, result) => {
          if (error) {
            //
          }

          complete();
        }
      );
    } else {
      complete();
    }
  }, 0
);

const insertPicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const parameters = chain.get('parameters');

    if (chain.get('insert')) {
      connection.query(
        'insert into files (path, name, modified_at) values ?',
        [[
          [ parameters.path, parameters.name, parameters.modifiedAt ]
        ]],
        (error, result) => {
          if (error) {
            //
          }

          chain.attach('fileId', result.insertId);

          complete();
        }
      );
    } else {
      complete();
    }
  }, 0
);

const flagPicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const parameters = chain.get('parameters');

    if (chain.get('insert')) {
      connection.query(
        'insert into file_flags (file, request_identify, request_metadata, request_reverse_geo_code, request_tag) values ?',
        [[
          [ chain.get('fileId'), true, true, true, true ]
        ]],
        (error, result) => {
          if (error) {
            //
          }

          complete();
        }
      );
    } else {
      complete();
    }
  }, 0
);

const addPicture = (connection, path, name, modifiedAt) => {
  return tf.task((complete, self) => {
    tf.sequence(() => { complete(); })
      .push(analyzePicture)
      .push(deletePicture)
      .push(insertPicture)
      .push(flagPicture)
      .attach('connection', connection)
      .attach('parameters', {
        path, name, modifiedAt
      })
      .run();
  }, 0);
};

export { addPicture };
