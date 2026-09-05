import React from 'react';
import Link from 'next/link';
import { Heart, BookOpen, Smile, ShieldCheck, Users, ArrowRight, Phone } from 'lucide-react';
import { getImpactInitiatives, getSiteSettings } from '@/lib/services';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Impact | Noléya Foundation & Marketplace',
  description: 'Learn how every purchase on Noléya Marketplace helps fund educational kits, tutoring, footwear, and food assistance for vulnerable Ghanaian communities.',
};

export default function ImpactPage() {
  const initiatives = getImpactInitiatives();
  const settings = getSiteSettings();

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #065F46 0%, #044E39 100%)',
        color: '#FFFFFF',
        padding: '70px 0 80px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#FEF3C7',
            marginBottom: '20px',
            letterSpacing: '0.04em',
          }}>
            <Heart size={16} style={{ color: '#F59E0B' }} />
            NOLÉYA FOUNDATION &bull; SPREADING JOY. RESTORING HOPE.
          </div>

          <h1 style={{
            color: '#FFFFFF',
            fontSize: 'clamp(2.3rem, 4.5vw, 3.4rem)',
            fontFamily: 'serif',
            marginBottom: '18px',
          }}>
            Shop With Purpose
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: 'rgba(255, 255, 255, 0.92)',
            lineHeight: 1.65,
            maxWidth: '720px',
            margin: '0 auto 28px',
          }}>
            {settings.foundation_relationship_text ||
              'Noléya Marketplace creates an opportunity for businesses and entrepreneurs to showcase their products while contributing to the work of Noléya Foundation. Every purchase empowers a local seller while helping fund community outreach, education, and healthcare support for vulnerable Ghanaians.'}
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-lg btn-accent" style={{ fontWeight: 700 }}>
              Shop To Support Initiatives <ArrowRight size={18} />
            </Link>
            <Link href="/about" className="btn btn-lg btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.35)' }}>
              About The Foundation
            </Link>
          </div>
        </div>
      </section>

      {/* The Cycle of Impact */}
      <section className="container" style={{ padding: '60px 20px 40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <span style={{ color: '#C2410C', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sustainable Local Philanthropy
          </span>
          <h2 style={{ fontSize: '2rem', marginTop: '6px' }}>How Your Shopping Creates Hope</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '6px' }}>
            We don&apos;t ask for handouts. We build an ethical Ghanaian commerce engine where everyday shopping builds community equity.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '20px',
        }}>
          <div className="card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>1. Local Merchants Flourish</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Independent sellers and artisans gain exposure to thousands of shoppers across Greater Accra and all 16 regions without paying predatory listing fees.
            </p>
          </div>

          <div className="card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#FFF7ED',
              color: '#C2410C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Heart size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>2. 5% Cause Contribution</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              On every confirmed completed purchase, the seller contributes an agreed 5% commission into the verified Noléya Foundation community relief pool.
            </p>
          </div>

          <div className="card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>3. Real Grassroots Delivery</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              The Foundation turns these funds directly into school shoes, after-school tutoring sessions, emergency nutrition, and medical tonics for vulnerable children.
            </p>
          </div>
        </div>
      </section>

      {/* Database-Driven Initiatives */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '60px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ color: '#065F46', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Verified Action
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '6px' }}>Current Supported Initiatives</h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '6px' }}>
              All metrics below reflect real, verified programs recorded directly by the Noléya Foundation executive team.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {initiatives.map((item, index) => (
              <div
                key={item.id}
                className={`card impact-card ${index % 2 === 0 ? 'layout-image-left' : 'layout-image-right'}`}
              >
                {/* Image */}
                <div className="impact-card-image">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.initiative_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#065F46', color: '#FFFFFF' }}>
                      <Heart size={48} />
                    </div>
                  )}

                  {item.metric_value && (
                    <div style={{
                      position: 'absolute',
                      bottom: '14px',
                      left: '14px',
                      backgroundColor: 'rgba(15, 23, 42, 0.88)',
                      backdropFilter: 'blur(6px)',
                      color: '#FBBF24',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                    }}>
                      {item.metric_value}
                      <div style={{ fontSize: '0.72rem', color: '#E2E8F0', fontWeight: 500 }}>
                        {item.metric_label || 'Impact Metric'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="impact-card-content">
                  <span className="badge badge-primary" style={{ marginBottom: '10px', alignSelf: 'flex-start' }}>
                    Foundation Initiative #{index + 1}
                  </span>
                  <h3 className="impact-card-title" style={{ fontSize: '1.6rem', color: '#0F172A', marginBottom: '14px' }}>
                    {item.initiative_name}
                  </h3>
                  <p className="impact-card-desc" style={{ color: '#334155', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '16px' }}>
                    {item.description}
                  </p>
                  <p className="impact-card-summary" style={{ color: '#64748B', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner / Donate / Reach Out CTA */}
      <section className="container" style={{ padding: '60px 20px 0' }}>
        <div style={{
          backgroundColor: '#FFF7ED',
          border: '1px solid #FFEDD5',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '780px',
          margin: '0 auto',
        }}>
          <h3 style={{ fontSize: '1.6rem', color: '#9A3412', marginBottom: '10px' }}>
            Want to Partner Directly with Noléya Foundation?
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            Whether you represent a corporate donor, school board, healthcare clinic, or volunteer organization, we welcome collaboration across Ghana.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href="https://wa.me/233545811197" className="btn btn-whatsapp">
              <Phone size={16} /> WhatsApp Foundation Team (0545811197)
            </a>
            <Link href="/contact" className="btn btn-outline">
              Send Official Inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
