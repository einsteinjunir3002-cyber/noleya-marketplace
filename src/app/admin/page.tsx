import React from 'react';
import Link from 'next/link';
import { get, query } from '@/lib/db';
import { ShoppingBag, Users, MessageSquare, Heart, Shield, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatGHS } from '@/lib/services';

export default async function AdminOverviewPage() {
  const prodStats = get<{ total: number; published: number; featured: number }>(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured
    FROM products
  `);

  const sellerStats = get<{ approved: number; pending_apps: number }>(`
    SELECT 
      (SELECT COUNT(*) FROM sellers WHERE status = 'approved') as approved,
      (SELECT COUNT(*) FROM seller_applications WHERE status = 'pending') as pending_apps
  `);

  const orderStats = get<{ total: number; fulfilled: number }>(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled
    FROM order_enquiries
  `);

  const auditLogs = query<{
    id: number;
    action: string;
    entity_type: string;
    created_at: string;
    user_email: string;
  }>('SELECT id, action, entity_type, created_at, user_email FROM audit_logs ORDER BY id DESC LIMIT 6');

  return (
    <div>
      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px',
      }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Active Catalogued Products</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065F46', margin: '4px 0' }}>
            {prodStats?.published || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            {prodStats?.featured || 0} Featured on Homepage
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Approved Ghanaian Sellers</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
            {sellerStats?.approved || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: (sellerStats?.pending_apps || 0) > 0 ? '#C2410C' : '#94A3B8', fontWeight: 600 }}>
            {sellerStats?.pending_apps || 0} Pending Applications
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Recorded Customer Leads</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C2410C', margin: '4px 0' }}>
            {orderStats?.total || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Direct WhatsApp & Inquiry Forms
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Foundation Contribution</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D97706', margin: '4px 0' }}>
            5.0%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
            Spreading joy. Restoring hope.
          </div>
        </div>
      </div>

      {/* Main Grid: Management Quicklinks & Audit Log */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '24px',
      }} className="admin-grid">
        {/* Left: Quick Actions & Pending Apps Notice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(sellerStats?.pending_apps || 0) > 0 && (
            <div className="card" style={{ padding: '20px', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={24} style={{ color: '#C2410C' }} />
                  <div>
                    <strong style={{ color: '#9A3412', fontSize: '1rem' }}>
                      {sellerStats?.pending_apps} Seller Application(s) Awaiting Review
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Review merchant profiles and sample products before granting selling privileges.
                    </div>
                  </div>
                </div>

                <Link href="/admin/sellers" className="btn btn-sm btn-secondary">
                  Review Applications &rarr;
                </Link>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Marketplace Operations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <Link href="/admin/products" className="card card-interactive" style={{ padding: '16px', textDecoration: 'none' }}>
                <ShoppingBag size={22} style={{ color: '#065F46', marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>Product Moderation</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Toggle featured, publish, edit prices</div>
              </Link>

              <Link href="/admin/sellers" className="card card-interactive" style={{ padding: '16px', textDecoration: 'none' }}>
                <Users size={22} style={{ color: '#C2410C', marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>Seller Management</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Vetting, statuses, commission rates</div>
              </Link>

              <Link href="/admin/content" className="card card-interactive" style={{ padding: '16px', textDecoration: 'none' }}>
                <Shield size={22} style={{ color: '#D97706', marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>CMS & Helplines</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Edit numbers 0545811197 & 0204822847</div>
              </Link>

              <Link href="/admin/impact" className="card card-interactive" style={{ padding: '16px', textDecoration: 'none' }}>
                <Heart size={22} style={{ color: '#E11D48', marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>Foundation Impact</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Manage initiatives and verified metrics</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Recent Audit Trail */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Audit Trail</h3>
            <Link href="/admin/security" style={{ fontSize: '0.82rem', color: '#065F46', fontWeight: 600 }}>
              Full Log &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{
                paddingBottom: '10px',
                borderBottom: '1px solid #F1F5F9',
                fontSize: '0.84rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-subtle" style={{ fontSize: '0.72rem' }}>
                    {log.action}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    {new Date(log.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ color: '#334155', marginTop: '4px', fontSize: '0.8rem' }}>
                  By: {log.user_email || 'System'} on <em>{log.entity_type}</em>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
