import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const globalPrisma = new PrismaClient();

/**
 * Creates an invitation token for a new user.
 * Tokens expire in 48 hours.
 * 
 * @param {object} params
 * @param {string} params.email
 * @param {number} params.orgId
 * @param {string} params.role
 * @param {string} params.plan
 * @returns {Promise<string>} The generated secure token
 */
export async function createInvite({ email, orgId, role, plan }) {
  // Generate 32 secure random bytes, encode to hex (64 chars)
  const token = randomBytes(32).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // 48h expiration

  // Verify the org exists first
  const org = await globalPrisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    throw new Error('Organization not found');
  }

  await globalPrisma.invite.create({
    data: {
      email,
      token,
      role,
      plan,
      organization_id: orgId,
      expires_at: expiresAt
    }
  });

  return token;
}

/**
 * Accepts an invitation using its secure token and creates the User.
 * Uses Argon2id for hashing the password.
 * 
 * @param {object} params
 * @param {string} params.token
 * @param {string} params.password
 * @returns {Promise<object>} The created User object
 */
export async function acceptInvite({ token, password }) {
  const invite = await globalPrisma.invite.findUnique({
    where: { token }
  });

  if (!invite) {
    throw new Error('Invite not found or invalid');
  }

  if (invite.used) {
    throw new Error('Invite already used');
  }

  if (invite.expires_at < new Date()) {
    throw new Error('Invite expired');
  }

  // NFR15: Hash password with Argon2id
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  // DB Transaction: ensure we create user and mark invite used atomically
  const [user] = await globalPrisma.$transaction([
    globalPrisma.user.create({
      data: {
        email: invite.email,
        password_hash: passwordHash,
        role: invite.role,
        plan: invite.plan,
        organization_id: invite.organization_id
      }
    }),
    globalPrisma.invite.update({
      where: { id: invite.id },
      data: { used: true }
    })
  ]);

  return user;
}

/**
 * Verifies a given password against a hash to ensure argon2id rules are respected
 * @param {string} hash 
 * @param {string} plaintext 
 */
export async function verifyPassword(hash, plaintext) {
  return await argon2.verify(hash, plaintext);
}
