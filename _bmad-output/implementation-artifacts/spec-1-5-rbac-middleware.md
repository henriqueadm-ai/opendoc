---
title: 'Story 1.5: RBAC Middleware & Plan Restrictions'
type: 'feature'
created: '2026-04-13T22:45:00-03:00'
status: 'done'
baseline_commit: 'fc08995f2340bf891827c74d8a4a1464e9c25cd8'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Token generation works, but we don't have a middleware enforcing that incoming requests are authenticated or ensuring users have the correct `Role` and `Plan` to access specific endpoints (FR28).
**Approach:** Implement security middlewares. `requireAuth` will decode the JWT and inject the payload into the request object. A factory function `checkPermissions({ allowedRoles, allowedPlans })` will act as a guard, checking the user's `role` and `plan` against route requirements, yielding a `403 Forbidden` if conditions aren't satisfied.

## Boundaries & Constraints

**Always:** 
- Rely on stateless authentication. The JWT already wraps `org_id, role, plan`. Do NOT hit the database in these middlewares to save latency.
- Provide standard `(req, res, next)` signatures compatible with the Express foundation.
- Read the token from the `Authorization: Bearer <token>` header.

**Ask First:** Is there any dynamic permission that requires checking the database on every request? Based on ADRs, the system relies on JWT claims for scalability. We'll assume the JWT reflects the truth for its 8h lifespan.

**Never:** 
- Leak sensitive error stack traces to the client on a 401 or 403.
- Assume `req.user` exists in the RBAC middleware without `requireAuth` having run first.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| VALID_ACCESS | Valid JWT, matches required `role` & `plan` | `next()` is executed. | N/A |
| INVALID_TOKEN| Missing, expired, or malformed JWT | Blocks flow. | 401 Unauthorized |
| ROLE_MISMATCH| Token has `LAWYER`, route requires `ADMIN`| Blocks flow. | 403 Forbidden |
| PLAN_MISMATCH| Token has `LIGHT`, route requires `PRO` | Blocks flow. | 403 Forbidden |

</frozen-after-approval>

## Code Map

- `server/src/middlewares/auth.middleware.js` -- `requireAuth` logic for extracting and validating JWT.
- `server/src/middlewares/rbac.middleware.js` -- `checkPermissions` generator function for guarding routes.
- `server/tests/middlewares.test.js` -- Mock-based unit tests for standard middleware flows without needing an active HTTP server.

## Tasks & Acceptance

**Execution:**
- [x] `server/src/middlewares/auth.middleware.js` -- Create `requireAuth` -- Extracts Bearer token, verifies via `jsonwebtoken`, attaches claims to `req.user`. Returns 401 on failure.
- [x] `server/src/middlewares/rbac.middleware.js` -- Create `checkPermissions({ roles, plans })` -- Verifies `req.user.role` and `req.user.plan` against the authorized parameters. Returns 403 on mismatch.
- [x] `server/tests/middlewares.test.js` -- Add middleware tests -- Write tests using basic mocked `req`, `res`, `next` objects to cover scenarios of valid access, invalid tokens, and clearance mismatches.

**Acceptance Criteria:**
- Given a request without a valid token, `requireAuth` returns a 401 Unauthorized payload.
- Given a valid request from a `LAWYER`, `checkPermissions({ roles: ['ADMIN'] })` responds with 403 Forbidden.
- Given a valid request with `LIGHT` plan accessing a `PRO`-only route, `checkPermissions({ plans: ['PRO'] })` responds with 403 Forbidden.

## Verification

**Commands:**
- `cd server && npm run test` -- expected: `middlewares.test.js` tests pass covering all Edge-case matrices.

## Suggested Review Order

**Autenticação Stateless JWT**

- Valida a presença do token no header Authorization e injeta o objeto contendo as permissões no ambiente (`req.user`).
  [`auth.middleware.js:9`](../../server/src/middlewares/auth.middleware.js#L9)

**Middlewares Guardiões (RBAC)**

- Encontra e lê os acessos das `roles` e `plans` injetados e reage de forma assíncrona blindando as rotas da infra.
  [`rbac.middleware.js:9`](../../server/src/middlewares/rbac.middleware.js#L9)

**Test Coverage**

- Mock da API do Express validando as reações de boundary para ambas as implementações (401 e 403 HTTP codes).
  [`middlewares.test.js:25`](../../server/tests/middlewares.test.js#L25)
