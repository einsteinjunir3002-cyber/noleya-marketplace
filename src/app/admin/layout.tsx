import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { 
  LayoutDashboard, ShoppingBag, Users, FolderTree, 
  MessageSquare, Heart, Settings, Shield, ExternalLink, LogOut 
} from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    redirect('/auth/login');
  }

  if (user.must_change_password) {
    redirect('/auth/change-password');
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '90vh', padding: '30px 0 60px' }}>
      <div className="container">
        {/* Top Admin Bar */}
        <div className="card" style={{ padding: '18px 24px', marginBottom: '24px', backgroundColor: '#0F172A', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="badge badge-accent" style={{ fontWeight: 800 }}>{user.role}</span>
              <div>
                <h1 style={{ fontSize: '1.3rem', color: '#FFFFFF', margin: 0 }}>
                  Noléya Executive Control
                </h1>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Logged in as {user.name} ({user.email})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href="/" target="_blank" className="btn btn-sm btn-outline" style={{ color: '#FFFFFF', borderColor: '#334155' }}>
                <ExternalLink size={14} /> View Store
              </Link>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            borderTop: '1px solid #334155',
            paddingTop: '12px',
            overflowX: 'auto',
          }}>
            <Link href="/admin" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={14} /> Overview
            </Link>
            <Link href="/admin/products" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={14} /> Products
            </Link>
            <Link href="/admin/sellers" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} /> Sellers & Vetting
            </Link>
            <Link href="/admin/categories" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FolderTree size={14} /> Categories
            </Link>
            <Link href="/admin/orders" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} /> Orders & Leads
            </Link>
            <Link href="/admin/impact" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={14} /> Foundation Impact
            </Link>
            <Link href="/admin/content" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={14} /> CMS & Rules
            </Link>
            <Link href="/admin/security" className="btn btn-sm" style={{ color: '#E2E8F0', backgroundColor: '#1E293B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> Audit & Security
            </Link>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
