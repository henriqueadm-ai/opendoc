---
title: 'Story 1.1: Provisioning de Organização'
type: 'feature'
created: '2026-04-13T09:48:00-03:00'
status: 'in-review'
baseline_commit: '4388424a200b13d991737716b59e8a036d4fdd9a'
context: ['_bmad-output/planning-artifacts/architecture.md', '_bmad-output/project-context.md', '_bmad-output/planning-artifacts/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** We need a robust multi-tenant backend with schema-per-tenant isolation to support OpenDoc, but currently there is no backend server or database setup in the project.
**Approach:** Initialize the `/server` backend structure, configure Prisma with the master `public` schema for tracking organizations, and implement the `provisionOrganization` service that inserts an organization record and executes raw SQL to provision its dedicated `tenant_{id}` PostgreSQL schema.

## Boundaries & Constraints

**Always:** 
- Adhere strictly to the project-context ESM rules (`type: module`, no `require`, use `node:` prefix).
- Use Node's native `node:test` and `node:assert` for testing.
- Rely on Prisma for the `public` master schema and use Prisma's `$executeRawUnsafe` for dynamic `CREATE SCHEMA` statements.

**Ask First:** Modifying the multi-tenant paradigm or adding heavy web frameworks (like Express or Fastify) before the purely programmatic base level is verified.

**Never:** Hardcode credentials or database URLs. Do not mix tenant-level data models into the master `public` schema at this stage.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | `name: "My Org", slug: "my-org"` | `organizations` gets a new row, and `tenant_X` schema is created in PG. | N/A |
| DUPLICATE_SLUG | `slug: "my-org"` (already exists) | Function aborts cleanly, no schema provisioned. | Throws specific "Unique constraint" error. |
| DB_ERROR | Postgres goes offline during schema creation | Transaction or error prevents dangling partial state. | Fails gracefully and bubbles up error. |

</frozen-after-approval>

## Code Map

- `server/package.json` -- Defines the backend module, deps (prisma, @prisma/client).
- `server/prisma/schema.prisma` -- Master schema definition containing the `Organization` model.
- `server/src/services/tenant.service.js` -- Core service to insert logic and provision schema.
- `server/tests/tenant.service.test.js` -- Automated verification of the provisioning logic.

## Tasks & Acceptance

**Execution:**
- [x] `server/package.json` -- Scaffold server directory and install prisma -- Basic required setup.
- [x] `server/prisma/schema.prisma` -- Create `Organization` model and `Plan` enum -- Sets up master data structure.
- [x] `server/src/services/tenant.service.js` -- Implement `createOrganization(name, slug)` that inserts org and evaluates `CREATE SCHEMA "tenant_{id}"` -- Implements Story 1.1 logic.
- [x] `server/tests/tenant.service.test.js` -- Create integration test using `node:test` -- Proves provisioning works.

**Acceptance Criteria:**
- Given `name` and `slug`, when `createOrganization` is called, then a row is created in `organizations` and a dedicated `tenant_{id}` schema physically appears in the local PostgreSQL database.

## Verification

**Commands:**
- `cd server && npm run test` -- expected: `tenant.service.test.js` passes with green checkmarks.
- `npx prisma migrate dev --name init` -- expected: builds and applies the migration cleanly.
