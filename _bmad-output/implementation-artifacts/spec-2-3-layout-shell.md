---
title: 'Story 2.3: Layout Shell (Sidebar + Workspace)'
type: 'feature'
created: '2026-04-14T02:32:00-03:00'
status: 'done'
baseline_commit: 'e131dce68ed07f5856a83c6fd7b55087adbd2091'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The dashboard currently lacks a foundational skeleton layout to organize routing boundaries, navigation menus, and the primary application workspace accurately preventing structural drift (UX-DR11, UX-DR13).
**Approach:** Produce a global `LayoutShell` component that will operate as the absolute container for the authenticated user flow. It safely allocates rendering boundaries leveraging Tailwind flexbox semantics to ensure a `240px` Sidebar structure on Desktops, adjusting fluidly down on smaller windows while preparing space for a top header section to harbor elements like our Theme Toggle.

## Boundaries & Constraints

**Always:** 
- Restrict to `<aside>` and `<main>` robust semantic HTML5 nodes to ensure native screen-reader interpretation structure without extra ARIA logic where possible.
- Wrap the entire application under the structural footprint of `<ThemeProvider>`.
- Utilize standard viewport height (`min-h-screen`) bounding explicitly to prevent accidental window overlapping layouts mapping.

**Ask First:** Should we strictly depend on Shadcn's modern `Sidebar` hook component here? Considering Story 2.6 targets the Shadcn CLI massive component installations, we will construct an agnostic and pure Tailwind shell. It guarantees robust baseline structures which Shadcn later snaps into without blocking our chronological advancement.

**Never:** 
- Bleed padding logic or unmanaged margins that trigger horizontal scrolling (`overflow-x-hidden` or controlled `w-full` is mandatory on the primary wrapper).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| DESKTOP_VIEW | Width >= 1024px (`lg`) | Sidebar presents fixed width (`w-60` ~240px), main expands `flex-1 px-8`. | N/A |
| COMPACT_VIEW | Width < 1024px (`lg`) | Sidebar structurally compacts (e.g., hidden with block toggles), header maintains actions. | N/A |

</frozen-after-approval>

## Code Map

- `dashboard/src/components/layout-shell.tsx` -- New presentational semantic global wrapper targeting standard sidebar and main block bounds.
- `dashboard/src/App.tsx` -- Point of mount where `<ThemeProvider>` surrounds `<LayoutShell>` generating the final structural proof.

## Tasks & Acceptance

**Execution:**
- [x] `dashboard/src/components/layout-shell.tsx` -- Establish `div(flex)` enclosing an `<aside>` (desktop) and a column-flex `<main>` incorporating a top `<header>` which explicitly mounts our active `<ThemeToggle>`.
- [x] `dashboard/src/App.tsx` -- Intersect standard `react` components replacing defaults with the `<LayoutShell>` protected by context injections.

**Acceptance Criteria:**
- Given application mounts natively, a clear 2-column or resilient flex structure handles resizing with a dominant central workspace.
- The ThemeToggle remains globally accessible acting over the root successfully inside the Header.

## Verification

**Commands:**
- `cd dashboard && npm run build` -- expected: Build finishes rendering JSX structural transitions securely.

## Suggested Review Order

**Fundamento Layout Root**

- Criei a blindagem agnóstica de grid e fluxos (flex/col-span) onde a página principal cresce em proporções respeitando o Menu Fixo de 240px sem conflitar com scrolls do view `h-screen` que o Phaser irá consumir pesado na Epic 4.
  [`layout-shell.tsx:5`](../../dashboard/src/components/layout-shell.tsx#L5)

**Injeção Core de Entidades**

- Conector global engolindo os resquícios e dependências do scaffold com nossa dupla barreira de interface contextual (`<ThemeProvider>` seguido por `<LayoutShell>`).
  [`App.tsx:9`](../../dashboard/src/App.tsx#L9)
