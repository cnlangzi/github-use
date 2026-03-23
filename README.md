# GitHub Copilot - Node.js Tools

Node.js toolkit using the same API as VSCode Copilot. Supports all 43 models including gpt-4o, claude-sonnet-4.5, and more.

## Quick Start

```bash
cd ~/workspace/skills/github-use
npm install
```

## Authentication

### Method 1: OAuth (Recommended)

```bash
node scripts/auth.js
```

Output example:
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

Token auto-saved after auth. Subsequent runs require no re-auth.

### Method 2: Manual Token

```bash
export GITHUB_COPILOT_TOKEN="your-token"
```

## Usage

### CLI

```bash
# Chat
node scripts/index.js chat "Hello, how are you?"

# Specify model
node scripts/index.js chat "Write a function" --model gpt-4o

# Translation
node scripts/index.js translate "hello world" --to Chinese

# Image understanding
node scripts/index.js image "What is in this image?" /path/to/image.jpg
```

### Node.js API

```javascript
import { chat, translate, understandImage } from './scripts/index.js';

// Chat
const result = await chat('What is 2+2?');
console.log(result.result.content);

// Translation
const translated = await translate('hello', { to: 'Chinese' });

// Image analysis
const described = await understandImage('Describe this', '/path/to/image.jpg');
```

## Supported Models

All 43 models available via `api.githubcopilot.com`:

### GPT Series
| Model ID | Description |
|----------|-------------|
| `gpt-4o` | ✅ Default, GPT-4o main model |
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

### Claude Series
| Model ID | Description |
|----------|-------------|
| `claude-opus-4.6` | Claude Opus 4.6 |
| `claude-opus-4.6-fast` | Claude Opus 4.6 Fast |
| `claude-opus-4.5` | Claude Opus 4.5 |
| `claude-sonnet-4.6` | Claude Sonnet 4.6 |
| `claude-sonnet-4.5` | Claude Sonnet 4.5 |
| `claude-sonnet-4` | Claude Sonnet 4 |
| `claude-haiku-4.5` | Claude Haiku 4.5 |

### Gemini Series
| Model ID | Description |
|----------|-------------|
| `gemini-2.5-pro` | Gemini 2.5 Pro |
| `gemini-3-pro` | Gemini 3 Pro |
| `gemini-3-flash` | Gemini 3 Flash |
| `gemini-3.1-pro-preview` | Gemini 3.1 Pro Preview |

### Other
| Model ID | Description |
|----------|-------------|
| `grok-code-fast-1` | Grok Code Fast |
| `text-embedding-3-small` | Text Embedding 3 Small |
| `text-embedding-ada-002` | Text Embedding Ada 002 |
| `oswe-vscode-prime` | OSWE VSCode Prime |
| `oswe-vscode-secondary` | OSWE VSCode Secondary |

### Usage Examples

```bash
node scripts/index.js chat "Hello" --model gpt-4o
node scripts/index.js chat "Hello" --model claude-sonnet-4.5
node scripts/index.js chat "Hello" --model gemini-2.5-pro
```

## Environment Variables

```bash
# Proxy (required for OAuth, must be able to reach GitHub)
export http_proxy=http://your-proxy:8080
export https_proxy=http://your-proxy:8080

# Manual token (skip OAuth)
export GITHUB_COPILOT_TOKEN="your-token"
```

## Token Management

- Token location: `~/.config/github-copilot/token.json`
- Validity: ~30 minutes
- Auto-refresh: `scripts/auth.js` auto-refreshes using GitHub OAuth token

Delete token to re-auth:
```bash
rm ~/.config/github-copilot/token.json
node scripts/auth.js
```

## Troubleshooting

### OAuth auth fails
- Ensure `http_proxy` / `https_proxy` is set correctly
- Proxy must be able to reach github.com

### Token expired
- Auto-refresh handles this
- If issues persist, delete `~/.config/github-copilot/token.json` and re-auth

### Node fetch fails
- All API calls use curl, not Node.js fetch
- Ensure curl is installed on the system
