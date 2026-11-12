# 朋友话翻译器

<img src="site/assets/cosmos-cups.svg" width="128" height="128" alt="两只印着格桑花的纸杯电话">

星星酱的友情实验室。用三种可能理解朋友的话，提供依据和自然接话建议。雨幕玻璃界面：雨窗背景上雨丝持续飘落，解读逐条浮现在雨幕上。静态网页，无后端，无第三方依赖。

## 使用

在 GitHub Pages 打开，填写自己的 DeepSeek API Key。密钥仅保留在当前页面输入框/请求内存，刷新或点击清空后移除。不使用 localStorage、Cookie、分析脚本或第三方 CDN。请求直接发送到 `https://api.deepseek.com/chat/completions`，使用访客自己的账户额度。

模型为 `deepseek-flash`。回复仅作理解参考，不代表对他人动机的事实判断。

## 部署

GitHub Pages：`main` 分支 `/site` 不受 branch source 支持，因此由 GitHub Actions 上传 `site/` 并部署。代码包不包含密钥、本地后端或凭证。

## 验证范围

本地交互与模拟 API 测试不代表真实模型质量验收。DeepSeek CORS 预检已验证支持本站 Origin。真实调用需使用者填写有效 Key。
