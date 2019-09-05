import express from 'express';
import { spawn } from 'child_process';

const router = express.Router();

let result = [];

router.use((req, res, next) => {
  const query = req.query;
  const page = query.page ? query.page : undefined;
  const limit = query.limit ? query.limit : undefined;
  const q = query.q ? query.q : undefined;

  let output = '';

  if (q) {
    const spawned = spawn('./app', [ 'search', q, '-p', page, '-l', limit ]);

    spawned.stdout.on('data', (data) => {
      output += data.toString();
    });
    spawned.on('exit', (code) => {
      try {
        result = JSON.parse(output);
      } catch (e) {
        result = [];
      }

      next();
    });
  } else {
    result = [];

    next();
  }

});

router.get('/', (req, res) => {
  res.status(200).send(result);
});

router.get('/help', (req, res) => {
  res.status(200).send('help');
})

export default router;
