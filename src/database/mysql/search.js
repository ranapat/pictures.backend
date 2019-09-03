import { tf } from 'tasksf';

const analyzeParameters = tf.task(
  (complete, self) => {
    const chain = self.get(tf._CHAIN_);
    const connection = chain.get('connection')
    const data = chain.get('data');

    const parameters = new Array(data.length).fill('?');

    const query = data.length > 0 ? `
select
 f.id, f.path, f.name,
 (
  select count(tt.id) from tags tt left join file_tags ftt on tt.id=ftt.tag where tt.name in (${parameters.join(', ')}) and ftt.file=f.id
 ) as matches
from tags t
 left join file_tags ft on t.id=ft.tag
 left join files f on f.id=ft.file
where t.name in (${parameters.join(', ')})
group by f.id
order by matches desc
` : `
select
 f.id, f.path, f.name,
 (
  select count(tt.id) from tags tt left join file_tags ftt on tt.id=ftt.tag where ftt.file=f.id
 ) as matches
from tags t
 left join file_tags ft on t.id=ft.tag
 left join files f on f.id=ft.file
group by f.id
order by matches desc
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

    connection.query(
      query,
      [].concat(data).concat(data),
      (error, result) => {
        if (error) {
          //
        }

        console.log(error, result)

        complete();
      }
    );
  }, 0
);

const search = (connection, data) => {
  return tf.task((complete, self) => {
    tf.sequence(() => { complete(); })
      .push(analyzeParameters)
      .push(getPictures)
      .attach('connection', connection)
      .attach('data', data)
      .run();
  }, 0);
};

export { search };
