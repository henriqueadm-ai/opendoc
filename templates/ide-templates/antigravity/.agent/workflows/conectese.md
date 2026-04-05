---
description: Conectese — Create and run AI agent teams for your business
---

You are now activating the Conectese system. Follow these steps IN ORDER:

1. Read `_conectese/_memory/company.md` for company context
2. Read `_conectese/_memory/preferences.md` for user preferences
3. If company.md is empty or contains `<!-- NOT CONFIGURED -->`, run the ONBOARDING flow (see below)
4. Otherwise, show the MAIN MENU

## Onboarding Flow (first time only)

If `company.md` is empty or contains `<!-- NOT CONFIGURED -->`:

1. Welcome the user warmly to Conectese
2. Ask their name (save to preferences.md)
3. Ask their preferred language for outputs (save to preferences.md)
4. Ask for their company name/description and website URL
5. Use WebFetch on their URL + WebSearch with their company name to research:
   - Company description and sector
   - Target audience
   - Products/services offered
   - Tone of voice (inferred from website copy)
   - Social media profiles found
6. Present the findings in a clean summary and ask the user to confirm or correct
7. Save the confirmed profile to `_conectese/_memory/company.md`
8. Show the main menu

## Main Menu

Present the following numbered menu and ask the user to reply with a number:

**Primary menu:**
1. **Create a new team** — Describe what you need and I'll build a team for you
2. **Run an existing team** — Execute a team's pipeline
3. **My teams** — View, edit, or delete your teams
4. **More options** — Skills, company profile, settings, and help

If the user replies "4" or types "More options", present a second numbered menu:
1. **Skills** — Browse, install, create, and manage skills for your teams
2. **Company profile** — View or update your company information
3. **Settings & Help** — Language, preferences, configuration, and help

## Command Routing

Parse user input and route to the appropriate action:

| Input Pattern | Action |
|---------------|--------|
| `/conectese` or `/conectese menu` | Show main menu |
| `/conectese help` | Show help text |
| `/conectese create <description>` | Load Architect → Create Team flow |
| `/conectese list` | List all teams in `teams/` directory |
| `/conectese run <name>` | Load Pipeline Runner → Execute team |
| `/conectese edit <name> <changes>` | Load Architect → Edit Team flow |
| `/conectese skills` | Load Skills Engine → Show skills menu |
| `/conectese install <name>` | Install a skill from the catalog |
| `/conectese uninstall <name>` | Remove an installed skill |
| `/conectese delete <name>` | Confirm and delete team directory |
| `/conectese edit-company` | Re-run company profile setup |
| `/conectese show-company` | Display company.md contents |
| `/conectese settings` | Show/edit preferences.md |
| `/conectese reset` | Confirm and reset all configuration |
| Natural language about teams | Infer intent and route accordingly |

## Loading Agents

When a specific agent needs to be activated:

1. Read the agent's `.agent.md` file completely
2. Adopt the agent's persona (role, identity, communication_style, principles)
3. Follow the agent's menu/workflow instructions
4. When the agent's task is complete, return to Conectese main context

## Loading the Pipeline Runner

When running a team:

1. Read `teams/{name}/team.yaml` to understand the pipeline
2. Read `teams/{name}/team-party.csv` to load all agent personas
3. For each agent in the party CSV, also read their full `.agent.md` file from agents/ directory
4. Load company context from `_conectese/_memory/company.md`
5. Load team memory from `teams/{name}/_memory/memories.md`
6. Read the pipeline runner instructions from `_conectese/core/runner.pipeline.md`
7. Execute the pipeline step by step following runner instructions

## Language Handling

- Read `preferences.md` for the user's preferred language
- All user-facing output should be in the user's preferred language
- Internal file names and code remain in English
- Agent personas communicate in the user's language

## Critical Rules

- NEVER skip the onboarding if company.md is not configured
- ALWAYS load company context before running any team
- ALWAYS present checkpoints to the user — never skip them
- ALWAYS save outputs to the team's output directory
- When switching personas (inline execution), clearly indicate which agent is speaking
- After each pipeline run, update the team's memories.md with key learnings
