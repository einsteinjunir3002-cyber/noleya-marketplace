import { NextResponse } from 'next/server';
import { run } from '@/lib/db';
import { logAuditAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      businessName,
      whatsappNumber,
      email,
      region,
      categoryName,
      productSamples,
      socialMedia,
      deliveryOptions,
      businessDescription,
    } = body;

    if (!fullName || !businessName || !whatsappNumber || !email) {
      return NextResponse.json(
        { error: 'Full name, business name, WhatsApp number, and email are required.' },
        { status: 400 }
      );
    }

    const res = run(
      `INSERT INTO seller_applications 
        (full_name, business_name, whatsapp_number, email, region, category_name, product_samples, social_media, delivery_options, business_description, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [
        fullName.trim(),
        businessName.trim(),
        whatsappNumber.trim(),
        email.trim().toLowerCase(),
        region || 'Greater Accra',
        categoryName || 'Other',
        productSamples || null,
        socialMedia || null,
        deliveryOptions || null,
        businessDescription || null,
      ]
    );

    const applicationId = Number(res.lastInsertRowid);
    logAuditAction(null, email, 'SELLER_APPLICATION_SUBMITTED', 'seller_applications', applicationId, {
      businessName,
      whatsappNumber,
    });

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Your seller application has been submitted and is pending review.',
    });
  } catch (err: any) {
    console.error('Seller application error:', err);
    return NextResponse.json(
      { error: 'Failed to submit seller application.' },
      { status: 500 }
    );
  }
}
