import { tf } from 'tasksf';

const analyzePicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const id = chain.get('id');

    connection.query(
      'select count(file) as file_count from file_details where file = ?',
      [ id ],
      (error, result) => {
        if (error) {
          //
        }

        if (result[0].file_count === 0) {
          chain.attach('insert', true);
        } else if (result[0].file_count === 1) {
          chain.attach('update', true);
        } else {
          chain.attach('delete', true);
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
    const id = chain.get('id');

    if (chain.get('delete')) {
      connection.query(
        'delete from file_details where file = ?',
        [ id ],
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
    const id = chain.get('id');
    const data = chain.get('data');

    if (chain.get('insert')) {
      connection.query(
        'insert into file_details (file, identity, metadata) values ?',
        [[
          [ id, '', JSON.stringify(data) ]
        ]],
        (error, result) => {
          if (error) {
            //
          }

          chain.attach('flag', true);
          complete();
        }
      );
    } else {
      complete();
    }
  }, 0
);

const updatePicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const id = chain.get('id');
    const data = chain.get('data');

    if (chain.get('update')) {
      connection.query(
        'update file_details set metadata = ? where file = ?',
        [ JSON.stringify(data), id ],
        (error, result) => {
          if (error) {
            //
          }

          chain.attach('flag', true);
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
    const id = chain.get('id');

    if (chain.get('flag')) {
      connection.query(
        'update file_flags set request_metadata = 0 where file = ?',
        [ id ],
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

const metadata = (connection, id, data, modifiedAt) => {
  return tf.task((complete, self) => {
    tf.sequence(() => { complete(); })
      .push(analyzePicture)
      .push(deletePicture)
      .push(insertPicture)
      .push(updatePicture)
      .push(flagPicture)
      .attach('connection', connection)
      .attach('id', id)
      .attach('data', data)
      .run();
  }, 0);
};

export { metadata };
