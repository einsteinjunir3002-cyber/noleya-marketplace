import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { get, query, run } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'noleya_marketplace_secure_secret_key_ghana_accra_2026_super_safe';
const COOKIE_NAME = 'noleya_session';

export interface UserSession {
  id: number;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'SELLER' | 'CUSTOMER';
  must_change_password: boolean;
  seller_id?: number;
}

/**
 * Hashes a plaintext password with a random 32-byte salt using PBKDF2 (SHA-512).
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verifies a password against the stored salt and hash.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(checkHash, 'hex'));
}

/**
 * Creates a stateless signed JWT-like token.
 */
export function createToken(payload: object, expiresInSeconds: number = 86400 * 7): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies and decodes a signed token.
 */
export function verifyToken<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as T;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current session user from the HTTP-only cookie.
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  const payload = verifyToken<UserSession>(sessionCookie.value);
  if (!payload || !payload.id) return null;

  // Verify user still exists in database and is active
  const user = get<{ id: number; email: string; name: string; role: string; status: string; must_change_password: number }>(
    'SELECT id, email, name, role, status, must_change_password FROM users WHERE id = ?',
    [payload.id]
  );

  if (!user || user.status !== 'active') return null;

  let seller_id: number | undefined;
  if (user.role === 'SELLER') {
    const seller = get<{ id: number }>('SELECT id FROM sellers WHERE user_id = ?', [user.id]);
    seller_id = seller?.id;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserSession['role'],
    must_change_password: user.must_change_password === 1,
    seller_id,
  };
}

/**
 * Builds standard HTTP-only session cookie options.
 */
export function getSessionCookieOptions(maxAgeSeconds: number = 86400 * 7) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
