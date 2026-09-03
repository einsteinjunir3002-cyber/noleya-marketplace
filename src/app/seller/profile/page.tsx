import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { get, run } from '@/lib/db';
import { User, Phone, MapPin, Truck, CheckCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function SellerProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const seller = get<{
    id: number;
    business_name: string;
    whatsapp_number: string;
    region: string;
    city: string;
    bio: string;
    delivery_notes: string;
    commission_rate: number;
  }>('SELECT * FROM sellers WHERE user_id = ?', [user.id]);

  async function updateProfile(formData: FormData) {
    'use server';
    const businessName = formData.get('businessName') as string;
    const whatsappNumber = formData.get('whatsappNumber') as string;
    const city = formData.get('city') as string;
    const bio = formData.get('bio') as string;
    const deliveryNotes = formData.get('deliveryNotes') as string;

    if (seller?.id) {
      run(
        `UPDATE sellers 
         SET business_name = ?, whatsapp_number = ?, city = ?, bio = ?, delivery_notes = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [businessName, whatsappNumber, city, bio, deliveryNotes, seller.id]
      );
    }
  }

  return (
    <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '36px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>Merchant Business Profile</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          This information is displayed to buyers on your product pages and determines where WhatsApp inquiries are directed.
        </p>
      </div>

      <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="form-group">
          <label className="form-label">Business / Brand Name</label>
          <input
            type="text"
            name="businessName"
            defaultValue={seller?.business_name || ''}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">WhatsApp Order Number</label>
          <input
            type="tel"
            name="whatsappNumber"
            defaultValue={seller?.whatsapp_number || ''}
            required
            className="form-input"
          />
          <div className="form-helper">
            Customers will receive a pre-formatted message to this number when placing orders.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Ghana Region</label>
            <input
              type="text"
              readOnly
              value={seller?.region || 'Greater Accra'}
              className="form-input"
              style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City / Area</label>
            <input
              type="text"
              name="city"
              defaultValue={seller?.city || ''}
              placeholder="e.g. Osu, Accra"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Store Bio / Description</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={seller?.bio || ''}
            placeholder="Tell shoppers about your expertise, brands, and commitment to quality..."
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Standard Delivery Timelines & Notes</label>
          <input
            type="text"
            name="deliveryNotes"
            defaultValue={seller?.delivery_notes || ''}
            placeholder="e.g. Same-day delivery in Accra; VIP bus parcel for other regions."
            className="form-input"
          />
        </div>

        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '10px',
          padding: '14px',
          fontSize: '0.85rem',
          color: '#166534',
        }}>
          <strong>Foundation Partnership:</strong> Your store contributes {seller?.commission_rate || 5}% on confirmed sales to support Noléya Foundation community relief.
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
          Save Profile Changes
        </button>
      </form>
    </div>
  );
}
