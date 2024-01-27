const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const handler = require('./api/index'); // 引入您的 Serverless Function

app.all('*', (req, res) => {
  handler(req, res);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
