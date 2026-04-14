---
title: 'Story 1.4: Setup 2FA (TOTP)'
type: 'feature'
created: '2026-04-13T22:40:00-03:00'
status: 'done'
baseline_commit: 'fc08995f2340bf891827c74d8a4a1464e9c25cd8'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The platform requires mandatory 2FA, but users currently do not have a defined way to generate a TOTP secret and register their authenticator apps.
**Approach:** Implement a service to generate a secure TOTP secret using `otplib` and return a QR code provisioning URI. Implement a second confirmation service that accepts a TOTP code from the user, validates it against the generated secret, and upon success encrypts (AES-256) the secret, updating `totp_enabled` and `totp_secret` in the database.

## Boundaries & Constraints

**Always:** 
- Use standard `otplib` for TOTP secret generation (`authenticator.generateSecret()`).
- Encrypt the TOTP secret with AES-256 before persisting it to the database to protect against database leaks (NFR8).
- Store the encrypted secret immediately with `totp_enabled = false`, and upon confirmation set `totp_enabled = true`.

**Ask First:** Should the API return a data URL for the QR code image, or just the URI for the frontend to render the QR code? Best practice is returning the URI (`otpauth://...`) for the frontend to render the QR code. We will proceed with returning the URI.

**Never:** 
- Store the TOTP secret in plain text (must be encrypted using Node `crypto`).
- Activate `totp_enabled` without an explicit and valid verification confirmation step.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| GENERATE_SECRET | `userId` | Generates secret, saves encrypted with `totp_enabled=false`, returns `otpauth` URI. | Throws "User not found" |
| CONFIRM_VALID | `userId, totpCode` | Validates code vs decrypted secret; updates `totp_enabled=true`. | N/A |
| CONFIRM_INVALID | `userId, invalidCode`| Validation fails, `totp_enabled` remains `false`. | Throws "Invalid 2FA code" |

</frozen-after-approval>

## Code Map

- `server/package.json` -- Dependencies (no new needed, `crypto` is built-in).
- `server/src/services/auth.service.js` -- Add `generateTOTPSecret(userId)` and `confirmTOTPSetup(userId, code)`.
- `server/tests/auth.service.test.js` -- Add test suite for TOTP setup and confirmation.

## Tasks & Acceptance

**Execution:**
- [x] `server/src/services/auth.service.js` -- Add `generateTOTPSecret(userId)` -- Generates secret via `otplib`, encrypts it via Node `crypto` AES-256, saves to user. Returns URI.
- [x] `server/src/services/auth.service.js` -- Add `confirmTOTPSetup(userId, code)` -- Decrypts stored secret, validates with `otplib`. If valid, updates user to `totp_enabled = true`.
- [x] `server/tests/auth.service.test.js` -- Add tests for TOTP generation and confirmation -- Validate success scenarios and invalid code catch.

**Acceptance Criteria:**
- Given a user accesses 2FA setup, when requested, the system generates a secure TOTP secret.
- Given a valid TOTP code, the system validates the setup and flags `totp_enabled = true`.
- Given the system saves the secret, it is encrypted via AES-256.

## Verification

**Commands:**
- `cd server && npm run test` -- expected: `auth.service.test.js` continues to pass.

## Suggested Review Order

**Criptografia AES-256 e Segurança**

- Implementa as lógicas `encrypt` e `decrypt` padronizadas para `aes-256-gcm` resolvendo vulnerabilidades de vazamento do secret (NFR8).
  [`auth.service.js:14`](../../server/src/services/auth.service.js#L14)

**Geração e Ativação do TOTP**

- Gera o segredo inicial retornando a URI do padrão `otpauth` injetável no frontend sem enviar a seed via JSON e congela o 2FA.
  [`auth.service.js:165`](../../server/src/services/auth.service.js#L165)

- Finaliza a configuração do setup decriptando o banco e confirmando o `totp_enabled = true`.
  [`auth.service.js:190`](../../server/src/services/auth.service.js#L190)

**Test Coverage**

- Bateria unitária base estendida para garantir exception triggers contra base sem setup finalizado.
  [`auth.service.test.js:60`](../../server/tests/auth.service.test.js#L60)
