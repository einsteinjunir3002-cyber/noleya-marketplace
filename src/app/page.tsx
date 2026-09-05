import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, ArrowRight, Heart, ShieldCheck, Truck, 
  MessageCircle, Sparkles, CheckCircle, Phone, ArrowUpRight 
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, getCategories, getSiteSettings, getImpactInitiatives } from '@/lib/services';

export const revalidate = 60; // Refresh cache every minute

export default async function HomePage() {
  const featuredProducts = getFeaturedProducts(8);
  const categories = getCategories();
  const settings = getSiteSettings();
  const impactInitiatives = getImpactInitiatives();

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. HERO SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #065F46 0%, #044E39 60%, #022C22 100%)',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        padding: '70px 0 90px',
      }}>
        {/* Decorative background accents */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.18) 0%, rgba(217, 119, 6, 0) 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(194, 65, 12, 0.15) 0%, rgba(194, 65, 12, 0) 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            maxWidth: '820px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            {/* Foundation Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#FEF3C7',
              marginBottom: '24px',
              backdropFilter: 'blur(8px)',
            }}>
              <Heart size={15} style={{ color: '#F59E0B' }} />
              <span>NOLÉYA FOUNDATION &bull; Spreading joy. Restoring hope.</span>
            </div>

            {/* Title */}
            <h1 style={{
              color: '#FFFFFF',
              fontFamily: 'serif',
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 900,
              marginBottom: '14px',
              letterSpacing: '-0.02em',
            }}>
              NOLÉYA MARKETPLACE
            </h1>

            <p style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              fontWeight: 700,
              color: '#FBBF24',
              marginBottom: '18px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {settings.marketplace_tagline || 'Shop with purpose.'}
            </p>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.65,
              maxWidth: '680px',
              margin: '0 auto 36px',
            }}>
              {settings.hero_subtitle || 
                'Discover products from local businesses and independent sellers while supporting meaningful community initiatives through Noléya Foundation.'}
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <Link href="/shop" className="btn btn-lg btn-accent" style={{ fontWeight: 700 }}>
                <ShoppingBag size={20} /> SHOP NOW
              </Link>
              <Link href="/sell" className="btn btn-lg btn-outline" style={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(4px)',
              }}>
                SELL WITH US <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '20px 0',
      }}>
        <div className="container trust-strip-grid">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={26} style={{ color: '#065F46', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>100% Genuine Items</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Verified real physical inventory</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageCircle size={26} style={{ color: '#25D366', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>WhatsApp Ordering</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Instant direct chat with verified sellers</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={26} style={{ color: '#C2410C', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>Nationwide Delivery</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Accra dispatch & 16 regions courier</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart size={26} style={{ color: '#D97706', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>Foundation Backed</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>5% contribution to community relief</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SHOP BY CATEGORY */}
      <section className="container" style={{ padding: '60px 20px 40px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <span style={{ color: '#065F46', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Explore Collections
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>SHOP BY CATEGORY</h2>
          </div>

          <Link href="/shop" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#065F46',
            fontWeight: 700,
            fontSize: '0.92rem',
          }}>
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="card card-interactive"
              style={{
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                backgroundColor: '#F0FDF4',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShoppingBag size={24} />
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.96rem' }}>
                  {cat.name}
                </div>
                {cat.product_count !== undefined && cat.product_count > 0 && (
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                    {cat.product_count} {cat.product_count === 1 ? 'Product' : 'Products'}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (Database Driven) */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '60px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <span style={{ color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Handpicked Authentic Inventory
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>FEATURED PRODUCTS</h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '4px' }}>
                Real photographs, verified prices in Ghanaian Cedis (GH₵), and direct WhatsApp checkout.
              </p>
            </div>

            <Link href="/shop" className="btn btn-outline-primary">
              Browse Entire Catalogue <ArrowRight size={16} />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="home-featured-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="card empty-state">
              <div className="empty-state-icon"><ShoppingBag size={32} /></div>
              <h3 className="empty-state-title">No Featured Products Listed</h3>
              <p className="empty-state-text">Check back soon as our verified sellers add new items to the catalogue.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. SHOP WITH PURPOSE (Foundation Connection) */}
      <section className="container" style={{ padding: '80px 20px 60px' }}>
        <div style={{
          backgroundColor: '#065F46',
          borderRadius: '24px',
          color: '#FFFFFF',
          padding: 'clamp(32px, 5vw, 64px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner Glow Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(217,119,6,0.2) 0%, rgba(217,119,6,0) 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '820px', position: 'relative', zIndex: 2 }}>
            <span style={{
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
            }}>
              THE NOLÉYA PROMISE
            </span>

            <h2 style={{
              color: '#FFFFFF',
              fontFamily: 'serif',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              marginTop: '16px',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}>
              SHOP WITH PURPOSE
            </h2>

            <p style={{
              fontSize: '1.08rem',
              color: 'rgba(255, 255, 255, 0.92)',
              lineHeight: 1.7,
              marginBottom: '28px',
            }}>
              {settings.foundation_relationship_text ||
                'Noléya Marketplace creates an opportunity for businesses and entrepreneurs to showcase their products while contributing to the work of Noléya Foundation. Every purchase empowers a local seller while helping fund community outreach, education, and healthcare support for vulnerable Ghanaians.'}
            </p>

            {/* Impact Metric Cards (Database-driven) */}
            {impactInitiatives.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '36px',
              }}>
                {impactInitiatives.map((item) => (
                  <div key={item.id} style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '18px',
                    backdropFilter: 'blur(6px)',
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24', marginBottom: '4px' }}>
                      {item.metric_value}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0' }}>
                      {item.initiative_name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link href="/impact" className="btn btn-accent" style={{ fontWeight: 700 }}>
                Explore All Impact Initiatives <ArrowRight size={16} />
              </Link>
              <Link href="/about" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}>
                About Noléya Foundation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SELL WITH US RECRUITMENT CALLOUT */}
      <section className="container" style={{ padding: '0 20px 40px' }}>
        <div className="card" style={{
          padding: 'clamp(28px, 4vw, 48px)',
          backgroundColor: '#FFF7ED',
          border: '1px solid #FFEDD5',
          borderRadius: '20px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}>
            <div>
              <span className="badge badge-secondary" style={{ marginBottom: '12px' }}>
                FOR GHANAIAN ENTERPRISES & CREATORS
              </span>
              <h2 style={{ fontSize: '1.9rem', color: '#0F172A', marginBottom: '14px' }}>
                Do You Have a Business or Product to Showcase?
              </h2>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Join Noléya Marketplace and showcase your products to potential customers across Accra and all 16 Ghanaian regions while supporting a meaningful cause. Enjoy verified merchant status, direct WhatsApp ordering, and zero monthly listing fees.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/sell/apply" className="btn btn-secondary">
                  BECOME A SELLER <ArrowRight size={16} />
                </Link>
                <Link href="/sell" className="btn btn-outline">
                  Learn How Selling Works
                </Link>
              </div>
            </div>

            {/* Benefit Checklist */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #FED7AA',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={20} style={{ color: '#15803D', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Direct WhatsApp Customer Leads:</strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Customers message your own business WhatsApp number directly.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={20} style={{ color: '#15803D', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Verified Merchant Badge:</strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Build instant customer trust under the respected Noléya Foundation brand.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle size={20} style={{ color: '#15803D', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Transparent 5% Cause Contribution:</strong>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Only settle agreed charitable contribution upon confirmed successful sales.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. OFFICIAL CUSTOMER REACH OUT CONTACTS */}
      <section className="container" style={{ padding: '0 20px 20px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Have Questions or Need Assistance with an Order?
            </div>
            <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
              Our dedicated Accra support team is available Monday to Saturday to assist you.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href="https://wa.me/233545811197?text=Hello%20Noleya%20Marketplace%20Support" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-whatsapp"
            >
              <MessageCircle size={18} /> Chat: 0545811197
            </a>
            <a 
              href="tel:0204822847" 
              className="btn btn-outline"
            >
              <Phone size={18} /> Call: 0204822847
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
