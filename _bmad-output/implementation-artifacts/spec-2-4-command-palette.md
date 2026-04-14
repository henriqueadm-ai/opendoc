---
title: 'Story 2.4: Command Palette (⌘K)'
type: 'feature'
created: '2026-04-14T02:36:00-03:00'
status: 'done'
baseline_commit: '9818e7a263863a181ed230924a40fdf71921e90d'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** We lack swift, efficient route navigation forcing users to rely entirely on manual clicks inside the sidebar menus (UX-DR11). We need a system-level rapid finder capable of displaying quick actions or recent processes.
**Approach:** Deliver a globally mounted `CommandPalette` interface. We will capture `keydown` signals targeting the ubiquitous `⌘K / Ctrl+K` combinations. Once activated, a centered dialog overlay (modal) will appear containing a search input capable of filtering static demonstration lists (like "Processos", "Base de Conhecimento", or "Dashboard").

## Boundaries & Constraints

**Always:** 
- Explicitly block default browser search bars via `e.preventDefault()` during invocation logic.
- Secure fallback escape hatches implementing structural closures whenever users strike the `Escape` key or click exterior bounding boxes (Backdrop clicks).
- Map strictly to `z-index` highest bounds ensuring overlays completely obscure foundational layouts (like Phaser Games or Header structures).

**Ask First:** Should we strictly inject and bind standard `cmdk` (Shadcn's engine source dependency) here right now? No. Because Epic 2 strictly restricts 3rd party Core component additions for Story 2.6, we will implement this functional flow relying entirely on raw Tailwind & React state mechanisms as a clean agnostic template skeleton guaranteeing functionality without heavy external bindings.

**Never:** 
- Cause structural application memory leaks. React `useEffect` hooks allocating global listener bonds must correctly run unregistration teardowns (`removeEventListener`) exactly on unmount scopes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| SHORTCUT_PRESS | Keys `Cmd`/`Ctrl` + `K` invoked | Native browser actions are cancelled. Active focus transitions natively to search `<input>`. Z-indexed overlay appears visually. | N/A |
| SHORTCUT_EXIT | Key `Escape` invoked | Command State safely purges its visibility parameter seamlessly returning view priority to `App.tsx`. | N/A |
| LIST_FILTER | User types 'proc' | UI array updates intelligently leaving only related entries (Processos, etc) avoiding rendering stutters. | "Nenhum resultado" fallback |

</frozen-after-approval>

## Code Map

- `dashboard/src/components/command-palette.tsx` -- New presentational overlay controlling local visibility thresholds and hardcoded quick action arrays.
- `dashboard/src/components/layout-shell.tsx` -- Updated mount point embedding the standalone palette strictly ensuring it runs universally independent of internal routes.

## Tasks & Acceptance

**Execution:**
- [x] `dashboard/src/components/command-palette.tsx` -- Implement global custom Keypress hooks checking `(e.metaKey || e.ctrlKey) && e.key === 'k'`. Incorporate functional `.map` loops translating states to lists.
- [x] `dashboard/src/components/layout-shell.tsx` -- Import `<CommandPalette />` cleanly into the absolute highest structural JSX root.

**Acceptance Criteria:**
- Given user presses Cmd+K on macOS (or Ctrl+k on Windows), the interface responds with a centered palette.
- Given typing input, UI natively responds providing list feedback cleanly matching the string substrings accurately.

## Verification

**Commands:**
- `cd dashboard && npm run build` -- expected: Functional TypeScript checks bypassing runtime crashes globally.

## Suggested Review Order

**Maturidade dos Hooks Keypress**

- Interceptei as chamadas globais de digitação diretamente num Hook `useEffect` limpando devidamente no unmount (`removeEventListener`) garantindo performance ideal imune a memory-leaks.
  [`command-palette.tsx:10`](../../dashboard/src/components/command-palette.tsx#L10)

**Interface e Busca em Tempo Real**

- Renderização do Modal Flutuante travando o Z-index num Overlay usando tailwind e simulando o comportamento de `matching` instantaneamente (`toLowerCase().includes`).
  [`command-palette.tsx:47`](../../dashboard/src/components/command-palette.tsx#L47)

**Alojamento Universal**

- Importei e posicionei logo depois do `<main>` Workspace, forçando a janela Modal flutue sobre todo o Layout sem precisar repassar Props pelas páginas individuais!
  [`layout-shell.tsx:43`](../../dashboard/src/components/layout-shell.tsx#L43)
