import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const MAX_RUNS = 20;

export async function listRuns(teamName, targetDir = process.cwd()) {
  const teamsDir = join(targetDir, 'teams');
  let teamNames;

  try {
    if (teamName) {
      teamNames = [teamName];
    } else {
      const entries = await readdir(teamsDir, { withFileTypes: true });
      teamNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    }
  } catch {
    return [];
  }

  const runs = [];

  for (const name of teamNames) {
    const outputDir = join(teamsDir, name, 'output');
    let runDirs;
    try {
      const entries = await readdir(outputDir, { withFileTypes: true });
      runDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      continue;
    }

    for (const runId of runDirs) {
      const run = { team: name, runId, status: 'unknown', steps: null, duration: null };

      try {
        const raw = await readFile(join(outputDir, runId, 'state.json'), 'utf-8');
        const state = JSON.parse(raw);
        run.status = state.status || 'unknown';
        if (state.step) run.steps = `${state.step.current}/${state.step.total}`;
        if (state.startedAt && (state.completedAt || state.failedAt)) {
          const start = new Date(state.startedAt).getTime();
          const end = new Date(state.completedAt || state.failedAt).getTime();
          run.duration = formatDuration(end - start);
        }
      } catch {
        // No state.json or malformed — keep defaults
      }

      runs.push(run);
    }
  }

  runs.sort((a, b) => b.runId.localeCompare(a.runId));
  return runs.slice(0, MAX_RUNS);
}

export function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function printRuns(runs) {
  if (runs.length === 0) {
    console.log('\n  No runs found.\n');
    return;
  }

  let currentTeam = null;
  for (const run of runs) {
    if (run.team !== currentTeam) {
      currentTeam = run.team;
      console.log(`\n  ${currentTeam}`);
      console.log('  ' + '─'.repeat(50));
    }
    const parts = [`    ${run.runId}`];
    parts.push(`[${run.status}]`);
    if (run.steps) parts.push(`${run.steps} steps`);
    if (run.duration) parts.push(run.duration);
    console.log(parts.join('  '));
  }
  console.log();
}
