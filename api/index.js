
require('dotenv').config();

const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

// 使用环境变量初始化 Twitter 客户端
const client = new TwitterApi({
  appKey: process.env.CONSUMER_KEY,
  appSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN_KEY,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

module.exports = async (req, res) => {
  try {
    // 获取比特币数据
    const response = await axios.get('https://bitcoinition.com/current.json');
    const data = response.data.data;

    // 获取当前时间并格式化为年月日时分
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: false // 使用24小时制
    });

    // 构建推文内容
    const tweet = `🕒 Current Time: ${formattedTime}\n\n💰 Bitcoin Price: ${data.btc_price} USD\n\n📈 MVRV-Z Score: ${data.current_mvrvzscore}（<=0 Buy 抄底，>=7 Sell 逃顶）\n\n🔍 PI Multiple: ${data.current_pimultiple}（>=0 Sell 逃顶）\n\n\n🔗 Data From: https://bitcoinition.com/current.json \n https://bitcoinition.com/charts/`;

    // 发送推文
    const tweetResponse = await client.v2.tweet(tweet);
    console.log("Tweet sent:", tweetResponse.data);

    res.status(200).send('Tweet sent successfully!');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send('Error occurred while sending tweet.');
  }
};
