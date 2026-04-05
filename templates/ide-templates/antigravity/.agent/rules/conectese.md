---
name: conectese
---

# Conectese — Project Instructions

This project uses **Conectese**, a multi-agent orchestration framework.

## Quick Start

Type `/conectese` to open the main menu, or use any of these commands:
- `/conectese create` — Create a new team
- `/conectese run <name>` — Run a team
- `/conectese help` — See all commands

## Directory Structure

- `_conectese/` — Conectese core files (do not modify manually)
- `_conectese/_memory/` — Persistent memory (company context, preferences)
- `skills/` — Installed skills (integrations, scripts, prompts)
- `teams/` — User-created teams
- `teams/{name}/_investigations/` — Sherlock content investigations (profile analyses)
- `teams/{name}/output/` — Generated content and files
- `_conectese/_browser_profile/` — Persistent browser sessions (login cookies, localStorage)

## How It Works

1. The `/conectese` workflow is the entry point for all interactions
2. The **Architect** agent creates and modifies teams
3. During team creation, the **Sherlock** investigator can analyze reference profiles (Instagram, YouTube, Twitter/X, LinkedIn) to extract real content patterns
4. The **Pipeline Runner** executes teams automatically
5. All tasks run inline and sequentially (no background subagents)
6. Checkpoints pause execution for user input/approval

## Rules

- Always use `/conectese` commands to interact with the system
- Do not manually edit files in `_conectese/core/` unless you know what you're doing
- Team YAML files can be edited manually if needed, but prefer using `/conectese edit`
- Company context in `_conectese/_memory/company.md` is loaded for every team run

## Antigravity Environment: Subagents

This environment (Google Antigravity) does not support spawning background or parallel subagents. When agent instructions (e.g., from the Architect) say to "use the Task tool with run_in_background: true" or similar, you MUST instead execute all tasks inline and sequentially:

1. Inform the user you will process the tasks one by one
2. Execute each task in the current conversation — do NOT skip or defer any of them
3. Complete ALL tasks before asking the next question or moving on

Never announce that you "will do something in parallel" and then skip the work. Always do the actual research inline before continuing.

## Interaction Rules

- NEVER ask more than one question per message — always wait for the user's answer before proceeding to the next question
- When presenting options, always use a numbered list (1. / 2. / 3.) — tell the user to reply with the option number
