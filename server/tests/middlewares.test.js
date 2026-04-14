import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../src/middlewares/auth.middleware.js';
import { checkPermissions } from '../src/middlewares/rbac.middleware.js';

test('middlewares', async (t) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_tests';
  
  // Mocks for Express objects
  const mockResponse = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    return res;
  };

  await t.test('requireAuth without token returns 401', () => {
    const req = { headers: {} };
    const res = mockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAuth(req, res, next);

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, 'Unauthorized: No token provided');
  });

  await t.test('requireAuth with valid token sets req.user and calls next', () => {
    const validToken = jwt.sign({ userId: 1, role: 'LAWYER', plan: 'LIGHT' }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = mockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAuth(req, res, next);

    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.role, 'LAWYER');
  });

  await t.test('checkPermissions with matching role allows access', () => {
    const req = { user: { role: 'LAWYER', plan: 'LIGHT' } };
    const res = mockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = checkPermissions({ roles: ['LAWYER', 'ADMIN'] });
    middleware(req, res, next);

    assert.equal(nextCalled, true);
  });

  await t.test('checkPermissions with non-matching role returns 403', () => {
    const req = { user: { role: 'LAWYER', plan: 'LIGHT' } };
    const res = mockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = checkPermissions({ roles: ['ADMIN'] });
    middleware(req, res, next);

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Forbidden: Insufficient role');
  });

  await t.test('checkPermissions with non-matching plan returns 403', () => {
    const req = { user: { role: 'ADMIN', plan: 'LIGHT' } };
    const res = mockResponse();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = checkPermissions({ plans: ['PRO'] });
    middleware(req, res, next);

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.error, 'Forbidden: Plan restriction');
  });
});
