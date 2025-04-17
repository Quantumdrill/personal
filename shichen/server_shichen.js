const express = require('express');
const app = express.Router();

app.use(express.static("shichen/static"));

app.get('/', (req, res) => {
});

module.exports = app;