import { tf } from 'tasksf';

const analyzePicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const path = chain.get('path');
    const name = chain.get('name');

    connection.query(
      'select id from files where path = ? and name = ? limit 1',
      [ path, name ],
      (error, result) => {
        if (error) {
          //
        }

        if (result.length === 1) {
          chain.attach('delete', true);
          chain.attach('id', result[0].id)
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
        'delete from files where id = ?',
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

const remove = (connection, path, name) => {
  return tf.task((complete, self) => {
    tf.sequence(() => { complete(); })
      .push(analyzePicture)
      .push(deletePicture)
      .attach('connection', connection)
      .attach('path', path)
      .attach('name', name)
      .run();
  }, 0);
};

export { remove };
