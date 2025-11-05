const https = require('https');
const express = require('express');
const app = express();

// 全局数据
let latest = { 
  lighter: { spread: 0.0014, depth100k: 0.05, funding: -0.0029, mid: 101582.60 },
  paradex: { spread: 0.0010, depth100k: 0.03, funding: 0.0023, mid: 101582.65 }
};

// 每 10s 拉取真实价格（用原生 https）
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'btc-spread-monitor' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

setInterval(async () => {
  try {
    // 拉取 Lighter BTC 价格 (CoinGecko)
    const lighterData = await fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    latest.lighter.mid = lighterData.bitcoin.usd;

    // 拉取 Paradex BTC 价格（用 Binance 指数近似，真实可换）
    const binanceData = await fetchJson('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    latest.paradex.mid = parseFloat(binanceData.price);

    // 模拟点差/资金费
    latest.lighter.spread = (0.0008 + Math.random() * 0.001).toFixed(4);
    latest.paradex.spread = (0.0005 + Math.random() * 0.0008).toFixed(4);
    latest.lighter.funding = (-0.003 + Math.random() * 0.002).toFixed(4);
    latest.paradex.funding = (0.001 + Math.random() * 0.002).toFixed(4);

    console.log('实时价格更新:', latest.lighter.mid, latest.paradex.mid);
  } catch (e) {
    console.error('API 错误:', e);
  }
}, 10000);

// API 路由
app.get('/api/data', (req, res) => {
  res.json({
    l: { s: latest.lighter.spread, d: latest.lighter.depth100k, f: latest.lighter.funding, mid: latest.lighter.mid },
    p: { s: latest.paradex.spread, d: latest.paradex.depth100k, f: latest.paradex.funding, mid: latest.paradex.mid }
  });
});

// 静态文件
app.use(express.static('.'));
app.get('*', (req, res) => res.sendFile(__dirname + '/index.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`运行中: ${PORT}`));
