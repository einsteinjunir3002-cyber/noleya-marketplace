import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LayoutDashboard, ShoppingBag, MessageSquare, User, ExternalLink } from 'lucide-react';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'SELLER' && user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    redirect('/auth/login');
  }

  if (user.must_change_password) {
    redirect('/auth/change-password');
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '85vh', padding: '30px 0 60px' }}>
      <div className="container">
        {/* Seller Navigation Header */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: '24px', backgroundColor: '#FFFFFF' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-secondary">SELLER HUB</span>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Verified Merchant Dashboard</span>
              </div>
              <h1 style={{ fontSize: '1.5rem', color: '#0F172A', marginTop: '4px' }}>
                Welcome, {user.name}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href="/shop" target="_blank" className="btn btn-sm btn-outline">
                <ExternalLink size={14} /> View Public Store
              </Link>
            </div>
          </div>

          {/* Nav Tabs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '20px',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '14px',
            overflowX: 'auto',
          }}>
            <Link
              href="/seller/dashboard"
              className="btn btn-sm btn-outline-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LayoutDashboard size={15} /> Overview
            </Link>

            <Link
              href="/seller/products"
              className="btn btn-sm btn-outline-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ShoppingBag size={15} /> My Products
            </Link>

            <Link
              href="/seller/orders"
              className="btn btn-sm btn-outline-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <MessageSquare size={15} /> Order Inquiries & Leads
            </Link>

            <Link
              href="/seller/profile"
              className="btn btn-sm btn-outline-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <User size={15} /> Business Profile
            </Link>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
