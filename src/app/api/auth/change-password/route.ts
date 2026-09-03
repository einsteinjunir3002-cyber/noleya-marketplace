import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword, createToken, getSessionCookieOptions } from '@/lib/auth';
import { get, run } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to change your password.' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match.' },
        { status: 400 }
      );
    }

    // Fetch user current record
    const dbUser = get<{ id: number; email: string; password_hash: string; salt: string; must_change_password: number }>(
      'SELECT id, email, password_hash, salt, must_change_password FROM users WHERE id = ?',
      [user.id]
    );

    if (!dbUser) {
      return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
    }

    // If not first boot forced change, verify current password
    if (dbUser.must_change_password === 0) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
      }
      const isCurrentValid = verifyPassword(currentPassword, dbUser.password_hash, dbUser.salt);
      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
      }
    }

    // Hash new password
    const { hash, salt } = hashPassword(newPassword);

    run(
      'UPDATE users SET password_hash = ?, salt = ?, must_change_password = 0, updated_at = datetime("now") WHERE id = ?',
      [hash, salt, user.id]
    );

    logAuditAction(user.id, user.email, 'PASSWORD_CHANGE', 'users', user.id);

    // Issue refreshed token with must_change_password = false
    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      must_change_password: false,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
      redirectUrl: user.role === 'OWNER' || user.role === 'ADMIN' ? '/admin' : user.role === 'SELLER' ? '/seller/dashboard' : '/',
    });

    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (err: any) {
    console.error('Password change error:', err);
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}
