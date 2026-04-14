---
title: 'Story 1.6: Wizard de Onboarding (Backend Foundation)'
type: 'feature'
created: '2026-04-13T23:05:00-03:00'
status: 'done'
baseline_commit: '7bddba21304e05124907f5cd4b373cbb7c94bdb6'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The system specifies a forced guided setup wizard after the first Admin login (FR50). We currently lack the state persistence in the `Organization` model to track whether this wizard has been finalized, which would cause it to pop up on every login.
**Approach:** Add an `onboarding_completed` boolean flag to the `Organization` schema. Implement a clean `organization.service.js` layer with a core method to complete this status. This serves as the foundation for the frontend interface and route guards.

## Boundaries & Constraints

**Always:** 
- Keep the default as `false` for `onboarding_completed` upon schema creation.
- Check if the organization exists before attempting an update to avoid database-level silent crashes.

**Ask First:** Should we track partial progress like "step 1 finished" or just a final boolean? The Acceptance criteria says "wizard marks as complete when all steps done". The final boolean state is simpler, less coupling to frontend steps, and sufficient. We will proceed with a boolean flag.

**Never:** 
- Assume the organization exists before validating it.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| COMPLETE_FLOW | `orgId` | Organization row updates `onboarding_completed` to `true`. | N/A |
| INVALID_ORG | Non-existent `orgId` | Update aborts. | Throws "Organization not found" |

</frozen-after-approval>

## Code Map

- `server/prisma/schema.prisma` -- Add `onboarding_completed` flag.
- `server/src/services/organization.service.js` -- Add `completeOnboarding(orgId)` logic.
- `server/tests/organization.service.test.js` -- Create basic unit tests for the organization mutation logic.

## Tasks & Acceptance

**Execution:**
- [x] `server/prisma/schema.prisma` -- Add `onboarding_completed Boolean @default(false)` parameter to the `Organization` model.
- [x] `server/src/services/organization.service.js` -- Implement `completeOnboarding(orgId)` -- Safely queries the existence of the organization and sets the flag to true.
- [x] `server/tests/organization.service.test.js` -- Implement the test suite for the new logic checking against missing dependencies.

**Acceptance Criteria:**
- Given a newly created organization, its `onboarding_completed` flag relies on the default `false`.
- Given a valid `orgId`, calling `completeOnboarding` successfully mutates the flag to `true`.

## Verification

**Commands:**
- `cd server && npm run test` -- expected: `organization.service.test.js` tests pass effectively.
- `npx prisma format` -- expected: Valid schema rules without throwing output errors.

## Suggested Review Order

**Modelo Unificado de Dados (BD)**

- Adiciona a flag isolada e booleana à tabela de `Organization` prevenindo corrupção de estado das etapas da interface (FR50).
  [`schema.prisma:18`](../../server/prisma/schema.prisma#L18)

**Organization Service**

- Desacopla e gerencia o endpoint puro de confirmação de conta garantindo persistência imediata uma vez que todos os passos do Frontend sejam concluídos.
  [`organization.service.js:10`](../../server/src/services/organization.service.js#L10)

**Test Coverage**

- Bateria unitária baseada na checagem dos fluxos de mutação bloqueando tentativas acidentais.
  [`organization.service.test.js:6`](../../server/tests/organization.service.test.js#L6)
