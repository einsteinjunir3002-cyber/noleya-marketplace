import { NextResponse } from 'next/server';
import { get, run } from '@/lib/db';
import { verifyPassword, createToken, getSessionCookieOptions } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = (body.identifier || body.email || '').trim().toLowerCase();
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required.' },
        { status: 400 }
      );
    }

    const user = get<{
      id: number;
      email: string;
      username: string | null;
      password_hash: string;
      salt: string;
      name: string;
      role: string;
      status: string;
      must_change_password: number;
    }>('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?', [identifier, identifier]);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password.' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact Noléya Foundation administration.' },
        { status: 403 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      logAuditAction(user.id, user.email, 'FAILED_LOGIN', 'users', user.id, { reason: 'bad_password' });
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Success: create token & cookie
    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      must_change_password: user.must_change_password === 1,
    });

    logAuditAction(user.id, user.email, 'LOGIN_SUCCESS', 'users', user.id);

    let redirectUrl = '/';
    if (user.must_change_password === 1) {
      redirectUrl = '/auth/change-password';
    } else if (user.role === 'OWNER' || user.role === 'ADMIN') {
      redirectUrl = '/admin';
    } else if (user.role === 'SELLER') {
      redirectUrl = '/seller/dashboard';
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        must_change_password: user.must_change_password === 1,
      },
      redirectUrl,
    });

    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service encountered an unexpected error.' },
      { status: 500 }
    );
  }
}
