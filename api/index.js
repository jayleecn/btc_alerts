module.exports = async (req, res) => {
  require('dotenv').config();
  const axios = require('axios');
  const { TwitterApi } = require('twitter-api-v2');
  const nodemailer = require('nodemailer');

  // 使用环境变量初始化 Twitter 客户端
  const client = new TwitterApi({
    appKey: process.env.CONSUMER_KEY,
    appSecret: process.env.CONSUMER_SECRET,
    accessToken: process.env.ACCESS_TOKEN_KEY,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
  });

  // 发送推特&邮件
  async function sendEmail(subject, body) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER, // 收件人邮箱地址
      subject: subject,
      text: body
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async function fetchDataAndTweet() {
    // 设置超时时间为 10 秒，防止请求挂起
    // 强制禁用代理，防止环境干扰
    const axiosConfig = { timeout: 10000, proxy: false };

    let mvrvData = null;
    let btcPrice = null;
    let mvrvError = null;

    // 1. 尝试获取 MVRV 数据 (允许失败)
    try {
      const mvrvResponse = await axios.get('https://bitcoinition.com/current.json', axiosConfig);
      mvrvData = mvrvResponse.data.data;
    } catch (error) {
      console.error("Warning: Failed to fetch MVRV data:", error.message);
      mvrvError = error.message;
    }

    // 2. 尝试获取 BTC 价格 (允许失败，但通常较稳定)
    try {
      const priceResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
        ...axiosConfig,
        headers: { 'User-Agent': 'Mozilla/5.0 (Node.js)' }
      });
      btcPrice = priceResponse.data.bitcoin.usd;
    } catch (error) {
      console.error("Warning: Failed to fetch BTC Price:", error.message);
    }

    // 如果两个数据都获取失败，则抛出异常，不再发送
    if (!mvrvData && !btcPrice) {
      throw new Error("All data sources failed. Cannot tweet.");
    }

    const now = new Date();
    const formattedTime = now.toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false 
    });

    // 动态构建推文内容
    let tweet = "";
    
    if (mvrvData) {
      tweet += `📈 MVRV-Z Score: ${mvrvData.current_mvrvzscore}（<0 Buy the dip, >5 Sell the peak）\n\n`;
      tweet += `🔍 PI Multiple: ${mvrvData.current_pimultiple}（>0 Sell the peak）\n\n`;
    } 

    if (btcPrice) {
      tweet += `💰 Bitcoin Price: ${btcPrice} USD\n\n`;
    } 

    tweet += `🕒 Current Time: ${formattedTime}（UTC+8）\n\n`;
    tweet += `🔗 Data From: https://bitcoinition.com/current.json \n https://docs.coingecko.com/`;

    try {
      const tweetResponse = await client.v2.tweet(tweet);
      console.log("Tweet sent:", tweetResponse.data);

      // 仅当 MVRV 数据存在且满足条件时，才发送邮件
      if (mvrvData && (mvrvData.current_mvrvzscore <= 0 || mvrvData.current_mvrvzscore >= 5 || mvrvData.current_pimultiple >= 0)) {
        const emailSubject = 'Free Bitcoin Alerts';
        const emailBody = tweet; 
        await sendEmail(emailSubject, emailBody);
      }
      
      return tweetResponse.data;
    } catch (error) {
      console.error("Error sending tweet:", error);
      throw error;
    }
  }

  // 主执行逻辑
  try {
    await fetchDataAndTweet();
    res.status(200).json({ success: true, message: 'Execution completed successfully' });
  } catch (error) {
    console.error("Execution failed:", error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};
