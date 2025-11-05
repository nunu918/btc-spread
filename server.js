require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const app = express();

// 全局数据（默认模拟，确保不为空）
let latest = { 
  lighter: { spread: 0.0012, depth100k: 0.04, funding: -0.002 },
  paradex: { spread: 0.0008, depth100k: 0.03, funding: 0.001 }
};

// 每 5 秒更新模拟数据（加强，确保总有数据）
setInterval(() => {
  latest.lighter.spread = (0.0008 + Math.random() * 0.0008).toFixed(4);
  latest.paradex.spread = (0.0005 + Math.random() * 0.0006).toFixed(4);
  latest.lighter.depth100k = (0.03 + Math.random() * 0.02).toFixed(2);
  latest.paradex.depth100k = (0.02 + Math.random() * 0.02).toFixed(2);
  latest.lighter.funding = (-0.003 + Math.random() * 0.002).toFixed(4);
  latest.paradex.funding = (0.001 + Math.random() * 0.002).toFixed(4);
  console.log('数据更新:', latest);  // 调试日志
}, 5000);

// Lighter WebSocket（加错误处理）
const lighterWs = new WebSocket('wss://api.lighter.xyz/ws');
lighterWs.on('open', () => console.log('Lighter WS 连接成功'));
lighterWs.on('message', (msg) => {
  try {
    const data = JSON.parse(msg);
    if (data.channel === 'orderbook' && data.bids?.length && data.asks?.length) {
      const bestBid = parseFloat(data.bids[0][0]);
      const bestAsk = parseFloat(data.asks[0][0]);
      const mid = (bestBid + bestAsk) / 2;
      latest.lighter.spread = (((bestAsk - bestBid) / mid) * 100).toFixed(4);
      console.log('Lighter 真实数据:', latest.lighter.spread);
    }
  } catch (e) { console.error('Lighter error:', e); }
});
lighterWs.on('error', (e) => console.error('Lighter WS error:', e));

// Paradex WebSocket（类似处理）
const paradexWs = new WebSocket('wss://api.paradex.trade/ws/v1');
paradexWs.on('open', () => console.log('Paradex WS 连接成功'));
paradexWs.on('message', (msg) => {
  try {
    const data = JSON.parse(msg);
    if (data.method === 'orderbook' && data.params?.bids?.length) {
      const bestBid = parseFloat(data.params.bids[0].price);
      const bestAsk = parseFloat(data.params.asks[0].price);
      const mid = (bestBid + bestAsk) / 2;
      latest.paradex.spread = (((bestAsk - bestBid) / mid) * 100).toFixed(4);
      console.log('Paradex 真实数据:', latest.paradex.spread);
    }
  } catch (e) { console.error('Paradex error:', e); }
});
paradexWs.on('error', (e) => console.error('Paradex WS error:', e));

// API 路由（确保返回数据）
app.get('/api/data', (req, res) => {
  res.json({
    l: { s: latest.lighter.spread, d: latest.lighter.depth100k, f: latest.lighter.funding },
    p: { s: latest.paradex.spread, d: latest.paradex.depth100k, f: latest.paradex.funding }
  });
});

// 静态文件
app.use(express.static('.'));

// 兜底路由
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
