#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';
import { agentsCli } from '../src/agents-cli.js';
import { listRuns, printRuns } from '../src/runs.js';

const { positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];

if (command === 'init') {
  await init(process.cwd());
} else if (command === 'install') {
  // npx opendoc install <name>
  const result = await skillsCli('install', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'uninstall') {
  // npx opendoc uninstall <name>
  const result = await skillsCli('remove', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'update') {
  const target = positionals[1];
  if (target) {
    // npx opendoc update <name> → update specific skill
    const result = await skillsCli('update-one', [target], process.cwd());
    if (!result.success) process.exitCode = 1;
  } else {
    // npx opendoc update → update core
    const result = await update(process.cwd());
    if (!result.success) process.exitCode = 1;
  }
} else if (command === 'skills') {
  // Backward compat: npx opendoc skills list|install|remove|update
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await skillsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'agents') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await agentsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'runs') {
  const squadName = positionals[1] || null;
  const runs = await listRuns(squadName, process.cwd());
  printRuns(runs);
} else {
  console.log(`
  opendoc — Multi-agent orchestration for Claude Code

  Usage:
    npx opendoc init                    Initialize Opendoc
    npx opendoc update                  Update Opendoc core
    npx opendoc install <name>          Install a skill
    npx opendoc uninstall <name>        Remove a skill
    npx opendoc update <name>           Update a specific skill
    npx opendoc skills                  List installed skills
    npx opendoc agents                  List installed agents
    npx opendoc agents install <name>   Install a predefined agent
    npx opendoc agents remove <name>    Remove an agent
    npx opendoc agents update           Update all agents
    npx opendoc runs [squad-name]     View execution history

  Learn more: https://github.com/renatoasse/opendoc
  `);
  if (command) process.exitCode = 1;
}
