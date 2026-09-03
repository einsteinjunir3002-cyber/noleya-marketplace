import React from 'react';
import { query } from '@/lib/db';
import { CheckCircle, XCircle, AlertTriangle, Phone, Mail, MapPin, ShieldCheck, UserCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { formatGhanaPhone } from '@/lib/services';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';

export default async function AdminSellersPage() {
  const user = await getCurrentUser();

  const applications = query<{
    id: number;
    full_name: string;
    business_name: string;
    whatsapp_number: string;
    email: string;
    region: string;
    category_name: string;
    product_samples: string;
    social_media: string;
    status: string;
    created_at: string;
  }>('SELECT * FROM seller_applications ORDER BY id DESC');

  const sellers = query<{
    id: number;
    business_name: string;
    whatsapp_number: string;
    email: string;
    region: string;
    city: string;
    status: string;
    commission_rate: number;
    product_count: number;
  }>(`
    SELECT s.*, (SELECT COUNT(*) FROM products p WHERE p.seller_id = s.id) as product_count
    FROM sellers s
    ORDER BY s.id DESC
  `);

  async function handleApproveApplication(formData: FormData) {
    'use server';
    const appId = formData.get('appId') as string;
    const { run, get } = await import('@/lib/db');
    const { hashPassword } = await import('@/lib/auth');

    const app = get<any>('SELECT * FROM seller_applications WHERE id = ?', [appId]);
    if (!app) return;

    // Update app status
    run("UPDATE seller_applications SET status = 'approved', updated_at = datetime('now') WHERE id = ?", [appId]);

    // Check or create user
    let userRow = get<any>('SELECT id FROM users WHERE LOWER(email) = ?', [app.email.toLowerCase()]);
    let userId = userRow?.id;
    if (!userId) {
      const tempPass = 'NoleyaSeller' + Math.floor(1000 + Math.random() * 9000);
      const { hash, salt } = hashPassword(tempPass);
      const res = run(
        `INSERT INTO users (email, password_hash, salt, name, phone, role, status, must_change_password, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'SELLER', 'active', 1, datetime('now'), datetime('now'))`,
        [app.email.toLowerCase(), hash, salt, app.full_name, app.whatsapp_number]
      );
      userId = Number(res.lastInsertRowid);
    }

    const slugBase = app.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${slugBase}-${appId}`;

    run(
      `INSERT OR IGNORE INTO sellers (user_id, business_name, slug, whatsapp_number, email, region, commission_rate, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 5.0, 'approved', datetime('now'), datetime('now'))`,
      [userId, app.business_name, slug, app.whatsapp_number, app.email, app.region]
    );

    revalidatePath('/admin/sellers');
  }

  async function handleRejectApplication(formData: FormData) {
    'use server';
    const appId = formData.get('appId') as string;
    const { run } = await import('@/lib/db');
    run("UPDATE seller_applications SET status = 'rejected', updated_at = datetime('now') WHERE id = ?", [appId]);
    revalidatePath('/admin/sellers');
  }

  async function handleToggleSellerStatus(formData: FormData) {
    'use server';
    const sellerId = formData.get('sellerId') as string;
    const currentStatus = formData.get('currentStatus') as string;
    const nextStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    const { run } = await import('@/lib/db');
    run('UPDATE sellers SET status = ?, updated_at = datetime("now") WHERE id = ?', [nextStatus, sellerId]);
    revalidatePath('/admin/sellers');
  }

  const pendingApps = applications.filter(a => a.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* 1. Pending Applications */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0F172A', margin: 0 }}>
            Pending Merchant Applications ({pendingApps.length})
          </h2>
          {pendingApps.length > 0 && (
            <span className="badge badge-warning">Action Needed</span>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {pendingApps.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Applicant / Business</th>
                    <th>WhatsApp & Contact</th>
                    <th>Category & Samples</th>
                    <th>Region</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApps.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(app.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{app.business_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Contact: {app.full_name}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#065F46', fontSize: '0.85rem' }}>
                          {formatGhanaPhone(app.whatsapp_number)}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{app.email}</div>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <span className="badge badge-subtle" style={{ marginBottom: '4px' }}>{app.category_name}</span>
                        <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                          {app.product_samples || 'No sample details provided.'}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {app.region}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <form action={handleApproveApplication}>
                            <input type="hidden" name="appId" value={app.id} />
                            <button type="submit" className="btn btn-sm btn-primary" title="Approve merchant">
                              <CheckCircle size={14} /> Approve
                            </button>
                          </form>
                          <form action={handleRejectApplication}>
                            <input type="hidden" name="appId" value={app.id} />
                            <button type="submit" className="btn btn-sm btn-outline" style={{ color: '#DC2626' }} title="Reject application">
                              <XCircle size={14} /> Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
              <CheckCircle size={24} style={{ color: '#15803D', margin: '0 auto 8px' }} />
              All merchant applications have been reviewed. No pending applicants in queue.
            </div>
          )}
        </div>
      </div>

      {/* 2. Approved Active Merchants */}
      <div>
        <h2 style={{ fontSize: '1.35rem', color: '#0F172A', marginBottom: '14px' }}>
          Registered Marketplace Merchants ({sellers.length})
        </h2>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>WhatsApp Order Line</th>
                  <th>Region & City</th>
                  <th>Catalogued Items</th>
                  <th>Contribution</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>
                      {s.business_name}
                    </td>
                    <td>
                      <a href={`https://wa.me/233${s.whatsapp_number.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#065F46', fontWeight: 600, fontSize: '0.85rem' }}>
                        {formatGhanaPhone(s.whatsapp_number)}
                      </a>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {s.city ? `${s.city}, ` : ''}{s.region}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {s.product_count} Products
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>
                      {s.commission_rate}%
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <form action={handleToggleSellerStatus}>
                        <input type="hidden" name="sellerId" value={s.id} />
                        <input type="hidden" name="currentStatus" value={s.status} />
                        <button
                          type="submit"
                          className="btn btn-sm btn-outline"
                          style={{ color: s.status === 'approved' ? '#DC2626' : '#15803D' }}
                        >
                          {s.status === 'approved' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
