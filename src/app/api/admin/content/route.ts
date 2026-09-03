import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run, query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  const rows = query<{ key: string; value: string }>('SELECT key, value FROM site_settings');
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings object.' }, { status: 400 });
    }

    for (const [key, val] of Object.entries(settings)) {
      run(
        `INSERT INTO site_settings (key, value, updated_at) 
         VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
        [key, String(val)]
      );
    }

    logAuditAction(user.id, user.email, 'UPDATE_SITE_SETTINGS', 'site_settings', null, { updatedKeys: Object.keys(settings) });

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (err: any) {
    console.error('Update settings error:', err);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
