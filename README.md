偷得浮生半日闲，写点代码当甜点。

# 需求
- 采集 BTC 指标：MVRV Z-score 和 Pi Multiple
- 每日自动发布到 Twitter: https://twitter.com/FreeBTCAlerts

# 实现
- 让 ChatGPT 辅助写了 index.js，采集数据，并发布到 Twitter
- 程序本地运行 OK 后，部署到了 Vercel，并用 GitHub Actions 实现每日定时采集和发布

# 踩坑（ChatGPT 挖坑也能帮着填坑）
- ChatGPT 刚开始给的 index.js 没加载.env。需要先安装 dotenv 包，然后在 index.js 最顶部添加代码“require('dotenv').config();”，搞定！
- ChatGPT 引入的 Twitter 客户端版本不对，刚开始没通，后来让 ChatGPT 参考 Twitter 官方示例代码，换成了 2.0 API，搞定！
- TWitter API 调通后，提示没权限 post tweet，需要改下 User authentication settings：给与“Write”权限。改完设置后，要重新生成下 ACCESS_TOKEN_KEY和ACCESS_TOKEN_SECRET，搞定！
- 部署到 Vercel，需要配置 Serverless Functions。Vercel 默认将 /api 目录下的文件视为 Serverless Functions，因此将 index.js 文件挪到 /api 目录下，并加了 vercel.json 配置文件，搞定！
- GitHub Actions 定时触发没成功，需要把仓库从 private 改为 public，搞定！
