import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: {
    template: '%s | Noléya Marketplace',
    default: 'Noléya Marketplace | Shop with purpose. Ghanaian E-Commerce & Foundation Platform',
  },
  description:
    'Discover genuine products from local Ghanaian businesses and independent sellers while directly supporting community initiatives through Noléya Foundation. Spreading joy. Restoring hope.',
  keywords: [
    'Ghana marketplace',
    'Accra online store',
    'Noléya Foundation',
    'Ghanaian products',
    'POMBELL bags Ghana',
    'Kirkland Minoxidil Ghana',
    'Hollywood Nutritions Ghana',
    'Shop with purpose',
  ],
  authors: [{ name: 'Noléya Foundation' }],
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: '/',
    siteName: 'Noléya Marketplace',
    title: 'Noléya Marketplace | Shop with purpose.',
    description: 'Discover local Ghanaian products and support vulnerable communities with Noléya Foundation.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#065F46" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <Header user={user} />
        <main style={{ flex: '1', minHeight: 'calc(100vh - 180px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
