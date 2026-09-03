'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      router.push(data.redirectUrl || '/');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 16px', minHeight: '75vh' }}>
      <div style={{ maxWidth: '460px', margin: '0 auto 32px auto', textAlign: 'center' }}>
        <div style={{
          width: '54px',
          height: '54px',
          backgroundColor: '#ECFDF5',
          color: '#065F46',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}>
          <ShieldCheck size={28} />
        </div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Staff & Seller Portal</h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Sign in to manage your marketplace listings, customer leads, or administrative controls.
        </p>
      </div>

      <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)', maxWidth: '460px', margin: '0 auto' }}>
        {errorMessage && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. FishyBetty or owner@noleya.org"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                autoComplete="username"
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-lg btn-primary btn-full"
            style={{ fontWeight: 700, marginTop: '12px' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #E2E8F0',
          textAlign: 'center',
          fontSize: '0.84rem',
          color: '#64748B',
        }}>
          <div>Are you a new merchant?</div>
          <Link href="/sell/apply" style={{ color: '#065F46', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
            Apply for a Seller Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
