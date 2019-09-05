import { tf } from 'tasksf';

const defaultPage = 0;
const defaultLimit = 10;
const defaultConcat = 'and';
const concats = [ 'and', 'or' ];

const init = (config, command, args, database, complete) => {
  const page = command.page && !isNaN(command.page) ? parseInt(command.page) : defaultPage;
  const limit = command.limit && !isNaN(command.limit) ? parseInt(command.limit) : defaultLimit;

  const sequence = tf.sequence(() => {
    complete();
  });

  sequence.push(tf.task((complete, self) => {
    const task = database.execute(
      'search',
      page, limit,
      args
    );
    task._complete = () => {
      const result = task.get('result');
      const error = task.get('error');

      if (error) {
        console.log(result, error);
      } else {
        let response = [];
        for (const item of result) {
          response.push({
            'file': item.path + item.name
          });
        }

        console.log(JSON.stringify(response));
      }

    };
    sequence.unshift(task);

    complete();
  }, 0));

  sequence.run();
};

export { init };
