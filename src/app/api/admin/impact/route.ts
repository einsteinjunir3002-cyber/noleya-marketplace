import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run, query } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function GET() {
  const initiatives = query('SELECT * FROM foundation_impact ORDER BY display_order ASC');
  return NextResponse.json({ initiatives });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { initiativeName, summary, description, metricLabel, metricValue, imageUrl, displayOrder } = body;

    if (!initiativeName || !description) {
      return NextResponse.json({ error: 'Initiative name and description are required.' }, { status: 400 });
    }

    const slug = initiativeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const res = run(
      `INSERT INTO foundation_impact (initiative_name, slug, summary, description, metric_label, metric_value, image_url, status, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, datetime('now'), datetime('now'))`,
      [initiativeName, slug, summary || '', description, metricLabel || null, metricValue || null, imageUrl || null, displayOrder || 0]
    );

    logAuditAction(user.id, user.email, 'CREATE_IMPACT_INITIATIVE', 'foundation_impact', Number(res.lastInsertRowid));

    return NextResponse.json({ success: true, id: Number(res.lastInsertRowid) });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create impact initiative.' }, { status: 500 });
  }
}
