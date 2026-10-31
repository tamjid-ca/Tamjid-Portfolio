import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

/**
 * Hashes a password using salted `crypto.scrypt` (`scrypt$<saltHex>$<derivedHex>`).
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(
    plainPassword,
    salt,
    KEY_LENGTH
  )) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored `scrypt$<saltHex>$<derivedHex>` hash
 * using constant-time comparison (`crypto.timingSafeEqual`).
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, salt, expectedHex] = parts as [string, string, string];
  if (!salt || !expectedHex) {
    return false;
  }

  const derivedKey = (await scryptAsync(
    plainPassword,
    salt,
    KEY_LENGTH
  )) as Buffer;
  const expectedBuf = Buffer.from(expectedHex, 'hex');

  if (derivedKey.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedKey, expectedBuf);
}
