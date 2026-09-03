'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, Phone, MapPin, Search } from 'lucide-react';
import { OrderEnquiry } from '@/lib/types';
import { formatGhanaPhone, formatGHS } from '@/lib/utils';

export default function SellerOrdersPage() {
  const [inquiries, setInquiries] = useState<OrderEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders/inquiry');
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>Customer Order Inquiries & Leads</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Real-time record of buyers who initiated WhatsApp orders or requested callbacks for your products.
        </p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            Loading inquiries...
          </div>
        ) : inquiries.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Product Inquired</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td style={{ fontSize: '0.82rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(inq.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{inq.customer_name}</td>
                    <td>
                      <a href={`tel:${inq.customer_phone}`} style={{ color: '#065F46', fontWeight: 600, fontSize: '0.85rem' }}>
                        {formatGhanaPhone(inq.customer_phone)}
                      </a>
                    </td>
                    <td>{inq.product_name || 'General Merchant Inquiry'}</td>
                    <td>
                      <span className="badge badge-subtle" style={{ textTransform: 'capitalize' }}>
                        {inq.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${inq.status === 'fulfilled' ? 'badge-success' : 'badge-warning'}`}>
                        {inq.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon"><MessageSquare size={32} /></div>
            <h3 className="empty-state-title">No Customer Leads Recorded Yet</h3>
            <p className="empty-state-text">
              When shoppers click &ldquo;Order on WhatsApp&rdquo; or submit inquiries for your products, they will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
