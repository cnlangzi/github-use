#!/usr/bin/env node
/**
 * GitHub Copilot OAuth Device Code Flow
 * 
 * Usage:
 *   node scripts/auth.js              # OAuth device code flow (for API access)
 *   node scripts/auth.js --proxy     # Use Copilot Proxy (VSCode extension)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

// Config
const COPILOT_API_HOST = process.env.GITHUB_COPILOT_API_HOST || 'https://api.githubcopilot.com';
const COPILOT_TOKEN_URL = 'https://api.github.com/copilot_internal/v2/token';
const CLIENT_ID = 'Iv1.b507a08c87ecfe98';
const TOKEN_FILE = resolve(process.env.HOME || '/tmp', '.config', 'github-copilot', 'token.json');

// ─────────────────────────────────────────────
// curl helper (proxy-aware)
// ─────────────────────────────────────────────
function curl(url, opts = {}) {
  const { method = 'GET', body, headers = {}, timeout = 30 } = opts;
  const argsArr = ['curl', '-s', '--max-time', String(timeout)];
  if (method !== 'GET') argsArr.push('-X', method);
  
  // Auto-detect proxy from env
  const httpProxy = process.env.http_proxy || process.env.HTTP_PROXY ||
                    process.env.https_proxy || 'http://127.0.0.1:1087';
  argsArr.push('-x', httpProxy);
  
  for (const [k, v] of Object.entries(headers)) {
    argsArr.push('-H', `${k}: ${v}`);
  }
  if (body) argsArr.push('-d', body);
  argsArr.push('--', url);
  
  try {
    const output = execFileSync('curl', argsArr, { encoding: 'utf-8' });
    return { ok: true, data: JSON.parse(output) };
  } catch (e) {
    const stdout = e.stdout || '';
    const match = stdout.match(/\{.*\}/s);
    if (match) {
      try {
        return { ok: false, data: JSON.parse(match[0]), status: e.status };
      } catch {}
    }
    return { ok: false, data: { error: 'request_failed', message: e.message }, status: e.status || 500 };
  }
}

// ─────────────────────────────────────────────
// Token persistence
// ─────────────────────────────────────────────
function loadToken() {
  try {
    if (existsSync(TOKEN_FILE)) {
      const data = JSON.parse(readFileSync(TOKEN_FILE, 'utf-8'));
      if (data.access && data.expires && Date.now() < data.expires) {
        return data;
      }
    }
  } catch {}
  return null;
}

function saveToken(tokenData) {
  try {
    const dir = dirname(TOKEN_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    console.log('💾 Token saved to', TOKEN_FILE);
  } catch (e) {
    console.error('⚠️  Failed to save token:', e.message);
  }
}

// ─────────────────────────────────────────────
// Refresh token using GitHub OAuth refresh token
// ─────────────────────────────────────────────
async function refreshCopilotToken(refreshToken) {
  const resp = curl(COPILOT_TOKEN_URL, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${refreshToken}`,
      'User-Agent': 'GitHubCopilotChat/0.35.0',
    },
  });
  if (!resp.ok) {
    throw new Error(`Failed to refresh token: ${JSON.stringify(resp.data)}`);
  }
  const copilotData = resp.data;
  return {
    access: copilotData.token,
    expires: copilotData.expires_at * 1000 - 5 * 60 * 1000,
    refresh: refreshToken,
  };
}

// ─────────────────────────────────────────────
// Copilot Proxy mode (uses VSCode extension)
// ─────────────────────────────────────────────
async function proxyMode() {
  const PROXY_URL = process.env.COPILOT_PROXY_URL || 'http://localhost:3000/v1';
  
  console.log('🔗 GitHub Copilot via Proxy Mode');
  console.log('   Proxy URL:', PROXY_URL);
  console.log('');

  // Test connection
  const testResp = curl(`${PROXY_URL}/models`, { timeout: 5 });
  if (!testResp.ok) {
    console.error('❌ Cannot connect to Copilot Proxy at', PROXY_URL);
    console.error('   Make sure the Copilot Proxy VSCode extension is running.');
    console.error('   Set COPILOT_PROXY_URL env var to change the URL.');
    process.exit(1);
  }

  const models = testResp.data?.data || [];
  console.log('✅ Connected! Available models:', models.length);
  models.forEach(m => console.log('  -', m.id || m.model));
  
  // Save proxy config
  const proxyData = { mode: 'proxy', url: PROXY_URL, models: models.map(m => m.id || m.model) };
  try {
    mkdirSync(dirname(TOKEN_FILE), { recursive: true });
    writeFileSync(TOKEN_FILE.replace('token.json', 'proxy.json'), JSON.stringify(proxyData, null, 2));
    console.log('\n💾 Proxy config saved');
  } catch (e) {}
}

// ─────────────────────────────────────────────
// OAuth flow
// ─────────────────────────────────────────────
async function oauthMode() {
  // Check existing token
  const existing = loadToken();
  if (existing) {
    // Try to refresh if expired
    if (existing.refresh && Date.now() >= existing.expires) {
      console.log('🔄 Token expired. Refreshing...');
      try {
        const refreshed = await refreshCopilotToken(existing.refresh);
        saveToken(refreshed);
        console.log('✅ Token refreshed! Expires:', new Date(refreshed.expires).toLocaleString());
        return;
      } catch (e) {
        console.log('⚠️  Refresh failed:', e.message);
        console.log('   Need to re-authenticate...\n');
      }
    } else if (existing.refresh) {
      console.log('✅ Found valid cached token (expires', new Date(existing.expires).toLocaleString(), ')');
      console.log('   Token:', existing.access.slice(0, 40) + '...');
      return;
    }
  }

  // Step 1: Get device code
  console.log('📡 Requesting device code...');
  const deviceResp = curl('https://github.com/login/device/code', {
    method: 'POST',
    body: new URLSearchParams({ client_id: CLIENT_ID, scope: 'read:user' }).toString(),
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!deviceResp.ok) {
    console.error('❌ Failed to get device code:', deviceResp.data);
    process.exit(1);
  }
  const device = deviceResp.data;

  console.log('\n🌐 Open this URL in your browser:');
  console.log('   ', device.verification_uri);
  console.log('\n🔑 Enter this code:');
  console.log('   ', device.user_code);
  console.log('\n⏳ Waiting for authorization...');
  console.log('   (Token will auto-save when ready, Ctrl+C to cancel)\n');

  // Step 2: Poll for access token
  const deadline = Date.now() + device.expires_in * 1000;
  let interval = device.interval;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, interval * 1000));

    const tokenResp = curl('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        device_code: device.device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }).toString(),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokenData = tokenResp.data;

    if (tokenData.access_token) {
      // Step 3: Get Copilot token
      console.log('✅ GitHub authorization received! Getting Copilot token...');
      
      const copilotResp = curl(COPILOT_TOKEN_URL, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokenData.access_token}`,
          'User-Agent': 'GitHubCopilotChat/0.35.0',
        },
      });

      if (!copilotResp.ok) {
        console.error('❌ Failed to get Copilot token:', copilotResp.data);
        process.exit(1);
      }

      const copilotData = copilotResp.data;
      const result = {
        access: copilotData.token,
        expires: copilotData.expires_at * 1000 - 5 * 60 * 1000,
        refresh: tokenData.access_token,
      };

      saveToken(result);

      console.log('\n✅ Authorization complete!');
      console.log('   Access token:', result.access.slice(0, 40) + '...');
      console.log('   Expires:', new Date(result.expires).toLocaleString());
      return;
    }

    if (tokenData.error === 'authorization_pending') {
      process.stdout.write('⏳ Still waiting...\n');
      continue;
    }

    if (tokenData.error === 'slow_down') {
      interval = Math.max(1, interval + 1);
      console.log('⚠️  Slowing down polling interval to', interval, 's');
      continue;
    }

    console.error('❌ OAuth error:', tokenData.error, '-', tokenData.error_description);
    process.exit(1);
  }

  console.error('❌ Device flow timed out. Please try again.');
  process.exit(1);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  console.log('🔑 GitHub Copilot Auth\n');

  if (args.includes('--proxy') || args.includes('-p')) {
    await proxyMode();
  } else {
    await oauthMode();
  }
}

main().catch(e => { console.error('Fatal error:', e.message); process.exit(1); });
