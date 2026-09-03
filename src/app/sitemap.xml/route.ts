import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  const products = query<{ slug: string; updated_at: string }>(
    "SELECT slug, updated_at FROM products WHERE status = 'published'"
  );

  const categories = query<{ slug: string }>(
    'SELECT slug FROM categories WHERE is_active = 1'
  );

  const staticPages = [
    '',
    '/shop',
    '/impact',
    '/sell',
    '/sell/apply',
    '/rules',
    '/about',
    '/contact',
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Static pages
  for (const page of staticPages) {
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}${page}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += '  </url>\n';
  }

  // Categories
  for (const cat of categories) {
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}/shop?category=${cat.slug}</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  }

  // Products
  for (const prod of products) {
    xml += '  <url>\n';
    xml += `    <loc>${siteUrl}/product/${prod.slug}</loc>\n`;
    xml += `    <lastmod>${new Date(prod.updated_at).toISOString()}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
