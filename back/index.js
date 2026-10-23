const PORT=4001
const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const app = express();

const port = process.env.PORT || 4001;

app.get('/', (req, res) => {
  res.send('Hello from back');
});

app.get('/user', (req, res) => {
  res.json('voici les user');
});

app.listen(port, () => {
  console.log('serveur tourne dans le port ' + port);
});