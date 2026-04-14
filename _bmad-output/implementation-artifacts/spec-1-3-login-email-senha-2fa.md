---
title: 'Story 1.3: Login com E-mail/Senha + 2FA'
type: 'feature'
created: '2026-04-13T22:04:00-03:00'
status: 'done'
baseline_commit: 'b9bb36707468b8fe0f114215d986ebe84790d212'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Users need a secure way to authenticate into the platform. We have user records with passwords, but no mechanism to generate session tokens (JWT) or enforce the mandatory 2FA requirement (NFR10) and session lifecycle (NFR11).
**Approach:** Implement a two-step authentication service. First, verify the Argon2id email/password hash. Second, require a TOTP code validation. Upon success, generate a JWT with an 8-hour expiration containing necessary claims (`org_id`, `role`, `plan`) and generate a refresh token stored in the database for session renewal.

## Boundaries & Constraints

**Always:** 
- Use the existing `verifyPassword` method from `auth.service.js` which relies on `argon2`.
- Validate the TOTP (using `otplib` or similar) against the stored `totp_secret` in the `User` model.
- Issue stateless JWTs using `jsonwebtoken` with exactly 8 hours expiration (NFR11).
- Store refresh tokens securely in the database to allow session renewal without re-logging in.

**Ask First:** If the user has `totp_enabled` set to false, should we block login entirely or route them into a setup flow? Per NFR10, 2FA is 100% mandatory. We will assume login returns a "require_setup" state if `totp_enabled` is false, requiring them to go through Story 1.4 before getting a full JWT.

**Never:** 
- Return the access JWT prematurely before both password AND 2FA are successfully validated.
- Store plain-text passwords or JWT secrets in code (must use environment variables).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| VALID_CREDENTIALS | `email, password` | Returns temporary session state/user ID for 2FA. | N/A |
| INVALID_CREDENTIALS| `email, incorrect_password` | Authorization fails. | Throws "Invalid email or password" |
| VALID_TOTP | `userId, correct_totp` | Returns JWT (access_token) and RefreshToken. | N/A |
| INVALID_TOTP | `userId, incorrect_totp` | Authorization fails. | Throws "Invalid 2FA code" |
| MISSING_2FA_SETUP | `email, correct_password`, `totp_enabled: false` | Signals client that 2FA setup is required. | Throws "2FA setup required" |

</frozen-after-approval>

## Code Map

- `server/package.json` -- Add dependencies for JWT and TOTP parsing.
- `server/prisma/schema.prisma` -- Data models to store `RefreshToken`.
- `server/src/services/auth.service.js` -- Implements login and TOTP verification methods.
- `server/tests/auth.service.test.js` -- Validates login, TOTP verification and JWT issuance.

## Tasks & Acceptance

**Execution:**
- [x] `server/package.json` -- Add `jsonwebtoken` and `otplib` -- Required for JWT issuing and 2FA validation.
- [x] `server/prisma/schema.prisma` -- Add `RefreshToken` model -- Store tokens mapped to `User` for session renewal.
- [x] `server/src/services/auth.service.js` -- Add `verifyCredentials(email, password)` and `verifyTOTP(userId, totpCode)` -- Core login logic returning JWT and saving refresh token.
- [x] `server/tests/auth.service.test.js` -- Add test suite for `verifyCredentials` and `verifyTOTP` -- Verifies success path, invalid password, valid/invalid TOTP, and missing 2FA setup.

**Acceptance Criteria:**
- Given a user enters a valid email and password, when verified, the system requests a TOTP code.
- Given a valid TOTP code, the system returns a JWT (8h expiry) with org_id, role, and plan claims, plus a stored refresh token.

## Verification

**Commands:**
- `cd server && npm run test` -- expected: `auth.service.test.js` passes perfectly.
- `npx prisma format` -- expected: zero errors after adding `RefreshToken`.

## Suggested Review Order

**Database Schema Setup**

- Adiciona modelo de `RefreshToken` e o vincula ao usuário para controle de sessão longa (NFR11).
  [`schema.prisma:49`](../../server/prisma/schema.prisma#L49)

**Service Core Logic**

- Valida o hash da senha usando Argon2 e bloqueia acesso sem 2FA.
  [`auth.service.js:105`](../../server/src/services/auth.service.js#L105)

- Checa TOTP usando `otplib` e devolve JWT configurado para 8 horas de acesso.
  [`auth.service.js:128`](../../server/src/services/auth.service.js#L128)

**Test Coverage**

- Bateria unitária cobrindo o lançamento de exceções dos dois novos fluxos.
  [`auth.service.test.js:42`](../../server/tests/auth.service.test.js#L42)
