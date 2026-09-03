import { NextResponse } from 'next/server';
import { run, query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      sellerId,
      customerName,
      customerPhone,
      customerEmail,
      customerRegion,
      message,
      source,
    } = body;

    const res = run(
      `INSERT INTO order_enquiries
        (product_id, seller_id, customer_name, customer_phone, customer_email, customer_region, message, source, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'lead_initiated', datetime('now'), datetime('now'))`,
      [
        productId || null,
        sellerId || null,
        customerName || 'Inquirer',
        customerPhone || 'Unknown',
        customerEmail || null,
        customerRegion || null,
        message || null,
        source || 'whatsapp_click',
      ]
    );

    return NextResponse.json({ success: true, inquiryId: Number(res.lastInsertRowid) });
  } catch (err: any) {
    console.error('Inquiry error:', err);
    return NextResponse.json({ error: 'Failed to record inquiry.' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN' && user.role !== 'SELLER')) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let sql = `
    SELECT oe.*, p.name as product_name, s.business_name as seller_name
    FROM order_enquiries oe
    LEFT JOIN products p ON oe.product_id = p.id
    LEFT JOIN sellers s ON oe.seller_id = s.id
  `;

  if (user.role === 'SELLER') {
    sql += ` WHERE oe.seller_id = (SELECT id FROM sellers WHERE user_id = ${user.id})`;
  }

  sql += ' ORDER BY oe.id DESC LIMIT 100';

  const inquiries = query(sql);
  return NextResponse.json({ inquiries });
}
