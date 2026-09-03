import React from 'react';
import Link from 'next/link';
import { Heart, Target, Sparkles, ShieldCheck, ArrowRight, Phone } from 'lucide-react';
import { getSiteSettings } from '@/lib/services';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Noléya Foundation & Marketplace Ghana',
  description: 'Learn about Noléya Foundation (Spreading joy. Restoring hope.) and the purpose-driven vision of Noléya Marketplace.',
};

export default function AboutPage() {
  const settings = getSiteSettings();

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <section style={{
        background: 'linear-gradient(135deg, #065F46 0%, #044E39 100%)',
        color: '#FFFFFF',
        padding: '70px 0 80px',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{
            backgroundColor: 'rgba(255,255,255,0.18)',
            padding: '5px 14px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '16px',
            color: '#FEF3C7',
          }}>
            OUR MISSION & VISION
          </span>

          <h1 style={{
            color: '#FFFFFF',
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontFamily: 'serif',
            marginBottom: '16px',
          }}>
            About Noléya Foundation
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
            color: '#FBBF24',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '20px',
          }}>
            Spreading joy. Restoring hope.
          </p>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.92)',
            lineHeight: 1.7,
            maxWidth: '680px',
            margin: '0 auto',
          }}>
            Noléya Foundation is committed to spreading joy, restoring hope and supporting vulnerable individuals and communities across Ghana.
          </p>
        </div>
      </section>

      {/* The Story & Architecture */}
      <section className="container" style={{ padding: '70px 20px 40px', maxWidth: '860px' }}>
        <div className="card" style={{ padding: '40px', marginBottom: '40px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            ORGANIZATIONAL STRUCTURE
          </span>
          <h2 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '16px' }}>
            The Relationship: Foundation & Marketplace
          </h2>

          <div style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            fontSize: '1.02rem',
            color: '#166534',
            fontWeight: 600,
            textAlign: 'center',
          }}>
            NOLÉYA FOUNDATION &rarr; NOLÉYA MARKETPLACE
          </div>

          <p style={{ color: '#334155', fontSize: '1.02rem', lineHeight: 1.75, marginBottom: '20px' }}>
            {settings.foundation_relationship_text ||
              'Noléya Marketplace creates an opportunity for businesses and entrepreneurs to showcase their products while contributing to the work of Noléya Foundation. Every purchase empowers a local seller while helping fund community outreach, education, and healthcare support for vulnerable Ghanaians.'}
          </p>

          <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Rather than relying solely on traditional grant cycles or sporadic donation appeals, Noléya Marketplace establishes a continuous, dignity-driven commercial bridge. When you buy luxury POMBELL bags, essential wellness supplements, or Ghanaian goods, you stimulate the livelihood of verified merchants and simultaneously fuel educational, clothing, and nutritional relief drives.
          </p>
        </div>

        {/* Core Pillars */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}>
          <div className="card" style={{ padding: '28px' }}>
            <Target size={30} style={{ color: '#065F46', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Dignity & Enterprise</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              We empower Ghanaian creators, importers, and shopkeepers to thrive through fair visibility and direct WhatsApp order channels.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <Heart size={30} style={{ color: '#C2410C', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Compassion & Action</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Every cedi contributed is deployed into documented, verifiable programs: children&apos;s literacy tutoring, school shoes, and family nutrition.
            </p>
          </div>

          <div className="card" style={{ padding: '28px' }}>
            <ShieldCheck size={30} style={{ color: '#D97706', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Total Transparency</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              No fabricated statistics or exaggerated claims. All metrics in our impact dashboard reflect verified local field activity.
            </p>
          </div>
        </div>

        {/* Contact Banner */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: '20px',
          padding: '36px',
          textAlign: 'center',
        }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.5rem', marginBottom: '10px' }}>
            Speak Directly with Our Executive Team
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginBottom: '24px' }}>
            We welcome inquiries from partners, prospective sellers, and community volunteers across Ghana.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href="tel:0545811197" className="btn btn-primary">
              <Phone size={16} /> 0545811197 (Call)
            </a>
            <a href="tel:0204822847" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}>
              <Phone size={16} /> 0204822847 (Call)
            </a>
            <Link href="/contact" className="btn btn-accent">
              Contact Form &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
