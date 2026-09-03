import React from 'react';
import { query, run } from '@/lib/db';
import { MessageSquare, CheckCircle, Clock, Phone, MapPin } from 'lucide-react';
import { formatGhanaPhone, formatGHS } from '@/lib/services';
import AdminOrderStatusSelect from '@/components/AdminOrderStatusSelect';
import { revalidatePath } from 'next/cache';

export default async function AdminOrdersPage() {
  const inquiries = query<{
    id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_region: string;
    message: string;
    source: string;
    status: string;
    product_name: string;
    seller_name: string;
    created_at: string;
  }>(`
    SELECT oe.*, p.name as product_name, s.business_name as seller_name
    FROM order_enquiries oe
    LEFT JOIN products p ON oe.product_id = p.id
    LEFT JOIN sellers s ON oe.seller_id = s.id
    ORDER BY oe.id DESC
    LIMIT 100
  `);

  async function updateLeadStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    const { run } = await import('@/lib/db');
    run('UPDATE order_enquiries SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, id]);
    revalidatePath('/admin/orders');
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>
          Marketplace Leads & Customer Inquiries ({inquiries.length})
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Consolidated registry of all customer WhatsApp interactions, phone reach-outs, and order requests across Ghana.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {inquiries.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Target Product</th>
                  <th>Seller</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(inq.created_at).toLocaleDateString('en-GH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{inq.customer_name}</div>
                      {inq.customer_region && (
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{inq.customer_region}</div>
                      )}
                    </td>
                    <td>
                      <a href={`tel:${inq.customer_phone}`} style={{ color: '#065F46', fontWeight: 600, fontSize: '0.85rem' }}>
                        {formatGhanaPhone(inq.customer_phone)}
                      </a>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {inq.product_name || 'General Platform Reach-Out'}
                      </div>
                      {inq.message && (
                        <div style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inq.message}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {inq.seller_name || 'Platform Admin'}
                    </td>
                    <td>
                      <span className="badge badge-subtle" style={{ textTransform: 'capitalize' }}>
                        {inq.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <AdminOrderStatusSelect id={inq.id} currentStatus={inq.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            No customer order inquiries logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
