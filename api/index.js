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

// 发送邮件函数
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
  try {
    const response = await axios.get('https://bitcoinition.com/current.json');
    const data = response.data.data;

    const now = new Date();
    const formattedTime = now.toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false 
    });

   //  if (data.current_mvrvzscore <= 1 || data.current_mvrvzscore >= 6 || data.current_pimultiple >= -0.1) {
      const tweet = `🕒 Current Time: ${formattedTime}（UTC+8）\n\n💰 Bitcoin Price: ${data.btc_price} USD\n\n📈 MVRV-Z Score: ${data.current_mvrvzscore}（<0 抄底，>7 逃顶）\n\n🔍 PI Multiple: ${data.current_pimultiple}（>0 逃顶）\n\n\n🔗 Data From: https://bitcoinition.com/current.json \n https://bitcoinition.com/charts/`;
      const tweetResponse = await client.v2.tweet(tweet);
      console.log("Tweet sent:", tweetResponse.data);
   //  }

    if (data.current_mvrvzscore <= 2 || data.current_mvrvzscore >= 7 || data.current_pimultiple >= 0) {
      const emailSubject = 'Bitcoin Alerts';
      const emailBody = `🕒 Current Time: ${formattedTime}（UTC+8）\n\n💰 Bitcoin Price: ${data.btc_price} USD\n\n📈 MVRV-Z Score: ${data.current_mvrvzscore}（<0 抄底，>7 逃顶）\n\n🔍 PI Multiple: ${data.current_pimultiple}（>0 逃顶）\n\n\n`;

      await sendEmail(emailSubject, emailBody);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchDataAndTweet();

};