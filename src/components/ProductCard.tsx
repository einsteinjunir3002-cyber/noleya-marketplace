'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, MessageCircle, MapPin, CheckCircle, Eye } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatGHS, buildWhatsAppUrl } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImg = product.thumbnail_image || product.primary_image || '/placeholder.png';
  const whatsappUrl = buildWhatsAppUrl(
    product.seller_whatsapp || '0545811197',
    product.name,
    product.price_ghs
  );

  const discountPercent = product.compare_price_ghs && product.compare_price_ghs > product.price_ghs
    ? Math.round(((product.compare_price_ghs - product.price_ghs) / product.compare_price_ghs) * 100)
    : null;

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    // Log enquiry lead silently to backend
    try {
      fetch('/api/orders/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          sellerId: product.seller_id,
          customerName: 'WhatsApp Visitor',
          customerPhone: 'Inquiry via WhatsApp button',
          source: 'whatsapp_click',
        }),
      }).catch(() => {});
    } catch {}
  };

  return (
    <div className="card card-interactive" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      backgroundColor: '#FFFFFF',
    }}>
      {/* Badges Top Left & Right */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        {product.is_featured ? (
          <span className="badge badge-accent" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            FEATURED
          </span>
        ) : <span />}

        {product.category_name && (
          <span className="badge badge-subtle" style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}>
            {product.category_name}
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/product/${product.slug}`} style={{
        position: 'relative',
        width: '100%',
        paddingTop: '95%',
        backgroundColor: '#F8FAFC',
        overflow: 'hidden',
        display: 'block',
      }}>
        <img
          src={primaryImg}
          alt={product.name}
          loading="lazy"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          className="product-card-img"
        />
      </Link>

      {/* Card Content */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
      }}>
        {/* Seller & Region Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#64748B',
          marginBottom: '6px',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
            <CheckCircle size={12} style={{ color: '#065F46' }} /> {product.seller_name || 'Verified Seller'}
          </span>
          {product.seller_region && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#94A3B8' }}>
              <MapPin size={11} /> {product.seller_region.replace(' Region', '')}
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 style={{
          fontSize: '0.98rem',
          fontWeight: 700,
          color: '#0F172A',
          marginBottom: '8px',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.7em',
        }}>
          <Link href={`/product/${product.slug}`} style={{ color: 'inherit' }}>
            {product.name}
          </Link>
        </h3>

        {/* Price / Inquiry Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          marginTop: 'auto',
        }}>
          {product.price_ghs && Number(product.price_ghs) > 0 ? (
            <span style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#065F46',
              letterSpacing: '-0.01em',
            }}>
              {formatGHS(product.price_ghs)}
            </span>
          ) : (
            <span style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#065F46',
              backgroundColor: '#ECFDF5',
              padding: '5px 12px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #A7F3D0',
            }}>
              <MessageCircle size={14} style={{ color: '#059669' }} /> Price on Request
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '8px',
        }}>
          <Link
            href={`/product/${product.slug}`}
            className="btn btn-sm btn-outline-primary"
            style={{ width: '100%' }}
          >
            <Eye size={14} /> View Details
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="btn btn-sm btn-whatsapp"
            title="Order directly with Seller on WhatsApp"
            style={{ padding: '6px 12px' }}
          >
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
