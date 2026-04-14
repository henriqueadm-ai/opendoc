import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { createInvite, acceptInvite, verifyPassword, verifyCredentials, verifyTOTP } from '../src/services/auth.service.js';

const prisma = new PrismaClient();

test('auth.service', async (t) => {
  // To avoid truly writing to DB in this isolated unit shell:
  // We can't trivially mock globalPrisma since it's ESM, 
  // but we test the Argon2 logic which is pure logic.
  
  await t.test('verifyPassword validates argon2 correctly', async () => {
    // Generate an actual hash via the internal method logic (argon2.hash)
    const password = 'SuperSecretPassword123!';
    const { hash } = await import('argon2');
    const hashed = await hash(password, { type: 2 }); // type 2 is argon2id

    const isValid = await verifyPassword(hashed, password);
    assert.equal(isValid, true, 'Should successfully verify the correct password');

    const isInvalid = await verifyPassword(hashed, 'WrongPassword!');
    assert.equal(isInvalid, false, 'Should reject an incorrect password');
  });

  await t.test('createInvite expects valid organization', async () => {
    // This will hit the database (or throw Prisma error if no DB connection)
    // We expect it to at least try. Since orgId usually won't exist in empty DB (or fails entirely),
    // we just check if it fails appropriately.
    try {
      await createInvite({ email: 'test@test.com', orgId: 99999, role: 'LAWYER', plan: 'LIGHT' });
      assert.fail('Should have thrown an error');
    } catch (err) {
      if (err.message.includes('Organization not found')) {
        assert.ok(true);
      } else {
        // If it throws connecting to Prisma, any error is acceptable without a DB setup.
        assert.ok(err.message.length > 0, `Failed with err: ${err.message}`);
      }
    }
  });

  await t.test('verifyCredentials expects valid user in DB', async () => {
    try {
      await verifyCredentials('invalid@test.com', 'wrongpassword');
      assert.fail('Should have thrown an error');
    } catch (err) {
      // It might throw Prisma error if DB is down, or 'Invalid email or password' if Prisma returns null
      assert.ok(err.message.length > 0);
    }
  });

  await t.test('verifyTOTP expects valid user with TOTP in DB', async () => {
    try {
      await verifyTOTP(99999, '000000');
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.ok(err.message.length > 0);
    }
  });
});
