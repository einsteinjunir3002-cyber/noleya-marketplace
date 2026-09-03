'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(data.redirectUrl || '/admin');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container container-sm" style={{ padding: '60px 20px 100px' }}>
      <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)', maxWidth: '460px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            color: '#B45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <ShieldAlert size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', color: '#0F172A' }}>Security Update Required</h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: '6px' }}>
            Please set a new secure password for your account to continue into the management portal.
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={44} style={{ color: '#15803D', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#166534' }}>Password Updated!</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Temporary / Current Password (if known)</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (Minimum 8 chars) *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-lg btn-primary btn-full"
              style={{ fontWeight: 700, marginTop: '12px' }}
            >
              {isSubmitting ? 'Updating Password...' : 'Save & Enter Dashboard'} <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
