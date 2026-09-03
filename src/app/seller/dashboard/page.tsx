import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { get, query } from '@/lib/db';
import { ShoppingBag, MessageSquare, Plus, ArrowRight, Eye, Phone, MapPin } from 'lucide-react';
import { formatGHS } from '@/lib/services';

export default async function SellerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const seller = get<{
    id: number;
    business_name: string;
    whatsapp_number: string;
    region: string;
    city: string;
    status: string;
    commission_rate: number;
  }>('SELECT * FROM sellers WHERE user_id = ?', [user.id]);

  const sellerId = seller?.id || 0;

  const productsCount = get<{ total: number; published: number }>(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published
    FROM products WHERE seller_id = ?
  `, [sellerId]);

  const inquiriesCount = get<{ total: number; fulfilled: number }>(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled
    FROM order_enquiries WHERE seller_id = ?
  `, [sellerId]);

  const recentProducts = query<{
    id: number;
    name: string;
    slug: string;
    price_ghs: number;
    status: string;
    views_count: number;
  }>('SELECT id, name, slug, price_ghs, status, views_count FROM products WHERE seller_id = ? ORDER BY id DESC LIMIT 5', [sellerId]);

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
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Active Listings</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065F46', margin: '6px 0' }}>
            {productsCount?.published || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Total Catalogued: {productsCount?.total || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Customer Leads & Inquiries</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#C2410C', margin: '6px 0' }}>
            {inquiriesCount?.total || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Fulfilled Orders: {inquiriesCount?.fulfilled || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Merchant Status</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '6px 0', textTransform: 'uppercase' }}>
            {seller?.status || 'Active'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
            Foundation Contribution: {seller?.commission_rate || 5}%
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Listings */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
      }} className="dashboard-grid">
        {/* Left: Recent Listings */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Recent Product Listings</h3>
            <Link href="/seller/products" style={{ color: '#065F46', fontWeight: 600, fontSize: '0.85rem' }}>
              View All &rarr;
            </Link>
          </div>

          {recentProducts.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price (GH₵)</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ color: '#065F46', fontWeight: 700 }}>{formatGHS(p.price_ghs)}</td>
                      <td>
                        <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-subtle'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.views_count}</td>
                      <td>
                        <Link href={`/product/${p.slug}`} target="_blank" className="btn btn-sm btn-outline">
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
              No products added yet. Click &ldquo;Add New Product&rdquo; to start selling.
            </div>
          )}
        </div>

        {/* Right: Seller Profile & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/seller/products" className="btn btn-primary btn-full">
                <Plus size={16} /> Add New Product
              </Link>
              <Link href="/seller/orders" className="btn btn-outline btn-full">
                <MessageSquare size={16} /> Check Inquiries ({inquiriesCount?.total || 0})
              </Link>
              <Link href="/seller/profile" className="btn btn-outline btn-full">
                Edit Delivery & WhatsApp
              </Link>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', backgroundColor: '#F8FAFC' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#0F172A', marginBottom: '10px' }}>Your Store Details</h4>
            <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Business:</strong> {seller?.business_name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} style={{ color: '#25D366' }} /> <strong>WhatsApp:</strong> {seller?.whatsapp_number}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} style={{ color: '#C2410C' }} /> <strong>Region:</strong> {seller?.region}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
