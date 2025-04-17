const express = require('express');
const app = express.Router();

app.use(express.static("shichen/static"));

app.get('/', (req, res) => {
  res.send('Welcome to Project 1!');
});

module.exports = app;