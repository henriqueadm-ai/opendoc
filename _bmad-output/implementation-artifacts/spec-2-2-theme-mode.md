---
title: 'Story 2.2: Zinc Theme Dark/Light Mode'
type: 'feature'
created: '2026-04-14T02:30:00-03:00'
status: 'done'
baseline_commit: '1f4ce503174e119720c92cd68ed534694997c458'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** We have the foundational CSS variables structure for the Zinc theme, but the user has no way to control their preferred theme (dark/light) from within the UI (UX-DR2, FR59).
**Approach:** Implement a robust `ThemeProvider` using React context to track, toggle, and persist the theme preference to `localStorage`. We will also implement a simple `ThemeToggle` component to act as the primary interface for triggering the state change.

## Boundaries & Constraints

**Always:** 
- Respect system preferences initially (`window.matchMedia('(prefers-color-scheme: dark)')`) acting as a fallback if `localStorage` has no saved theme.
- Ensure the structural `<html class="dark">` toggle happens directly within the context provider to decouple it from UI elements.

**Ask First:** Should we use Shadcn's exact `ThemeProvider` pattern? Yes, this uses standard React Context to inject `.dark` explicitly onto the `window.document.documentElement`.

**Never:** 
- Cause layout shifts from Flash of Unstyled Content (FOUC) relying on React `useEffect` for heavy re-injection if preventable. Set the initial state efficiently.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CLICK_TOGGLE | Theme is "light" | `localStorage.setItem` runs, `root.classList.add('dark')`, State updates to Dark mode CSS tokens. | N/A |
| CLICK_TOGGLE | Theme is "dark" | `localStorage.setItem` runs, `root.classList.remove('dark')`, State updates to Light CSS tokens. | N/A |
| PREFERENCE_LOAD | User returns (localStorage active) | Application bootstraps respecting the prior stored preference state. | Fallback to "system" |

</frozen-after-approval>

## Code Map

- `dashboard/src/components/theme-provider.tsx` -- New context provider wrapping logic.
- `dashboard/src/components/theme-toggle.tsx` -- New presentational button triggering the switch logic hooked to useTheme().

## Tasks & Acceptance

**Execution:**
- [x] `dashboard/src/components/theme-provider.tsx` -- Implement `ThemeProvider` reacting to `window.matchMedia` and persisting logic to `localStorage("vite-ui-theme")`.
- [x] `dashboard/src/components/theme-toggle.tsx` -- Implement an accessible toggle button capable of switching standard states via `useTheme()`.

**Acceptance Criteria:**
- Given application boots, the `ThemeProvider` successfully locates the highest HTML document element and safely assigns the `.dark` class if the environment explicitly relies on it.
- Given a toggle execution, the CSS Variables gracefully transpose between mode variants immediately globally without page reloading requirements.

## Verification

**Commands:**
- `cd dashboard && npm run build` -- expected: TypeScript compiles the interfaces fully without prop drilling complaints.

## Suggested Review Order

**Contexto e Persistência do Sistema**

- Inicializa o provedor global do tema encarregado de injetar explicitamente o seletor root (`.dark`) baseado no estado, ou na fallback local nativa do PC via `matchMedia`.
  [`theme-provider.tsx:32`](../../dashboard/src/components/theme-provider.tsx#L32)

- Interrogações do Storage `localStorage.setItem` atreladas dentro da closure set global no provider evitando render flows desnecessários.
  [`theme-provider.tsx:50`](../../dashboard/src/components/theme-provider.tsx#L50)

**Interface Resiliente (UI Component)**

- Criação nativa de um botão minimalista utilizando `lucide-react` importado isoladamente sem aguardar o pool global da biblioteca de shadcn final.
  [`theme-toggle.tsx:12`](../../dashboard/src/components/theme-toggle.tsx#L12)
