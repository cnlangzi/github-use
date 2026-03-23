# GitHub Copilot - Node.js Tools

与 VSCode Copilot 相同 API 的 Node.js 工具集。支持 gpt-4o、claude-sonnet-4.5 等全部 43 个模型。

## 快速开始

```bash
cd ~/workspace/skills/github-use
npm install
```

## 授权

### 方式 1: OAuth 授权（推荐）

```bash
node scripts/auth.js
```

输出示例：
```
🔑 GitHub Copilot Auth

📡 Requesting device code...
🌐 Open this URL in your browser:
    https://github.com/login/device

🔑 Enter this code:
    XXXX-XXXX

⏳ Waiting for authorization...
💾 Token saved to /home/user/.config/github-copilot/token.json
✅ Authorization complete!
```

授权后 token 自动保存，后续运行无需重复授权。

### 方式 2: 手动设置 Token

```bash
export GITHUB_COPILOT_TOKEN="your-token"
```

## 使用方法

### CLI

```bash
# 对话
node scripts/index.js chat "Hello, how are you?"

# 指定模型
node scripts/index.js chat "Write a function" --model gpt-4o

# 翻译
node scripts/index.js translate "hello world" --to Chinese

# 图像理解
node scripts/index.js image "What is in this image?" /path/to/image.jpg
```

### Node.js API

```javascript
import { chat, translate, understandImage } from './scripts/index.js';

// 对话
const result = await chat('What is 2+2?');
console.log(result.result.content);

// 翻译
const translated = await translate('hello', { to: 'Chinese' });

// 图像分析
const described = await understandImage('Describe this', '/path/to/image.jpg');
```

## 支持模型

通过 `api.githubcopilot.com` 提供全部 43 个模型：

### GPT 系列
| 模型 ID | 说明 |
|---------|------|
| `gpt-4o` | ✅ 默认，GPT-4o 主模型 |
| `gpt-4o-2024-11-20` | GPT-4o dated version |
| `gpt-4o-2024-08-06` | GPT-4o dated version |
| `gpt-4o-2024-05-13` | GPT-4o dated version |
| `gpt-4o-mini` | GPT-4o Mini |
| `gpt-4.1` | GPT-4.1 |
| `gpt-4.1-2025-04-14` | GPT-4.1 dated version |
| `gpt-5-mini` | GPT-5 Mini |
| `gpt-5.1` | GPT-5.1 |
| `gpt-5.1-codex` | GPT-5.1 Codex |
| `gpt-5.1-codex-mini` | GPT-5.1 Codex Mini |
| `gpt-5.1-codex-max` | GPT-5.1 Codex Max |
| `gpt-5.2` | GPT-5.2 |
| `gpt-5.2-codex` | GPT-5.2 Codex |
| `gpt-5.3-codex` | GPT-5.3 Codex |
| `gpt-5.4` | GPT-5.4 |
| `gpt-5.4-mini` | GPT-5.4 Mini |
| `gpt-4` | GPT-4 |
| `gpt-4-turbo` | GPT-4 Turbo |
| `gpt-3.5-turbo` | GPT-3.5 Turbo |

### Claude 系列
| 模型 ID | 说明 |
|---------|------|
| `claude-opus-4.6` | Claude Opus 4.6 |
| `claude-opus-4.6-fast` | Claude Opus 4.6 Fast |
| `claude-opus-4.5` | Claude Opus 4.5 |
| `claude-sonnet-4.6` | Claude Sonnet 4.6 |
| `claude-sonnet-4.5` | Claude Sonnet 4.5 |
| `claude-sonnet-4` | Claude Sonnet 4 |
| `claude-haiku-4.5` | Claude Haiku 4.5 |

### Gemini 系列
| 模型 ID | 说明 |
|---------|------|
| `gemini-2.5-pro` | Gemini 2.5 Pro |
| `gemini-3-pro` | Gemini 3 Pro |
| `gemini-3-flash` | Gemini 3 Flash |
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro Preview |

### 其他
| 模型 ID | 说明 |
|---------|------|
| `grok-code-fast-1` | Grok Code Fast |
| `text-embedding-3-small` | Text Embedding 3 Small |
| `text-embedding-ada-002` | Text Embedding Ada 002 |
| `oswe-vscode-prime` | OSWE VSCode Prime |
| `oswe-vscode-secondary` | OSWE VSCode Secondary |

### 使用示例

```bash
node scripts/index.js chat "Hello" --model gpt-4o
node scripts/index.js chat "Hello" --model claude-sonnet-4.5
node scripts/index.js chat "Hello" --model gemini-2.5-pro
```

## 环境变量

```bash
# 代理（OAuth 授权需要）
export http_proxy=http://127.0.0.1:1087
export https_proxy=http://127.0.0.1:1087

# 或使用其他代理
export http_proxy=http://your-proxy:8080

# 手动 token（跳过 OAuth）
export GITHUB_COPILOT_TOKEN="your-token"
```

## Token 管理

- Token 位置: `~/.config/github-copilot/token.json`
- 有效期: 约 30 分钟
- 自动刷新: `scripts/auth.js` 会自动用 GitHub OAuth token 刷新

删除 token 重新授权:
```bash
rm ~/.config/github-copilot/token.json
node scripts/auth.js
```

## 常见问题

### OAuth 授权失败
- 确保 `http_proxy` / `https_proxy` 设置正确
- 代理需要能访问 github.com

### Token 过期
- 自动刷新机制会处理
- 如遇问题，删除 `~/.config/github-copilot/token.json` 重新授权

### Node fetch 失败
- 所有 API 调用使用 curl，不依赖 Node.js fetch
- 确保系统安装了 curl
