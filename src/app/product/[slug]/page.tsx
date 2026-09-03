import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailView from '@/components/ProductDetailView';
import { getProductBySlug, getRelatedProducts, formatGHS } from '@/lib/services';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {
      title: 'Product Not Found | Noléya Marketplace',
    };
  }

  const title = `${product.name} | Noléya Marketplace Ghana`;
  const description = `${product.description.slice(0, 155)}... Price: ${formatGHS(product.price_ghs)}. Order directly via WhatsApp.`;
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const imageUrl = product.primary_image ? `${siteUrl}${product.primary_image}` : `${siteUrl}/placeholder.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/product/${slug}`,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.category_id, product.id, 4);
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

  // Schema.org Product structured data
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.primary_image ? `${siteUrl}${product.primary_image}` : undefined,
    description: product.description,
    sku: product.sku || `NL-${product.id}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: product.price_ghs,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.seller_name || 'Noléya Marketplace Verified Merchant',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        siteUrl={siteUrl}
      />
    </>
  );
}
