import config from 'config';
import express from 'express';

import * as packageJson from '../../package.json';

import search from './routers/search';

const app = express();

app.get('/', (req, res) => {
  res.status(200).send(`Pictures Backend`);
});
app.get('/version', (req, res) => {
  res.status(200).send(`${packageJson.version}`);
});

app.use(config.api.endpoints.search, search);

app.listen(config.api.port);
