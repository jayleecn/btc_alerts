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
    to: process.env.EMAIL_RECEIVER,
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
  try {
    const [mvrvResponse, priceResponse] = await Promise.all([
      axios.get('https://bitcoinition.com/current.json'),
      axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    ]);
    
    const data = mvrvResponse.data.data;
    const btcPrice = priceResponse.data.bitcoin.usd;

    const now = new Date();
    const formattedTime = now.toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false 
    });

    console.log('Bitcoin Price:', btcPrice);
    console.log('MVRV-Z Score:', data.current_mvrvzscore);
    console.log('PI Multiple:', data.current_pimultiple);

    const tweet = `📈 MVRV-Z Score: ${data.current_mvrvzscore}（<0 Buy the dip, >7 Sell the peak）\n\n🔍 PI Multiple: ${data.current_pimultiple}（>0 Sell the peak）\n\n💰 Bitcoin Price: ${btcPrice} USD\n\n🕒 Current Time: ${formattedTime}（UTC+8）\n\n🔗 Data From: https://bitcoinition.com/current.json \n https://docs.coingecko.com/`;
    const tweetResponse = await client.v2.tweet(tweet);
    console.log("Tweet sent:", tweetResponse.data);

    if (data.current_mvrvzscore <= 0 || data.current_mvrvzscore >= 7 || data.current_pimultiple >= 0) {
      const emailSubject = 'Free Bitcoin Alerts';
      const emailBody = `📈 MVRV-Z Score: ${data.current_mvrvzscore}（<0 Buy the dip, >7 Sell the peak）\n\n🔍 PI Multiple: ${data.current_pimultiple}（>0 Sell the peak）\n\n💰 Bitcoin Price: ${btcPrice} USD\n\n🕒 Current Time: ${formattedTime}（UTC+8）\n\n`;

      await sendEmail(emailSubject, emailBody);
    }
  } catch (error) {
    console.error("Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
}

// 运行测试
fetchDataAndTweet();
