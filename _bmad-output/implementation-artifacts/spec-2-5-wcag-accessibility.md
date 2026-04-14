---
title: 'Story 2.5: WCAG AA Accessibility Foundation'
type: 'feature'
created: '2026-04-14T12:12:00-03:00'
status: 'done'
baseline_commit: 'f654d74d2b270830fd71ebee5043bfed50882436'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Applications natively lack fundamental accessibility boundaries. As designated by UX-DR14, we must establish global WCAG AA compliance (Keyboard skip links, motion sickness reduction, and contrast rings) before importing heavy library UI components that might obscure navigation mapping.
**Approach:** Formulate universal accessibility reinforcements directly into `index.css` leveraging baseline modifiers for `focus-visible` outlining and forceful `prefers-reduced-motion` overrides. Alongside this, intercept the `layout-shell.tsx` root providing an invisible "Skip to Content" markup link natively routing keyboard-centric users exactly over the `#main-content`.

## Boundaries & Constraints

**Always:** 
- Maintain the visual shroud over the Skip Link utilizing `sr-only` exclusively detaching invisibility upon `focus-visible` instances where it jumps to `absolute z-50` highly contrasting blocks.
- Inject system outlines via strictly `:focus-visible` (not standard `:focus`) preserving clean aesthetic interfaces for primary mouse-click interactions!
- Map global fallback transitions forcing `1ms` speeds if operating systems request low motion bounds universally on `*, *::before, *::after`.

**Ask First:** Should we strictly audit all SVGs and Zinc component constants right now? The core Shadcn UI Zinc variables we deployed inside Story 2.2 inherently pass the minimum WGAC AA (4.5:1 ratio text/bg check) out of the box when dealing symmetrically with variables (`--foreground` over `--background`). The objective here isolates purely onto Structural Accessibility properties.

**Never:** 
- Remove `outline-none` on buttons globally without assigning robust `ring-offset-2 ring-2` fallbacks immediately to prevent invisible keyboard traps.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| KEYBOARD_TAB | User hits `TAB` loading site | Window bounds lock the hidden "Pular para conteúdo" explicitly unhiding a block above the UI structure physically. | N/A |
| SKIP_ENTER | User strikes `ENTER` | Focus transports bypassing Sidebar navigation hitting `#main-content` bounding workspace actions first. | N/A |
| OS_MOTION_STOP | OS Accessibility toggle activated | App interface drops transition CSS lengths/animations securely overriding delays preventing vertigo. | N/A |

</frozen-after-approval>

## Code Map

- `dashboard/src/index.css` -- Embed core layer utilities forcefully nullifying motions per OS instructions + structural focus standards.
- `dashboard/src/components/layout-shell.tsx` -- Inject anchor referencing `<a href="#main-content">` and append specific ID tag inside the central `<main>`.

## Tasks & Acceptance

**Execution:**
- [x] `dashboard/src/index.css` -- Insert generic focus ring directives modifying element visibility under Tab environments. Register `@media (prefers-reduced-motion: reduce)`.
- [x] `dashboard/src/components/layout-shell.tsx` -- Construct semantic `SkipLink` logic placed on index 0 of the DOM Tree structure.

**Acceptance Criteria:**
- Given a raw page initialization, the first tab strictly enforces visibility over the SkipLink without bleeding into standard viewports until keyed.
- Given OS-level configuration for minimal movement, the Dashboard forcefully prevents transitions avoiding visual discomfort.

## Verification

**Commands:**
- `cd dashboard && npm run build` -- expected: Functional builds guaranteeing CSS parsers swallow global declarations smoothly without conflicts against Tailwind core rules.

## Suggested Review Order

**Global CSS Restraints**

- Injection global via `@media (prefers-reduced-motion: reduce)` targeteando com altíssima especificidade para forçar resets `!important` evitando animações caso o OS solicite.
  [`index.css:38`](../../dashboard/src/index.css#L38)

**Skip Link Overlay**

- O link primordial é inserido invisivel do fluxo graças ao `absolute -translate-y-24`. Disparando transição que empurra visualmente ao receber trigger de `focus` por teclados referenciando nativamente ID `#main-content`.
  [`layout-shell.tsx:7`](../../dashboard/src/components/layout-shell.tsx#L7)
