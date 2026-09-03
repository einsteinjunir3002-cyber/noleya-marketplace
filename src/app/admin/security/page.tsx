import React from 'react';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Shield, KeyRound, UserCheck, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function AdminSecurityPage() {
  const currentUser = await getCurrentUser();

  const users = query<{
    id: number;
    email: string;
    name: string;
    role: string;
    status: string;
    must_change_password: number;
    created_at: string;
  }>('SELECT id, email, name, role, status, must_change_password, created_at FROM users ORDER BY id ASC');

  const logs = query<{
    id: number;
    user_email: string;
    action: string;
    target_table: string;
    target_id: number;
    details: string;
    created_at: string;
  }>('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Account Security & Password */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={20} style={{ color: '#065F46' }} /> Administrator Password & Security
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
              Secure your executive account. All passwords are encrypted with PBKDF2 (100,000 rounds and 32-byte cryptographic salts).
            </p>
          </div>

          <Link href="/auth/change-password" className="btn btn-outline-primary">
            Change My Password
          </Link>
        </div>
      </div>

      {/* Users & Roles Overview */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0F172A' }}>Platform User Accounts & Roles</h3>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Password Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td style={{ fontSize: '0.88rem' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'OWNER' ? 'badge-accent' : u.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    {u.must_change_password ? (
                      <span className="badge badge-warning">Change Required</span>
                    ) : (
                      <span className="badge badge-subtle">Secured</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    {new Date(u.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Trail */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0F172A' }}>System Audit Logs (Recent 50 Actions)</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Immutable audit record tracking authentication events, product updates, seller vetting, and settings changes.
          </p>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>User Email</th>
                <th>Target Resource</th>
                <th>Details / Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleDateString('en-GH', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td>
                    <span className="badge badge-subtle" style={{ fontSize: '0.75rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {log.user_email || 'Public / Visitor'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {log.target_table} {log.target_id ? `(#${log.target_id})` : ''}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
