import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'products');
const THUMB_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'products', 'thumbs');

export function ensureUploadDirs(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(THUMB_DIR)) {
    fs.mkdirSync(THUMB_DIR, { recursive: true });
  }
}

export interface SaveImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  filename: string;
}

/**
 * Validates, optimizes, and stores an uploaded image file buffer.
 */
export async function saveUploadedImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<SaveImageResult> {
  ensureUploadDirs();

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(mimeType.toLowerCase())) {
    throw new Error('Unsupported image format. Allowed formats are JPEG, PNG, and WebP.');
  }

  // Generate safe sanitized filename
  const hash = crypto.randomBytes(8).toString('hex');
  const baseName = path.parse(originalFilename).name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpeg';
  const filename = `${baseName}_${Date.now()}_${hash}${ext}`;
  const thumbFilename = `thumb_${filename}`;

  const destPath = path.join(UPLOAD_DIR, filename);
  const thumbPath = path.join(THUMB_DIR, thumbFilename);

  // Optimize main image (max width 1600, quality 85)
  await sharp(buffer)
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .toFile(destPath);

  // Generate thumbnail (max width 400, height 400, quality 80)
  await sharp(buffer)
    .resize(400, 400, { fit: 'cover', position: 'center' })
    .toFile(thumbPath);

  return {
    imageUrl: `/uploads/products/${filename}`,
    thumbnailUrl: `/uploads/products/thumbs/${thumbFilename}`,
    filename,
  };
}
