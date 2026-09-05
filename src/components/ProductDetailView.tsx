'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, MessageCircle, MapPin, CheckCircle, ShieldCheck, 
  Truck, ArrowRight, Phone, Send, Info, Share2 
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatGHS, buildWhatsAppUrl, formatGhanaPhone } from '@/lib/utils';
import ProductCard from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  siteUrl: string;
}

export default function ProductDetailView({ product, relatedProducts, siteUrl }: ProductDetailViewProps) {
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ id: 0, product_id: product.id, image_url: product.primary_image || '/placeholder.png', thumbnail_url: null, alt_text: product.name, display_order: 0, is_primary: 1 }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerRegion, setCustomerRegion] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const activeImage = images[activeImageIndex]?.image_url || product.primary_image || '/placeholder.png';
  const productFullUrl = `${siteUrl}/product/${product.slug}`;
  const whatsappUrl = buildWhatsAppUrl(
    product.seller_whatsapp || '0545811197',
    product.name,
    product.price_ghs,
    productFullUrl
  );

  const discountPercent = product.compare_price_ghs && product.compare_price_ghs > product.price_ghs
    ? Math.round(((product.compare_price_ghs - product.price_ghs) / product.compare_price_ghs) * 100)
    : null;

  let specsObj: Record<string, string> = {};
  if (product.specifications) {
    try {
      specsObj = JSON.parse(product.specifications);
    } catch {
      // fallback
    }
  }

  const handleWhatsAppOrder = async () => {
    // Record lead silently to order_enquiries
    try {
      fetch('/api/orders/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          sellerId: product.seller_id,
          customerName: 'WhatsApp Buyer',
          customerPhone: 'Inquiry via WhatsApp button',
          source: 'whatsapp_click',
        }),
      }).catch(() => {});
    } catch {}
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          sellerId: product.seller_id,
          customerName,
          customerPhone,
          customerRegion,
          message: inquiryMessage,
          source: 'form_inquiry',
        }),
      });

      if (res.ok) {
        setInquirySubmitted(true);
      }
    } catch (err) {
      alert('Error submitting inquiry. Please try again or message via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container has-floating-bar" style={{ padding: '24px 16px 80px' }}>
      {/* Breadcrumbs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        color: '#64748B',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <Link href="/" style={{ color: '#065F46' }}>Home</Link>
        <span>/</span>
        <Link href="/shop" style={{ color: '#065F46' }}>Catalogue</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category_slug}`} style={{ color: '#065F46' }}>
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main Grid: Gallery & Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '36px',
        marginBottom: '48px',
      }} className="product-details-grid">
        {/* Left Column: Image Gallery */}
        <div>
          {/* Main Large Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '90%',
            backgroundColor: '#F8FAFC',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            marginBottom: '16px',
          }}>
            <img
              src={activeImage}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#FFFFFF',
              }}
            />
            {discountPercent && (
              <span className="badge badge-secondary" style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                fontSize: '0.85rem',
                padding: '6px 12px',
              }}>
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnail Carousel */}
          {images.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
            }}>
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: activeImageIndex === idx ? '2px solid #065F46' : '1px solid #E2E8F0',
                    flexShrink: 0,
                    padding: '2px',
                    backgroundColor: '#FFFFFF',
                    transition: 'border 0.2s ease',
                  }}
                >
                  <img
                    src={img.thumbnail_url || img.image_url}
                    alt={`${product.name} - view ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div style={{
            marginTop: '24px',
            padding: '16px 20px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <ShieldCheck size={28} style={{ color: '#15803D', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.5 }}>
              <strong>Noléya Foundation Trust Guarantee:</strong> Sourced directly from verified local Ghanaian merchants. 100% genuine products with full customer recourse.
            </div>
          </div>
        </div>

        {/* Right Column: Product Information & Purchase CTAs */}
        <div>
          {/* Category & Region */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <span className="badge badge-primary">
              {product.category_name || 'Marketplace Item'}
            </span>

            {product.seller_region && (
              <span style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> {product.seller_region}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 800,
            lineHeight: 1.25,
            marginBottom: '16px',
            color: '#0F172A',
          }}>
            {product.name}
          </h1>

          {/* Price / Inquiry Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #E2E8F0',
            flexWrap: 'wrap',
          }}>
            {product.price_ghs && Number(product.price_ghs) > 0 ? (
              <span style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#065F46',
              }}>
                {formatGHS(product.price_ghs)}
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#065F46',
                  letterSpacing: '-0.01em',
                }}>
                  Price on Request
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                  &bull; Inquire for pricing & custom options
                </span>
              </div>
            )}

            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
              In Stock & Ready
            </span>
          </div>

          {/* Short Description */}
          <p style={{
            fontSize: '1.02rem',
            color: '#334155',
            lineHeight: 1.7,
            marginBottom: '24px',
          }}>
            {product.description}
          </p>

          {/* Specifications Table (if available) */}
          {Object.keys(specsObj).length > 0 && (
            <div style={{
              marginBottom: '28px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid #E2E8F0',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', marginBottom: '10px' }}>
                Product Specifications:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {Object.entries(specsObj).map(([key, val]) => (
                  <div key={key} style={{ fontSize: '0.84rem' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>{key}: </span>
                    <span style={{ color: '#0F172A' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '28px',
          }}>
            {/* Direct WhatsApp Order CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppOrder}
              className="btn btn-lg btn-whatsapp"
              style={{
                width: '100%',
                fontWeight: 700,
                fontSize: '1.1rem',
                padding: '16px 24px',
              }}
            >
              <MessageCircle size={22} /> INQUIRE & ORDER ON WHATSAPP
            </a>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowInquiryModal(true)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                <Send size={16} /> Request Callback / Inquire
              </button>
              
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Product link copied to clipboard!');
                  }
                }}
                className="btn btn-outline"
                title="Share Product"
                style={{ padding: '10px 16px' }}
              >
                <Share2 size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748B', textAlign: 'center', marginTop: '4px' }}>
              Clicking &ldquo;Order on WhatsApp&rdquo; connects you directly with the verified seller to arrange payment & dispatch.
            </div>
          </div>

          {/* Verified Seller Profile Box */}
          <div className="card" style={{ padding: '20px', backgroundColor: '#FAF9F6', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} style={{ color: '#065F46' }} />
                {product.seller_name || 'Verified Marketplace Seller'}
              </div>
              <span className="badge badge-accent">Verified Merchant</span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '12px', lineHeight: 1.5 }}>
              {product.seller_bio || 'Local Ghanaian merchant committed to genuine products and timely fulfillment.'}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '0.82rem',
              color: '#334155',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '10px',
            }}>
              <div>
                <strong>Location:</strong> {product.seller_city ? `${product.seller_city}, ` : ''}{product.seller_region || 'Accra, Ghana'}
              </div>
              <div>
                <strong>WhatsApp:</strong> {formatGhanaPhone(product.seller_whatsapp || '0545811197')}
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          {product.delivery_info && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginTop: '18px',
              fontSize: '0.85rem',
              color: '#475569',
            }}>
              <Truck size={18} style={{ color: '#C2410C', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Delivery Information: </strong>
                {product.delivery_info}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Order Inquiry / Callback</h3>
              <button onClick={() => setShowInquiryModal(false)} style={{ color: '#94A3B8' }}>&times;</button>
            </div>

            {inquirySubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={48} style={{ color: '#15803D', margin: '0 auto 12px' }} />
                <h4>Inquiry Received!</h4>
                <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '6px' }}>
                  The seller and Noléya support have been notified. You will be contacted shortly via phone or WhatsApp.
                </p>
                <button onClick={() => setShowInquiryModal(false)} className="btn btn-primary" style={{ marginTop: '20px' }}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit}>
                <div style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '16px' }}>
                  Leave your contact details and the seller will reach out with payment & delivery options for <strong>{product.name}</strong>.
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Kwesi Mensah"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0244123456"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Your Delivery City / Region</label>
                  <input
                    type="text"
                    value={customerRegion}
                    onChange={(e) => setCustomerRegion(e.target.value)}
                    placeholder="e.g. Osu, Greater Accra"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Notes or Questions</label>
                  <textarea
                    rows={2}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="e.g. Color preference, delivery timing..."
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '60px', borderTop: '1px solid #E2E8F0', paddingTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>You May Also Like</h2>
            <Link href={`/shop?category=${product.category_slug}`} style={{ color: '#065F46', fontWeight: 600, fontSize: '0.88rem' }}>
              View More &rarr;
            </Link>
          </div>

          <div className="home-featured-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Floating CTA Bar */}
      <div className="mobile-floating-bar">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Price</span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065F46' }}>
            {product.price_ghs && Number(product.price_ghs) > 0 ? formatGHS(product.price_ghs) : 'Price on Request'}
          </span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppOrder}
          className="btn btn-whatsapp"
          style={{
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 700,
            borderRadius: '8px',
            gap: '6px',
          }}
        >
          <MessageCircle size={18} /> Order on WhatsApp
        </a>
      </div>
    </div>
  );
}
