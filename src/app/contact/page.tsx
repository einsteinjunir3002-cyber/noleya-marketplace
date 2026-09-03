'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle, Heart, Shield } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order / Product Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          message: `[Subject: ${subject}] ${message}`,
          source: 'direct_reachout',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      alert('Could not submit inquiry. Please call or message directly via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '10px' }}>
          WE ARE HERE TO HELP
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#0F172A' }}>
          Need Help? Get in Touch
        </h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '8px', maxWidth: '620px', margin: '8px auto 0' }}>
          Have questions regarding a product, order delivery, merchant onboarding, or Noléya Foundation community initiatives? Reach out directly.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'flex-start',
      }}>
        {/* Left: Contact Channels */}
        <div>
          {/* Quick Helpline Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #25D366' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MessageCircle size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0F172A' }}>Customer Helpline 1</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>MTN Ghana & WhatsApp Business</div>
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46', marginBottom: '10px' }}>
                0545811197
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href="https://wa.me/233545811197?text=Hello%20Noleya%20Marketplace%20Support" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-sm btn-whatsapp"
                >
                  <MessageCircle size={14} /> WhatsApp Us
                </a>
                <a href="tel:0545811197" className="btn btn-sm btn-outline">
                  <Phone size={14} /> Call Line
                </a>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #C2410C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FFF7ED',
                  color: '#C2410C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Phone size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0F172A' }}>Customer Helpline 2</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Telecel Ghana & Order Dispatch</div>
                </div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#C2410C', marginBottom: '10px' }}>
                0204822847
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href="https://wa.me/233204822847?text=Hello%20Noleya%20Marketplace%20Support" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-sm btn-whatsapp"
                >
                  <MessageCircle size={14} /> WhatsApp Us
                </a>
                <a href="tel:0204822847" className="btn btn-sm btn-outline">
                  <Phone size={14} /> Call Line
                </a>
              </div>
            </div>
          </div>

          {/* Email & Location */}
          <div className="card" style={{ padding: '24px', backgroundColor: '#F8FAFC' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} style={{ color: '#065F46' }} />
                <div>
                  <strong>Official Email:</strong>
                  <div style={{ color: '#065F46', fontWeight: 600 }}>Noléyafoundation@gmail.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} style={{ color: '#065F46' }} />
                <div>
                  <strong>Regional Operating Office:</strong>
                  <div style={{ color: '#64748B' }}>Accra, Greater Accra Region, Ghana</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Heart size={18} style={{ color: '#C2410C' }} />
                <div>
                  <strong>Noléya Foundation Mission:</strong>
                  <div style={{ color: '#64748B', fontStyle: 'italic' }}>
                    &ldquo;Spreading joy. Restoring hope.&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Reach Out Form */}
        <div className="card" style={{ padding: '36px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <CheckCircle size={48} style={{ color: '#15803D', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '8px' }}>
                Message Sent Successfully!
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Thank you for contacting Noléya Marketplace. Our customer support desk will contact you via your phone/WhatsApp shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="btn btn-outline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.3rem', color: '#0F172A', marginBottom: '8px' }}>
                Send Us a Message
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '20px' }}>
                Fill out the form below and we will respond promptly during business hours.
              </p>

              <div className="form-group">
                <label className="form-label">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ama Darko"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0545811197"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ama@gmail.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic / Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-select"
                >
                  <option value="Order / Product Inquiry">Order / Product Inquiry</option>
                  <option value="Seller Application Inquiry">Seller Application Inquiry</option>
                  <option value="Delivery / Tracking Assistance">Delivery / Tracking Assistance</option>
                  <option value="Noléya Foundation Partnership">Noléya Foundation Partnership</option>
                  <option value="General Feedback / Question">General Feedback / Question</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, order question, or feedback..."
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-lg btn-primary btn-full"
                style={{ fontWeight: 700, marginTop: '8px' }}
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'} <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
