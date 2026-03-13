#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLUGIN_DIR = path.join(__dirname, '..', 'plugin');

const COMMANDS = {
  init: 'Install Catalyst plugin into the current project',
  remove: 'Remove Catalyst plugin from the current project',
  status: 'Check if Catalyst is installed in the current project',
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
  /catalyst          Full analysis + generate all configs
  /catalyst:analyze  Analyze only (no file generation)
  /catalyst:skills   Generate skills only
  /catalyst:agents   Generate agents only
  /catalyst:claudemd Generate CLAUDE.md only
  /catalyst:settings Generate settings.local.json only
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
