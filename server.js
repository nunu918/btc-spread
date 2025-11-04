require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
app.use(express.static('.'));

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: true });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const THRESHOLD = parseFloat(process.env.ALERT_THRESHOLD) || 0.01;
let lastAlert = 0;

let data = { l: { s: 0, d: 0, f: 0 }, p: { s: 0, d: 0, f: 0 }, alert: false };

// 模拟数据（真实用 WebSocket）
setInterval(() => {
  data.l.s = (0.0008 + Math.random()*0.0006).toFixed(4);
  data.p.s = (0.0005 + Math.random()*0.0005).toFixed(4);
  data.l.d = (0.03 + Math.random()*0.02).toFixed(2);
  data.p.d = (0.02 + Math.random()*0.02).toFixed(2);
  data.l.f = (-0.003 + Math.random()*0.002).toFixed(4);
  data.p.f = (0.001 + Math.random()*0.002).toFixed(4);

  const diff = Math.abs(data.l.s - data.p.s);
  if (diff > THRESHOLD && Date.now() - lastAlert > 60000) {
    bot.sendMessage(CHAT_ID, `BTC 点差警报！\nLighter: ${data.l.s}%\nParadex: ${data.p.s}%\n差值: ${diff.toFixed(4)}%`);
    lastAlert = Date.now();
    data.alert = true;
  } else data.alert = false;
}, 5000);

app.get('/api/data', (req, res) => res.json(data));
app.listen(process.env.PORT || 3000);
