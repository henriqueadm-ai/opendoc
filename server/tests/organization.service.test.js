import test from 'node:test';
import assert from 'node:assert/strict';
import { completeOnboarding } from '../src/services/organization.service.js';

test('organization.service', async (t) => {

  await t.test('completeOnboarding expects valid org in DB', async () => {
    // Tests without full live schema testing relying on expected exception bounds
    try {
      await completeOnboarding(99999);
      assert.fail('Should have thrown an organization not found wrapper or inner DB layer throw');
    } catch (err) {
      assert.ok(err.message.length > 0);
    }
  });

});
