---
name: github-use
version: 0.3.0
description: "GitHub Copilot AI tools for Node.js - chat, image understanding, translation. Uses api.githubcopilot.com (same as OpenCode)."
---

# GitHub Use - Node.js AI Tools

GitHub Copilot toolkit providing chat, image understanding, and translation via `api.githubcopilot.com`.

## Unified Interface

```javascript
import { chat, translate, understandImage, webSearch } from 'github-use/scripts/index.js';

// Chat
await chat('Hello');                              // simple chat
await chat('Write code', { model: 'gpt-4o' }); // specify model

// Image understanding
await understandImage('What is in this image?', '/path/to/image.jpg');

// Translation
await translate('hello', { to: 'Chinese' });

// Web search (model knowledge base)
await webSearch('today news');
```

## Return Format

```javascript
// Success
{ success: true, result: { content: '...' } }

// Failure
{ success: false, error: 'error message' }
```

## CLI Usage

```bash
cd ~/workspace/skills/github-use

# Chat
node scripts/index.js chat "Hello"

# Image understanding
node scripts/index.js image "Describe image" /path/to/image.jpg

# Translation
node scripts/index.js translate "hello" --to Chinese

# Search
node scripts/index.js search "news"
```

## Authentication

### Method 1: OAuth (Recommended, auto-manages tokens)
```bash
node scripts/auth.js
```
- Opens browser for auth or prints verification code
- Token auto-saved to `~/.config/github-copilot/token.json`
- Token refreshed automatically on expiry

### Method 2: Direct Copilot Token
```bash
export GITHUB_COPILOT_TOKEN="your-copilot-token"
```

### Method 3: GitHub OAuth Token
```bash
export GH_TOKEN="ghu_xxx"  # GitHub OAuth token
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_COPILOT_TOKEN` | - | Direct Copilot token |
| `GH_TOKEN` / `GITHUB_TOKEN` | - | GitHub Token (for token refresh) |
| `http_proxy` / `https_proxy` | - | Proxy URL (required for OAuth, must reach GitHub) |

## Supported Models

All 43 models available via `api.githubcopilot.com`:

| Model | Description |
|-------|-------------|
| `gpt-4o` | GPT-4o main model |
| `gpt-4o-mini` | GPT-4o Mini |
| `gpt-4.1` | GPT-4.1 |
| `gpt-5` | GPT-5 series |
| `claude-sonnet-4.5` | Claude Sonnet 4.5 |
| `claude-sonnet-4` | Claude Sonnet 4 |
| `claude-opus-4.5` | Claude Opus 4.5 |
| `gemini-2.5-pro` | Gemini 2.5 Pro |

Default model: `gpt-4o` (all functions)

## Install Dependencies

```bash
cd ~/workspace/skills/github-use
npm install
```

## Notes

- OAuth requires a proxy (`http_proxy` must reach GitHub)
- Token valid ~30 minutes, auto-refreshed
- All API calls use curl (Node.js fetch has issues with HTTP proxy to HTTPS)
