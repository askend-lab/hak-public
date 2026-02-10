#!/usr/bin/env node

/**
 * Install security tools (gitleaks, hadolint, tfsec) as local binaries
 * Downloads platform-specific binaries to node_modules/.bin/
 * No sudo required - installs to project directory only
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const VERSIONS = { gitleaks: '8.18.4', hadolint: '2.12.0', tfsec: '1.28.4' };

const platform = process.platform;
const arch = process.arch;
const binDir = path.join(__dirname, '..', 'node_modules', '.bin');

const log = (msg) => console.log(`[install-security-tools] ${msg}`);

function getToolUrl(name) {
  const v = VERSIONS[name];
  const isWin = platform === 'win32';
  const isMac = platform === 'darwin';
  
  if (name === 'gitleaks') {
    const os = isMac ? 'darwin' : isWin ? 'windows' : 'linux';
    const cpu = arch === 'arm64' ? 'arm64' : 'x64';
    return `https://github.com/gitleaks/gitleaks/releases/download/v${v}/gitleaks_${v}_${os}_${cpu}${isWin ? '.zip' : '.tar.gz'}`;
  }
  if (name === 'hadolint') {
    if (isWin) return `https://github.com/hadolint/hadolint/releases/download/v${v}/hadolint-Windows-x86_64.exe`;
    const os = isMac ? 'Darwin' : 'Linux';
    return `https://github.com/hadolint/hadolint/releases/download/v${v}/hadolint-${os}-${arch === 'arm64' ? 'arm64' : 'x86_64'}`;
  }
  if (name === 'tfsec') {
    const os = isMac ? 'darwin' : isWin ? 'windows' : 'linux';
    const cpu = arch === 'arm64' ? 'arm64' : 'amd64';
    return `https://github.com/aquasecurity/tfsec/releases/download/v${v}/tfsec-${os}-${cpu}${isWin ? '.exe' : ''}`;
  }
  return null;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    log(`Downloading ${url}`);
    const file = fs.createWriteStream(dest);
    const req = (u) => https.get(u, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return req(res.headers.location);
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
    req(url);
  });
}

function extractAndMove(tarPath, destDir, binary) {
  const tmp = path.join(destDir, '.tmp-extract');
  fs.mkdirSync(tmp, { recursive: true });
  execSync(`tar -xzf "${tarPath}" -C "${tmp}"`, { stdio: 'pipe' });
  const found = fs.readdirSync(tmp).find(f => f === binary || f.startsWith(binary));
  if (found) fs.renameSync(path.join(tmp, found), path.join(destDir, binary));
  fs.rmSync(tmp, { recursive: true, force: true });
}

async function installTool(name) {
  const url = getToolUrl(name);
  const binary = platform === 'win32' ? `${name}.exe` : name;
  const dest = path.join(binDir, binary);
  
  if (fs.existsSync(dest)) {
    try {
      const ver = execSync(`"${dest}" --version 2>&1`, { encoding: 'utf8' });
      if (ver.includes(VERSIONS[name])) { log(`${name} v${VERSIONS[name]} OK`); return; }
    } catch { /* reinstall */ }
  }
  
  const isTar = url.endsWith('.tar.gz');
  const tmp = path.join(binDir, `${name}-dl${isTar ? '.tar.gz' : ''}`);
  
  await download(url, tmp);
  
  if (isTar) { extractAndMove(tmp, binDir, name); fs.unlinkSync(tmp); }
  else if (url.endsWith('.zip')) { execSync(`unzip -o "${tmp}" -d "${binDir}"`, { stdio: 'pipe' }); fs.unlinkSync(tmp); }
  else { fs.renameSync(tmp, dest); }
  
  if (platform !== 'win32') fs.chmodSync(dest, 0o755);
  log(`${name} v${VERSIONS[name]} installed`);
}

async function main() {
  log(`Platform: ${platform}, Arch: ${arch}`);
  fs.mkdirSync(binDir, { recursive: true });
  
  for (const name of Object.keys(VERSIONS)) {
    try { await installTool(name); }
    catch (e) { log(`Failed ${name}: ${e.message}`); }
  }
}

main().catch(() => process.exit(0));
