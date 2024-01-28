const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

// 引入您的 Serverless Function
const handler = require('./api/index'); 

// 特别处理 API 请求
app.all('/api/*', (req, res) => {
  handler(req, res);
});

// 静态文件服务
app.use(express.static('.')); 

// 为根 URL 返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 监听端口
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
