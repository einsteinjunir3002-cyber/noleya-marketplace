import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      borderTop: '4px solid #065F46',
      marginTop: 'auto',
    }}>
      {/* Purpose Banner */}
      <div style={{
        backgroundColor: '#1E293B',
        padding: '36px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 95, 70, 0.3)',
              color: '#34D399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Heart size={24} />
            </div>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '2px' }}>Shopping with Purpose</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Every purchase contributes to Noléya Foundation community education, health, and relief drives.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(194, 65, 12, 0.3)',
              color: '#FB923C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '2px' }}>Verified Ghanaian Sellers</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Authentic real-stock products with genuine photos and direct WhatsApp merchant communication.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(217, 119, 6, 0.3)',
              color: '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '2px' }}>Nationwide Ghana Delivery</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                Doorstep dispatch in Greater Accra and trusted courier delivery across all 16 regions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={{ padding: '56px 20px 36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}>
          {/* Brand & Mission */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{
                fontFamily: 'serif',
                fontWeight: 900,
                fontSize: '1.5rem',
                color: '#34D399',
              }}>
                NOLÉYA
              </span>
              <span style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#FB923C',
              }}>
                MARKETPLACE
              </span>
            </div>
            <p style={{ color: '#FEF3C7', fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>
              Shop with purpose.
            </p>
            <p style={{ color: '#94A3B8', fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '16px' }}>
              Noléya Marketplace is the commercial & fundraising arm of <strong>Noléya Foundation</strong> (&ldquo;Spreading joy. Restoring hope.&rdquo;), enabling verified Ghanaian enterprises to sell genuine goods while uplifting vulnerable communities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '18px' }}>
              Marketplace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link href="/shop" style={{ color: '#CBD5E1' }}>Browse Products</Link></li>
              <li><Link href="/shop?category=health-wellness" style={{ color: '#CBD5E1' }}>Health & Wellness</Link></li>
              <li><Link href="/shop?category=bags" style={{ color: '#CBD5E1' }}>POMBELL Luxury Bags</Link></li>
              <li><Link href="/shop?category=beauty" style={{ color: '#CBD5E1' }}>Beauty & Personal Care</Link></li>
              <li><Link href="/sell" style={{ color: '#CBD5E1' }}>Sell With Us</Link></li>
              <li><Link href="/sell/apply" style={{ color: '#CBD5E1' }}>Seller Application</Link></li>
            </ul>
          </div>

          {/* Foundation & Rules */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '18px' }}>
              Foundation & Trust
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link href="/impact" style={{ color: '#CBD5E1' }}>Our Foundation Impact</Link></li>
              <li><Link href="/about" style={{ color: '#CBD5E1' }}>About Noléya Foundation</Link></li>
              <li><Link href="/rules" style={{ color: '#CBD5E1' }}>Marketplace Rules & Terms</Link></li>
              <li><Link href="/contact" style={{ color: '#CBD5E1' }}>Customer Support</Link></li>
              <li><Link href="/auth/login" style={{ color: '#94A3B8', fontSize: '0.82rem' }}>Staff & Seller Portal</Link></li>
            </ul>
          </div>

          {/* Customer Reach Out Contacts */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '18px' }}>
              Direct Reach-Out
            </h4>
            <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '14px' }}>
              For customer assistance, seller inquiries, or Foundation partnerships, contact our Accra team:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <a 
                href="https://wa.me/233545811197" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 600 }}
              >
                <Phone size={16} /> 0545811197 (WhatsApp / Call)
              </a>
              <a 
                href="https://wa.me/233204822847" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 600 }}
              >
                <Phone size={16} /> 0204822847 (WhatsApp / Call)
              </a>
              <a href="mailto:Noléyafoundation@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}>
                <Mail size={16} /> Noléyafoundation@gmail.com
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#CBD5E1', fontSize: '0.85rem' }}>
                <MapPin size={16} /> Accra, Greater Accra, Ghana
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Ghana Regions */}
        <div style={{
          paddingTop: '28px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.8rem',
          color: '#64748B',
        }}>
          <div>
            &copy; {new Date().getFullYear()} <strong>Noléya Marketplace</strong>. Connected to <strong>Noléya Foundation</strong>. All rights reserved.
          </div>
          <div>
            Serving Greater Accra, Ashanti, Central, Eastern, Western, Volta, Northern & all 16 Regions of Ghana.
          </div>
        </div>
      </div>
    </footer>
  );
}
