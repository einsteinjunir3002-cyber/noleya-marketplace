import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { saveUploadedImage } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN' && user.role !== 'SELLER')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await saveUploadedImage(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: result.imageUrl,
      imageUrl: result.imageUrl,
      thumbnailUrl: result.thumbnailUrl,
      filename: result.filename,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message || 'Image upload failed.' }, { status: 500 });
  }
}
