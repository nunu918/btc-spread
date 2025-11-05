require('dotenv').config();
const express = require('express');
const app = express();

// 全局数据（模拟）
let data = { 
  l: { s: 0.0012, d: 0.04, f: -0.002 }, 
  p: { s: 0.0008, d: 0.03, f: 0.001 } 
};

// 每 5 秒更新模拟数据
setInterval(() => {
  data.l.s = (0.0008 + Math.random()*0.0008).toFixed(4);
  data.p.s = (0.0005 + Math.random()*0.0006).toFixed(4);
}, 5000);

// API 路由（必须在 static 前面！）
app.get('/api/data', (req, res) => {
  res.json(data);
});

// 静态文件（放最后）
app.use(express.static('.'));

// 兜底：所有未匹配路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
