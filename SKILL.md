---
name: github-use
version: 0.2.0
description: "GitHub Copilot AI tools for Node.js - chat, image understanding, translation. Uses the Copilot API via api.githubcopilot.com"
metadata:
  openclaw:
    requires:
      env:
        - GITHUB_COPILOT_TOKEN
    primaryEnv: GITHUB_COPILOT_TOKEN
    os:
      - linux
      - darwin
      - win32
---

# GitHub Use - Node.js AI Tools

GitHub Copilot 工具集，提供对话、图像理解、翻译等功能。使用 `api.githubcopilot.com` 端点（与 OpenCode 相同）。

## 统一接口

```javascript
import { chat, translate, understandImage, webSearch } from 'github-use/scripts/index.js';

// 对话
await chat('你好');                              // 简单对话
await chat('写代码', { model: 'gpt-4o' });     // 指定模型

// 图像理解
await understandImage('图片里有什么?', '/path/to/image.jpg');

// 翻译
await translate('hello', { to: 'Chinese' });

// 搜索（基于模型知识库）
await webSearch('今日新闻');
```

## 返回格式

```javascript
// 成功
{ success: true, result: { content: '...' } }

// 失败
{ success: false, error: 'error message' }
```

## CLI 用法

```bash
cd ~/workspace/skills/github-use

# 对话
node scripts/index.js chat "你好"

# 图像理解
node scripts/index.js image "描述图片" /path/to/image.jpg

# 翻译
node scripts/index.js translate "hello" --to Chinese

# 搜索
node scripts/index.js search "news"
```

## 认证方式

### 方式 1: OAuth 授权（推荐，自动管理 token）
```bash
node scripts/auth.js
```
- 自动打开浏览器授权 or 打印验证码
- Token 自动保存到 `~/.config/github-copilot/token.json`
- Token 过期后自动刷新

### 方式 2: 直接传 Copilot Token
```bash
export GITHUB_COPILOT_TOKEN="your-copilot-token"
```

### 方式 3: GitHub OAuth Token
```bash
export GH_TOKEN="ghu_xxx"  # GitHub OAuth token
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `GITHUB_COPILOT_TOKEN` | - | Copilot 直接访问 token |
| `GH_TOKEN` / `GITHUB_TOKEN` | - | GitHub Token（用于刷新 token） |
| `http_proxy` / `https_proxy` | `http://127.0.0.1:1087` | 代理（OAuth 需要） |

## 支持模型

通过 `api.githubcopilot.com` 提供全部 43 个模型：

| 模型 | 说明 |
|------|------|
| `gpt-4o` | GPT-4o 主模型 |
| `gpt-4o-mini` | GPT-4o Mini |
| `gpt-4.1` | GPT-4.1 |
| `gpt-5` | GPT-5 系列 |
| `claude-sonnet-4.5` | Claude Sonnet 4.5 |
| `claude-sonnet-4` | Claude Sonnet 4 |
| `claude-opus-4.5` | Claude Opus 4.5 |
| `gemini-2.5-pro` | Gemini 2.5 Pro |

默认模型: `gpt-4o`（所有函数默认）

## 安装依赖

```bash
cd ~/workspace/skills/github-use
npm install
```

## 注意事项

- OAuth 授权需要代理（确保 `http_proxy` 环境变量指向可访问 GitHub 的代理）
- Token 有效期约 30 分钟，过期自动刷新
- Node.js fetch 通过 HTTP 代理访问 HTTPS 有问题，所有 API 调用使用 curl
