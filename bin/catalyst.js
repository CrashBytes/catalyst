#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const http = require('http');

const PLUGIN_DIR = path.join(__dirname, '..', 'plugin');
const CREDENTIALS_DIR = path.join(require('os').homedir(), '.catalyst');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.json');
const APP_URL = process.env.CATALYST_APP_URL || 'https://catalyst.crashbytes.com';

const COMMANDS = {
  init: 'Install Catalyst plugin into the current project',
  remove: 'Remove Catalyst plugin from the current project',
  status: 'Check if Catalyst is installed in the current project',
  login: 'Log in to Catalyst Cloud',
  logout: 'Log out of Catalyst Cloud',
  whoami: 'Show current logged-in user',
  help: 'Show this help message',
};

function printBanner() {
  console.log(`
   ╔═══════════════════════════════════════════╗
   ║     ⚡ Catalyst by CrashBytes ⚡          ║
   ║   Claude Code Configuration Generator     ║
   ╚═══════════════════════════════════════════╝
  `);
}

function printHelp() {
  printBanner();
  console.log('Usage: catalyst <command>\n');
  console.log('Commands:');
  for (const [cmd, desc] of Object.entries(COMMANDS)) {
    console.log(`  ${cmd.padEnd(12)} ${desc}`);
  }
  console.log(`
After installing, use these commands in Claude Code:
  /catalyst              Full analysis + generate all configs
  /catalyst analyze      Analyze only (no file generation)
  /catalyst skills       Generate skills only
  /catalyst agents       Generate agents only
  /catalyst mcp          Generate MCP server configs only
  /catalyst guardrails   Generate guardrails only
  /catalyst claudemd     Generate CLAUDE.md only
  /catalyst settings     Generate settings.local.json only
  `);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
      console.log(`  + ${path.relative(process.cwd(), destPath)}`);
    }
  }

  return count;
}

function init() {
  const targetDir = path.join(process.cwd(), '.claude');
  const skillsDir = path.join(targetDir, 'skills');
  const commandsDir = path.join(targetDir, 'commands');

  printBanner();
  console.log(`Installing Catalyst into: ${process.cwd()}\n`);

  // Copy skills
  const skillsSrc = path.join(PLUGIN_DIR, 'skills');
  if (fs.existsSync(skillsSrc)) {
    console.log('Installing skills...');
    copyDirRecursive(skillsSrc, skillsDir);
  }

  // Copy commands
  const commandsSrc = path.join(PLUGIN_DIR, 'commands');
  if (fs.existsSync(commandsSrc)) {
    console.log('\nInstalling commands...');
    copyDirRecursive(commandsSrc, commandsDir);
  }

  // Copy agents
  const agentsSrc = path.join(PLUGIN_DIR, 'agents');
  if (fs.existsSync(agentsSrc)) {
    console.log('\nInstalling agents...');
    const agentsDir = path.join(targetDir, 'agents');
    copyDirRecursive(agentsSrc, agentsDir);
  }

  console.log(`
Installation complete!

Next steps:
  1. Open Claude Code in this project
  2. Run /catalyst to analyze your codebase and generate configs
  3. Review the generated files and customize as needed

Tip: Run /catalyst:analyze first if you want to preview
     what Catalyst detects before generating files.
`);
}

function remove() {
  const targetDir = path.join(process.cwd(), '.claude');
  const catalystSkill = path.join(targetDir, 'skills', 'catalyst');
  const catalystCommands = [
    'catalyst.md',
    'catalyst-analyze.md',
    'catalyst-skills.md',
    'catalyst-agents.md',
    'catalyst-claudemd.md',
    'catalyst-settings.md',
  ];

  printBanner();
  console.log('Removing Catalyst from:', process.cwd(), '\n');

  if (fs.existsSync(catalystSkill)) {
    fs.rmSync(catalystSkill, { recursive: true });
    console.log('  - Removed skills/catalyst/');
  }

  for (const cmd of catalystCommands) {
    const cmdPath = path.join(targetDir, 'commands', cmd);
    if (fs.existsSync(cmdPath)) {
      fs.unlinkSync(cmdPath);
      console.log(`  - Removed commands/${cmd}`);
    }
  }

  // Remove codebase-analyzer agent
  const analyzerAgent = path.join(targetDir, 'agents', 'codebase-analyzer.md');
  if (fs.existsSync(analyzerAgent)) {
    fs.unlinkSync(analyzerAgent);
    console.log('  - Removed agents/codebase-analyzer.md');
  }

  console.log('\nCatalyst removed. Generated configs (CLAUDE.md, settings, custom skills) were preserved.');
}

function status() {
  const catalystSkill = path.join(process.cwd(), '.claude', 'skills', 'catalyst');

  printBanner();
  if (fs.existsSync(catalystSkill)) {
    console.log('Catalyst is INSTALLED in this project.');
    console.log(`Location: ${catalystSkill}`);

    const claudeMd = path.join(process.cwd(), 'CLAUDE.md');
    const settingsJson = path.join(process.cwd(), '.claude', 'settings.local.json');
    const generatedSkills = path.join(process.cwd(), '.claude', 'skills');

    console.log('\nGenerated configs:');
    console.log(`  CLAUDE.md:          ${fs.existsSync(claudeMd) ? 'EXISTS' : 'NOT GENERATED'}`);
    console.log(`  settings.local.json: ${fs.existsSync(settingsJson) ? 'EXISTS' : 'NOT GENERATED'}`);

    if (fs.existsSync(generatedSkills)) {
      const skills = fs.readdirSync(generatedSkills).filter(s => s !== 'catalyst');
      console.log(`  Custom skills:      ${skills.length > 0 ? skills.join(', ') : 'NONE'}`);
    }
  } else {
    console.log('Catalyst is NOT installed in this project.');
    console.log('Run: catalyst init');
  }
}

// --- Auth commands ---

function getCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function saveCredentials(creds) {
  if (!fs.existsSync(CREDENTIALS_DIR)) {
    fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
  }
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), { mode: 0o600 });
}

function deleteCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    fs.unlinkSync(CREDENTIALS_FILE);
  }
}

async function login() {
  printBanner();
  console.log('Logging in to Catalyst Cloud...\n');

  const loginUrl = `${APP_URL}/dashboard/settings?cli=true`;
  console.log('Opening your browser to complete authentication...');
  console.log(`If it doesn't open automatically, visit:\n  ${loginUrl}\n`);

  // Open browser
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    execSync(`${opener} "${loginUrl}"`, { stdio: 'ignore' });
  } catch {
    // Browser open failed, user can manually visit URL
  }

  // Start a local server to receive the token callback
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/callback' && url.searchParams.get('token')) {
        const token = url.searchParams.get('token');
        saveCredentials({ token, app_url: APP_URL });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h2>Catalyst CLI authenticated!</h2><p>You can close this tab and return to your terminal.</p></body></html>');

        console.log('Authentication successful!');
        console.log('Run `catalyst whoami` to verify.\n');

        server.close();
        resolve();
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(9876, () => {
      console.log('Waiting for authentication...');
      console.log('(Press Ctrl+C to cancel)\n');
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      console.log('\nAuthentication timed out. Please try again.');
      server.close();
      resolve();
    }, 5 * 60 * 1000);
  });
}

function logout() {
  printBanner();
  const creds = getCredentials();
  if (creds) {
    deleteCredentials();
    console.log('Logged out of Catalyst Cloud.');
  } else {
    console.log('Not currently logged in.');
  }
}

async function whoami() {
  printBanner();
  const creds = getCredentials();
  if (!creds || !creds.token) {
    console.log('Not logged in. Run `catalyst login` to authenticate.');
    return;
  }

  console.log('Checking authentication...\n');

  try {
    const url = `${creds.app_url || APP_URL}/api/auth/cli-token`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${creds.token}` },
    });

    if (!res.ok) {
      console.log('Authentication invalid or expired. Run `catalyst login` to re-authenticate.');
      return;
    }

    const data = await res.json();
    console.log(`Logged in as: ${data.user.email}`);
    console.log(`Plan: ${data.user.plan}`);
    if (data.user.name) console.log(`Name: ${data.user.name}`);
  } catch (err) {
    console.error('Failed to connect to Catalyst Cloud. Check your connection.');
  }
}

// Main
const command = process.argv[2] || 'help';

switch (command) {
  case 'init':
    init();
    break;
  case 'remove':
  case 'uninstall':
    remove();
    break;
  case 'status':
    status();
    break;
  case 'login':
    login();
    break;
  case 'logout':
    logout();
    break;
  case 'whoami':
    whoami();
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
