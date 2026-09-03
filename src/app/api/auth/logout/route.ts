import { NextResponse } from 'next/server';
import { getSessionCookieOptions, getCurrentUser } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    logAuditAction(user.id, user.email, 'LOGOUT', 'users', user.id);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  const cookieOptions = getSessionCookieOptions(0); // Expire immediately
  response.cookies.set(cookieOptions.name, '', cookieOptions);
  return response;
}
