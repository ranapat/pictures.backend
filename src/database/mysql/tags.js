import { tf } from 'tasksf';

const analyzeTags = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const data = chain.get('data');

    let index = 0;
    let actions = {};
    let map = {};
    for (const tag of data) {
      connection.query(
        'select id from tags where name = ?',
        [ tag.name ],
        (error, result) => {
          if (error) {
            //
          }

          if (!result[0]) {
            actions[tag.name] = 'insert';
          } else {
            map[tag.name] = result[0].id;
          }

          if (++index === data.length) {
            chain.attach('actions', actions);
            chain.attach('map', map);

            complete();
          }
        }
      );
    }
  }, 0
);

const populateTags = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const data = chain.get('data');
    const actions = chain.get('actions');
    const map = chain.get('map');

    let index = 0;
    let toComplete = 0;
    for (const tag of data) {
      if (actions[tag.name] === 'insert') {
        ++toComplete;
        connection.query(
          'insert into tags (name, type) values ?',
          [[
            [ tag.name, tag.type ]
          ]],
          (error, result) => {
            if (error) {
              //
            } else {
              map[tag.name] = result.insertId;
            }

            if (++index === toComplete) {
              complete();
            }
          }
        );
      }
    }

    if (toComplete === 0) {
      complete();
    }
  }, 0
);

const insertForPicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const id = chain.get('id');
    const data = chain.get('data');
    const map = chain.get('map');

    let index = 0;
    let toComplete = 0;
    for (const tag of data) {
      ++toComplete;
      connection.query(
        'insert into file_tags (file, tag) values ?',
        [[
          [ id, map[tag.name] ]
        ]],
        (error, result) => {
          if (error) {
            //
          }

          if (++index === toComplete) {
            complete();
          }
        }
      );
    }

    if (toComplete === 0) {
      complete();
    }
  }, 0
);

const flagPicture = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const id = chain.get('id');

    connection.query(
      'update file_flags set request_tag = 0 where file = ?',
      [ id ],
      (error, result) => {
        if (error) {
          //
        }

        complete();
      }
    );
  }, 0
);

const tags = (connection, id, data) => {
  return tf.task((complete, self) => {
    tf.sequence(() => { complete(); })
      .push(analyzeTags)
      .push(populateTags)
      .push(insertForPicture)
      .push(flagPicture)
      .attach('connection', connection)
      .attach('id', id)
      .attach('data', data)
      .run();
  }, 0);
};

export { tags };
