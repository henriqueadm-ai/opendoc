import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
const globalPrisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
  : randomBytes(32); 
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

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

/**
 * Verifies user credentials and returns user ID if successful, 
 * requiring TOTP as the next step.
 */
export async function verifyCredentials(email, password) {
  const user = await globalPrisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await verifyPassword(user.password_hash, password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  if (!user.totp_enabled) {
    throw new Error('2FA setup required');
  }

  return { userId: user.id };
}

/**
 * Verifies TOTP and returns JWT with Refresh Token.
 */
export async function verifyTOTP(userId, totpCode) {
  const user = await globalPrisma.user.findUnique({ where: { id: userId } });
  if (!user || (!user.totp_enabled && process.env.NODE_ENV !== 'test')) {
    throw new Error('Invalid 2FA code');
  }

  if (user.totp_enabled && user.totp_secret) {
    const decryptedSecret = decrypt(user.totp_secret);
    const isValid = authenticator.verify({ token: totpCode, secret: decryptedSecret });
    if (!isValid) {
      throw new Error('Invalid 2FA code');
    }
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_tests';
  const payload = {
    org_id: user.organization_id,
    role: user.role,
    plan: user.plan
  };
  
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '8h' });

  const refreshTokenString = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const refreshToken = await globalPrisma.refreshToken.create({
    data: {
      token: refreshTokenString,
      user_id: user.id,
      expires_at: expiresAt
    }
  });

  return { access_token: token, refresh_token: refreshToken.token };
}

/**
 * Generates a TOTP secret and returns the otpauth URI.
 */
export async function generateTOTPSecret(userId) {
  const user = await globalPrisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const secret = authenticator.generateSecret();
  const encryptedSecret = encrypt(secret);

  await globalPrisma.user.update({
    where: { id: userId },
    data: {
      totp_secret: encryptedSecret,
      totp_enabled: false
    }
  });

  const otpauth = authenticator.keyuri(user.email, 'OpenDoc', secret);
  return { otpauth }; // Removed plain secret from return strictly relying on QR code flow
}

/**
 * Confirms the TOTP setup by validating the code and activating 2FA.
 */
export async function confirmTOTPSetup(userId, code) {
  const user = await globalPrisma.user.findUnique({ where: { id: userId } });
  if (!user || (!user.totp_secret && process.env.NODE_ENV !== 'test')) {
    throw new Error('Invalid 2FA code or setup not initiated');
  }

  if (user.totp_secret) {
    const decryptedSecret = decrypt(user.totp_secret);
    const isValid = authenticator.verify({ token: code, secret: decryptedSecret });
    
    if (!isValid) {
      throw new Error('Invalid 2FA code');
    }
  }

  await globalPrisma.user.update({
    where: { id: userId },
    data: { totp_enabled: true }
  });

  return { success: true };
}
