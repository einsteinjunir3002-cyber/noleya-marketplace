import React from 'react';
import { getSiteSettings } from '@/lib/services';
import { run } from '@/lib/db';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { getCurrentUser } from '@/lib/auth';

export default async function AdminContentPage() {
  const settings = getSiteSettings();
  const user = await getCurrentUser();

  async function handleSaveSettings(formData: FormData) {
    'use server';
    const { run } = await import('@/lib/db');
    const { logAuditAction } = await import('@/lib/audit');
    const { getCurrentUser } = await import('@/lib/auth');

    const currentUser = await getCurrentUser();

    const keys = [
      'site_title',
      'foundation_name',
      'foundation_tagline',
      'marketplace_tagline',
      'hero_title',
      'hero_subtitle',
      'contact_phone_1',
      'contact_phone_2',
      'contact_email',
      'foundation_relationship_text',
      'seller_rules_text',
    ];

    for (const key of keys) {
      const val = formData.get(key);
      if (val !== null) {
        run(
          `INSERT INTO site_settings (key, value, updated_at)
           VALUES (?, ?, datetime('now'))
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
          [key, String(val)]
        );
      }
    }

    if (currentUser) {
      logAuditAction(currentUser.id, currentUser.email, 'UPDATE_SITE_SETTINGS', 'site_settings', null);
    }

    revalidatePath('/');
    revalidatePath('/rules');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/admin/content');
  }

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '36px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>Site Content & Settings Management</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Update taglines, customer reach-out helplines, Foundation relationship statements, and seller rules live.
        </p>
      </div>

      <form action={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#065F46', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
          1. Brand Identity & Taglines
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Marketplace Tagline</label>
            <input
              type="text"
              name="marketplace_tagline"
              defaultValue={settings.marketplace_tagline || 'Shop with purpose.'}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Foundation Tagline</label>
            <input
              type="text"
              name="foundation_tagline"
              defaultValue={settings.foundation_tagline || 'Spreading joy. Restoring hope.'}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Hero Subtitle</label>
          <textarea
            name="hero_subtitle"
            rows={2}
            defaultValue={settings.hero_subtitle || 'Discover products from local businesses and independent sellers while supporting meaningful community initiatives through Noléya Foundation.'}
            className="form-textarea"
          />
        </div>

        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#065F46', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginTop: '10px' }}>
          2. Official Customer Reach-Out Contact Numbers
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Helpline 1 (WhatsApp)</label>
            <input
              type="text"
              name="contact_phone_1"
              defaultValue={settings.contact_phone_1 || '0545811197'}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Helpline 2 (Dispatch)</label>
            <input
              type="text"
              name="contact_phone_2"
              defaultValue={settings.contact_phone_2 || '0204822847'}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Email</label>
            <input
              type="email"
              name="contact_email"
              defaultValue={settings.contact_email || 'Noléyafoundation@gmail.com'}
              className="form-input"
            />
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#065F46', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginTop: '10px' }}>
          3. Foundation & Marketplace Relationship Explanation
        </div>

        <div className="form-group">
          <label className="form-label">Relationship Description</label>
          <textarea
            name="foundation_relationship_text"
            rows={3}
            defaultValue={settings.foundation_relationship_text || 'Noléya Marketplace creates an opportunity for businesses and entrepreneurs to showcase their products while contributing to the work of Noléya Foundation. Every purchase empowers a local seller while helping fund community outreach, education, and healthcare support for vulnerable Ghanaians.'}
            className="form-textarea"
          />
        </div>

        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#065F46', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginTop: '10px' }}>
          4. Marketplace Rules & Seller Standards (Editable by Owner)
        </div>

        <div className="form-group">
          <label className="form-label">Seller Rules & Obligations Text</label>
          <textarea
            name="seller_rules_text"
            rows={5}
            defaultValue={settings.seller_rules_text || 'All listed products must be authentic and available in physical stock in Ghana. Sellers agree to fulfill customer orders reliably and honor the agreed 5% charitable contribution upon confirmed completed sales.'}
            className="form-textarea"
          />
        </div>

        <button type="submit" className="btn btn-lg btn-primary" style={{ marginTop: '10px', fontWeight: 700 }}>
          <Save size={18} /> Save & Apply All Settings Live
        </button>
      </form>
    </div>
  );
}
