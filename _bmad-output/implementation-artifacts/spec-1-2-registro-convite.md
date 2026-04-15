---
title: 'Story 1.2: Registro de Usuário via Convite'
type: 'feature'
created: '2026-04-13T13:55:00-03:00'
status: 'done'
baseline_commit: 'e4f8c9f924d42bb4ca9cc7fe075ba255f391ffe7'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md', '_bmad-output/project-context.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The platform requires secure user access tied to specific organizations, but we currently lack a User model, Role definitions, and a secure invitation flow.
**Approach:** Add the `User` and `Invite` models to the `public` Prisma schema. Implement a service to generate a secure, 48-hour expiration invite token. Create another service to accept this token, validate it, and create the final `User` record utilizing `argon2id` for password hashing (NFR15).

## Boundaries & Constraints

**Always:** 
- Use the `argon2` npm package configured strictly for Argon2id.
- Store invite tokens as secure random bytes (e.g., `node:crypto` `randomBytes(32).toString('hex')`).
- Enforce the 48-hour expiration strictly at the database query level.
- Keep the pure ESM module pattern for all files.

**Ask First:** If implementing a real email transport (SMTP/SendGrid) is required right now. Currently, we will just generate the token and simulate the email sending by returning the link.

**Never:** Store passwords in plaintext or use weak hashes like MD5/SHA1. Do not authenticate the user immediately upon invite creation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CREATE_INVITE | `email, role, plan, org_id` | DB gets `Invite` row with 48h expiry. Returns token. | Fails if Org doesn't exist |
| ACCEPT_VALID | `token, password` | DB `User` created, `Invite` marked used. | N/A |
| EXPIRED_INVITE | `token` (older than 48h) | Aborts creation. | Throws "Invite expired or invalid" |

</frozen-after-approval>

## Code Map

- `server/package.json` -- Dependencies.
- `server/prisma/schema.prisma` -- Data models for `Role`, `User`, and `Invite`.
- `server/src/services/auth.service.js` -- Handles invite generation, token validation, and user creation with Argon2id.
- `server/tests/auth.service.test.js` -- Unit tests validating hashing and token expiration logic.

## Tasks & Acceptance

**Execution:**
- [ ] `server/package.json` -- Add `argon2` dependency -- Required for secure hashing.
- [ ] `server/prisma/schema.prisma` -- Add `User`, `Role` enum, and `Invite` model -- Foundations for Auth.
- [ ] `server/src/services/auth.service.js` -- Implement `createInvite(email, orgId, role, plan)` and `acceptInvite(token, password)` -- Core business logic.
- [ ] `server/tests/auth.service.test.js` -- Create `node:test` suite for the auth service -- Ensure invites expire and hashes are verifiable.

**Acceptance Criteria:**
- Given an Admin requests an invite for an email, a token is generated that expires in 48 hours.
- Given that token and a plaintext password, the system creates a User with an Argon2id hash and invalidates the token.

## Verification

**Commands:**
- `cd server && npm run test` -- expected: `auth.service.test.js` passes.
- `npx prisma format` -- expected: zero errors.

## Suggested Review Order

**Database Schema Setup**

- Adiciona os modelos `User` e `Invite`, integrados ao modelo `Organization` existente com as Roles do sistema.
  [`schema.prisma:29`](../../server/prisma/schema.prisma#L29)

**Service Core Logic**

- Token geração usando `node:crypto` de modo seguro, e configuração de validade rigorosa de 48h (NFR).
  [`auth.service.js:20`](../../server/src/services/auth.service.js#L20)

- Hashing nativo das credenciais usando `argon2id` atrelado a transações banco integradas (Atomicity).
  [`auth.service.js:63`](../../server/src/services/auth.service.js#L63)

**Test Coverage**

- Bateria nativa para verificar os módulos de criptografia de senhas puros na pipeline.
  [`auth.service.test.js:1`](../../server/tests/auth.service.test.js#L1)
