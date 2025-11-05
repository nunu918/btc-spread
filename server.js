require('dotenv').config();
const express = require('express');
const app = express();

// 全局数据（含 mid 价格）
let latest = { 
  lighter: { spread: 0.0014, depth100k: 0.05, funding: -0.0029, mid: 101206.15 },
  paradex: { spread: 0.0010, depth100k: 0.03, funding: 0.0023, mid: 101124.02 }
};

// 每 5 秒更新模拟数据 + 价格波动
setInterval(() => {
  latest.lighter.spread = (0.0008 + Math.random() * 0.001).toFixed(4);
  latest.paradex.spread = (0.0005 + Math.random() * 0.0008).toFixed(4);
  latest.lighter.depth100k = (0.03 + Math.random() * 0.03).toFixed(2);
  latest.paradex.depth100k = (0.02 + Math.random() * 0.02).toFixed(2);
  latest.lighter.funding = (-0.003 + Math.random() * 0.002).toFixed(4);
  latest.paradex.funding = (0.001 + Math.random() * 0.002).toFixed(4);

  // 模拟价格波动（±$30）
  latest.lighter.mid = 101206.15 + (Math.random() - 0.5) * 60;
  latest.paradex.mid = 101124.02 + (Math.random() - 0.5) * 50;

  console.log('数据更新:', latest);
}, 5000);

// API 路由
app.get('/api/data', (req, res) => {
  res.json({
    l: { 
      s: latest.lighter.spread, 
      d: latest.lighter.depth100k, 
      f: latest.lighter.funding, 
      mid: latest.lighter.mid 
    },
    p: { 
      s: latest.paradex.spread, 
      d: latest.paradex.depth100k, 
      f: latest.paradex.funding, 
      mid: latest.paradex.mid 
    }
  });
});

// 静态文件 + 兜底
app.use(express.static('.'));
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
