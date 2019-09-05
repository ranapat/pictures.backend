import { tf } from 'tasksf';

const getPartialParameters = (name, data) => {
  const partialParameters = [];
  for (let i = 0; i < data.length; ++i) {
    partialParameters.push(
      `${name}.name like ?`
    );
  }
  return partialParameters;
};

const analyzeParameters = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const page = chain.get('page');
    const limit = chain.get('limit');
    const data = chain.get('data');

    const parameters = new Array(data.length).fill('?');

    const query = data.length > 0 ? `
select
 f.id, f.path, f.name,
 (select count(tt2.id) from tags tt2 left join file_tags ftt on tt2.id=ftt.tag where (${getPartialParameters('tt2', data).join(' or ')}) and ftt.file=f.id) as matches
from tags t
 left join file_tags ft on t.id=ft.tag
 left join files f on f.id=ft.file
where (${getPartialParameters('t', data).join(' or ')})
group by f.id
order by matches desc
limit ${limit} offset ${page * limit}
` : `
select
 f.id, f.path, f.name,
 (select count(tt.id) from tags tt left join file_tags ftt on tt.id=ftt.tag where ftt.file=f.id) as matches
from tags t
 left join file_tags ft on t.id=ft.tag
 left join files f on f.id=ft.file
group by f.id
order by matches desc
limit ${limit} offset ${page * limit}
`;

    chain.attach('query', query);

    complete();
  }, 0
);

const getPictures = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const data = chain.get('data')
    const query = chain.get('query');
    const response = chain.get('response');

    let partial = [];
    for (const item of data) {
      partial.push(`%${item}%`);
    }

    connection.query(
      query,
      [].concat(partial).concat(partial),
      (error, result) => {
        if (error) {
          //
        }

        response.attach('result', result);
        response.attach('error', error);

        complete();
      }
    );
  }, 0
);

const search = (connection, page, limit, data) => {
  return tf.task((complete, self) => {
    tf.sequence(() => { complete(); })
      .push(analyzeParameters)
      .push(getPictures)
      .attach('connection', connection)
      .attach('page', page)
      .attach('limit', limit)
      .attach('data', data)
      .attach('response', self)
      .run();
  }, 0);
};

export { search };
