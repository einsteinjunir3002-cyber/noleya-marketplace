import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, CheckCircle, ShieldCheck, ArrowRight, 
  MessageCircle, Heart, Users, Sparkles, TrendingUp, HelpCircle 
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell With Us | Noléya Marketplace Ghana',
  description: 'Join Noléya Marketplace to showcase your products to Ghanaian shoppers while supporting Noléya Foundation community programs.',
};

export default function SellWithUsPage() {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #C2410C 0%, #9A3412 100%)',
        color: '#FFFFFF',
        padding: '70px 0 80px',
        textAlign: 'center',
        position: 'relative',
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
            marginBottom: '20px',
          }}>
            Merchant Partnership Program
          </span>

          <h1 style={{
            color: '#FFFFFF',
            fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
            fontFamily: 'serif',
            marginBottom: '18px',
          }}>
            Sell With Us
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '32px',
          }}>
            Do you have a business or product you&apos;d like more people to discover?
            Join Noléya Marketplace and showcase your products to potential customers while supporting a meaningful cause.
          </p>

          <Link href="/sell/apply" className="btn btn-lg" style={{
            backgroundColor: '#FFFFFF',
            color: '#9A3412',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}>
            BECOME A SELLER <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Why Sell On Noléya */}
      <section className="container" style={{ padding: '70px 20px 50px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <span style={{ color: '#065F46', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Why Partner With Noléya?
          </span>
          <h2 style={{ fontSize: '2.1rem', marginTop: '6px' }}>
            Commerce Rooted in Trust & Purpose
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.98rem', marginTop: '8px' }}>
            Unlike open classifieds plagued by impersonation, Noléya is a curated, verified marketplace that drives genuine buyers to your WhatsApp.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <MessageCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Direct WhatsApp Inquiries</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Customers message your own phone number directly with the product prefilled. You maintain your client relationship and negotiate terms.
            </p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: '#FFF7ED',
              color: '#C2410C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Verified Merchant Stamp</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Every seller is vetted. Shoppers purchase with higher confidence knowing products are authentic and backed by Noléya Foundation.
            </p>
          </div>

          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Heart size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Support Meaningful Impact</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
              A 5% contribution on confirmed sales directly funds education, shoes, tutoring, and food drives for vulnerable Ghanaian children.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-Step) */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '70px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem' }}>How Selling Works</h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '6px' }}>
              Four simple steps from application to earning and making an impact.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#065F46',
                color: '#FFFFFF',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                1
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Submit Your Application</h4>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Fill out our brief online seller form with your business name, WhatsApp contact, location, and sample product details.
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#C2410C',
                color: '#FFFFFF',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                2
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Account Review & Vetting</h4>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Our administration team reviews your application to ensure authenticity and quality. Upon approval, you receive access to your Seller Hub.
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                3
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>List Products in the Catalogue</h4>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Upload clear product photos, specify your prices in Ghanaian Cedis (GH₵), describe specifications, and publish your listings.
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                4
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Receive Orders & Fulfill with Pride</h4>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Customers connect with you via WhatsApp. Fulfill doorstep delivery across Ghana and settle your agreed 5% contribution to empower the community.
                </p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link href="/sell/apply" className="btn btn-lg btn-secondary">
              Apply Now as a Seller <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
