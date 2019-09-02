import { tf } from 'tasksf';

const toTag = (connection, limit) => {
  return tf.task((complete, self) => {
    const query = limit ? `
select f.*, fd.*
from files f
  left join file_flags ff on f.id=ff.file
  left join file_details fd on f.id=fd.file
where request_tag = 1
limit ?
        ` : `
select f.*, fd.*
from files f
  left join file_flags ff on f.id=ff.file
  left join file_details fd on f.id=fd.file
where request_tag = 1
`;
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

export { toTag };
