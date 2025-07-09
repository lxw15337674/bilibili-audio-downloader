# 环境变量配置

本项目使用环境变量来配置API基础URL，支持统一管理所有API调用。

## 环境变量

### 统一API基础URL
```bash
# API基础URL (必须以NEXT_PUBLIC_前缀，客户端和服务端都可访问)
API_BASE_URL=http://localhost:8080
```

## 配置文件

### 开发环境
创建 `.env.local` 文件：
```bash
# API Configuration
API_BASE_URL=http://localhost:8080
```

### 生产环境
在部署平台（如Vercel）中设置相应的环境变量：
```bash
API_BASE_URL=https://your-api-domain.com
```

## API端点

基于配置的API基础URL，系统会自动构建以下端点：

### Bilibili相关
- 下载: `${API_BASE_URL}/api/bilibili/download`
- 标题获取: `/api/bilibili-title` (内部API路由)

### Douyin相关  
- 解析: `${API_BASE_URL}/api/douyin/parse`
- 下载: `${API_BASE_URL}/api/douyin/download`

## 使用说明

1. **首次使用**: 复制 `.env.example` 为 `.env.local` 并配置你的API URL
2. **开发环境**: 确保你的API服务运行在配置的URL上
3. **生产部署**: 在部署平台设置正确的生产环境API URL

## 注意事项

- `NEXT_PUBLIC_` 前缀的环境变量会暴露给客户端，请勿包含敏感信息
- 服务端环境变量 `API_BASE_URL` 仅在服务端可访问
- 如果未设置环境变量，系统会使用默认值 `http://localhost:8080` 