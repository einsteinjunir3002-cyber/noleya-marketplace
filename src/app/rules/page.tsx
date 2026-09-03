import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CheckCircle, Scale, Phone } from 'lucide-react';
import { getSiteSettings } from '@/lib/services';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace Rules & Seller Standards | Noléya Marketplace Ghana',
  description: 'Learn about Noléya Marketplace seller terms, authenticity pledges, and community standards for Ghanaian commerce.',
};

export default function RulesPage() {
  const settings = getSiteSettings();
  const rawRules = settings.seller_rules_text || '';

  const defaultRulesList = [
    {
      title: '1. Authenticity & Genuine Inventory',
      desc: 'All products listed must be authentic, genuine, and in the physical possession of the seller. Counterfeit, replica, expired, or stolen goods are strictly prohibited and result in permanent blacklist and reporting to Ghanaian authorities.'
    },
    {
      title: '2. Accurate Pricing & Transparency',
      desc: 'All prices must be stated honestly in Ghanaian Cedis (GH₵). Sellers may not artificially inflate prices when contacted on WhatsApp, nor demand unannounced additional fees other than standard courier delivery charges.'
    },
    {
      title: '3. Order Fulfillment & Reliability',
      desc: 'Sellers are fully responsible for packaging, dispatching, and fulfilling confirmed orders promptly. Dispatch timeframes communicated to the customer (e.g., same day in Accra, 24-48h nationwide) must be honored.'
    },
    {
      title: '4. Verified Contact Information',
      desc: 'Sellers must maintain active, responsive Ghanaian phone numbers and WhatsApp lines. Failure to respond to customer inquiries or abandonment of order leads will result in merchant suspension.'
    },
    {
      title: '5. Prohibited Items',
      desc: 'Strictly forbidden: unapproved pharmaceuticals, illicit substances, dangerous weapons, adult content, fraudulent get-rich-quick schemes, or products lacking standard regulatory safety clearances.'
    },
    {
      title: '6. Content Moderation & Removal',
      desc: 'Noléya Marketplace reserves the absolute right to unpublish, edit, or reject any listing that is misleading, offensive, blurry, inaccurately described, or inconsistent with Noléya Foundation community values.'
    },
    {
      title: '7. Cause Contribution Commitment',
      desc: 'Approved sellers agree to honor the 5% charitable contribution on confirmed completed marketplace sales. This contribution supports Noléya Foundation community outreach drives for vulnerable children across Ghana.'
    }
  ];

  return (
    <div className="container container-sm" style={{ padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '10px' }}>
          STANDARDS OF INTEGRITY
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', color: '#0F172A' }}>
          Marketplace Rules & Seller Terms
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '8px', maxWidth: '620px', margin: '8px auto 0' }}>
          These guidelines ensure that every Ghanaian shopper can buy with total confidence and every honest merchant can grow with pride.
        </p>
      </div>

      <div className="card" style={{ padding: '36px', marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
          <Scale size={28} style={{ color: '#065F46' }} />
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Core Merchant Obligations</h2>
            <div style={{ fontSize: '0.84rem', color: '#64748B' }}>Effective across all 16 regions of Ghana</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {defaultRulesList.map((r, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                {idx + 1}
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#0F172A', marginBottom: '4px' }}>{r.title}</h3>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {rawRules && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
          }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '8px', color: '#0F172A' }}>
              Additional Administrative Notice:
            </h4>
            <div style={{ fontSize: '0.88rem', color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {rawRules}
            </div>
          </div>
        )}
      </div>

      {/* Enforcement & Reporting */}
      <div className="card" style={{ padding: '28px', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <AlertTriangle size={26} style={{ color: '#C2410C', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#9A3412', marginBottom: '6px' }}>
              Reporting Violations or Misleading Listings
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '14px' }}>
              If a seller demands unfair pricing, misrepresents an item, or fails to fulfill an order, please report the incident immediately to Noléya Foundation compliance.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="https://wa.me/233545811197?text=Reporting%20Marketplace%20Listing%20Issue" className="btn btn-sm btn-whatsapp">
                <Phone size={14} /> Report via WhatsApp (0545811197)
              </a>
              <Link href="/contact" className="btn btn-sm btn-outline">
                Contact Management
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
