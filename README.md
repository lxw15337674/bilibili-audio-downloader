# B站视频音频下载器

这是一个基于 [Next.js](https://nextjs.org) 开发的B站视频音频提取工具，可以方便地下载B站视频的音频文件。

## 功能特点

- 🎵 支持从B站视频链接提取音频
- 🎨 现代化的用户界面设计
- 💾 本地下载历史记录
- 📊 下载统计
## 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可看到应用界面。

## 使用方法

1. 复制B站视频链接（支持 bilibili.com/video/ 格式的链接）
2. 粘贴到输入框中
3. 点击下载按钮
4. 等待下载完成，音频文件会自动保存

## 技术栈

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios

## 本地开发

1. 克隆项目
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行开发服务器：
   ```bash
   npm run dev
   ```

## 部署

推荐使用 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 部署，它是 Next.js 的创建者提供的托管服务。

更多部署相关信息，请查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。
