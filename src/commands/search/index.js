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
      //
    };
    sequence.unshift(task);

    complete();
  }, 0));

  sequence.run();
};

export { init };
