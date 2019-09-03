import { tf } from 'tasksf';

const init = (config, command, args, database, complete) => {
  const sequence = tf.sequence(() => {
    complete();
  });

  sequence.push(tf.task((complete, self) => {
    const task = database.execute(
      'search',
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
