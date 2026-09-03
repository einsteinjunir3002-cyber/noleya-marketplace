import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /seller
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
