---
title: 'Story 2.1: Setup shadcn/ui + Tailwind CSS v4'
type: 'feature'
created: '2026-04-14T02:22:00-03:00'
status: 'done'
baseline_commit: '6efb8bdf03fded0f0f77acdf7e45fc9fb701a91e'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** We lack a functional UI design system pipeline to begin building the dashboard components. Future stories require `shadcn/ui` with the modern `Tailwind CSS v4` setup running smoothly as specified by (UX-DR1).
**Approach:** Initialize and configure Tailwind CSS v4 along with its dedicated Vite plugin inside the existing `dashboard` Vite project. Once Tailwind is configured and CSS variables represent its design layers, run the CLI `shadcn init` to structure `components.json` and generate the `lib/utils` foundation. Globally ensure the `@/` path alias is ready across Vite and TS configs.

## Boundaries & Constraints

**Always:** 
- Keep frontend dependencies securely inside `./dashboard/package.json` avoiding root workspace pollution.
- Use the modern `@tailwindcss/vite` plugin (Tailwind CSS v4 standard approach) ditching legacy PostCSS files.
- Expose `@/` resolving strictly to `./src/` in both `vite.config.ts` and `tsconfig.json`.

**Ask First:** Should I install standard unconfigured shadcn components instantly (like Dialog, Slider)? The Epic 2 breaks this: Story 2.6 strictly installs the 17 core components. Story 2.1 just mounts the foundation. We will respect this boundary and execute only `shadcn init`.

**Never:** 
- Break existing proxy structures within `vite.config.ts` during alias inclusions. Merge configurations non-destructively.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| VITE_BUILD | `npm run build` | Build succeeds without structural/CSS parsing errors. | CI blocks flow |
| ALIAS_RESOLUTION | `import fn from '@/lib/utils'` | Typescript and Vite correctly link to `src/lib/utils.ts`. | Compiler error |

</frozen-after-approval>

## Code Map

- `dashboard/package.json` -- Manage tailwindcss, @tailwindcss/vite installations.
- `dashboard/vite.config.ts` -- Inject tailwindcss plugin, path `@/` alias resolution config (`path.resolve`).
- `dashboard/tsconfig.json` -- Update `baseUrl` and `paths` arrays to sync compiler intelligence.
- `dashboard/src/index.css` -- Root entry containing `@import "tailwindcss";`.
- `dashboard/components.json` -- Native tracking file resulting from shadcn's initializer.

## Tasks & Acceptance

**Execution:**
- [x] `dashboard/package.json` -- Process installation of `tailwindcss @tailwindcss/vite` and base utils like `clsx`, `tailwind-merge`.
- [x] `dashboard/vite.config.ts` -- Extend current configurations injecting Vite plugins + path replacements.
- [x] `dashboard/tsconfig.json` -- Add Typescript path mapped layers referencing the src directory securely.
- [x] `Terminal` -- Initialize Shadcn standard engine natively bootstrapping the generic variables.

**Acceptance Criteria:**
- Tailwind configuration operates under Tailwind V4 Vite plugin optimally.
- The `@/` path safely translates into the base application `src` folder.
- The default `components.json` correctly monitors the components hierarchy.

## Verification

**Commands:**
- `cd dashboard && npm run build` -- expected: Clean UI emission passing CSS transforms.

## Suggested Review Order

**Fundamentos Vite x Tailwind v4**

- Vincula os plugins Vite para compilar as referências V4 do Tailwind no bundle principal junto à declaração dos path alias gerais.
  [`vite.config.ts:4`](../../dashboard/vite.config.ts#L4)

- Declara o setup padrão V4 `tailwindcss` global importado na inicialização da aplicação para injetar as variáveis Zinc do tema.
  [`index.css:1`](../../dashboard/src/index.css#L1)

**Estrutura Componentizada shadcn/ui**

- Configura o rastreador json definindo as aliases essenciais dos layouts mantendo estrito o mapeamento para `./src`.
  [`components.json:3`](../../dashboard/components.json#L3)

- Insere a dependência do mergeador utilitário global consumido obrigatoriamente por todos os blocos do Shadcn.
  [`utils.ts:1`](../../dashboard/src/lib/utils.ts#L1)
