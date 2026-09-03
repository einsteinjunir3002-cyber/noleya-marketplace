'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, Send } from 'lucide-react';

export default function SellerApplicationPage() {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [city, setCity] = useState('');
  const [categoryName, setCategoryName] = useState('Fashion & Bags');
  const [productSamples, setProductSamples] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ghanaRegions = [
    'Greater Accra', 'Ashanti Region', 'Central Region', 'Eastern Region',
    'Western Region', 'Western North', 'Volta Region', 'Oti Region',
    'Northern Region', 'Savannah Region', 'North East Region', 'Upper East Region',
    'Upper West Region', 'Bono Region', 'Bono East Region', 'Ahafo Region'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Phone validation
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Ghanaian WhatsApp phone number (e.g., 0545811197).');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('You must agree to the Noléya Marketplace Seller Terms & Rules.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sellers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          businessName,
          whatsappNumber,
          email,
          region,
          categoryName,
          productSamples: `${productSamples} (City: ${city || 'Not specified'})`,
          socialMedia,
          deliveryOptions,
          businessDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container container-sm" style={{ padding: '40px 20px 80px' }}>
      <Link href="/sell" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#065F46',
        fontSize: '0.88rem',
        fontWeight: 600,
        marginBottom: '24px',
      }}>
        <ArrowLeft size={16} /> Back to Seller Information
      </Link>

      <div className="card" style={{ padding: 'clamp(24px, 4vw, 40px)' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={40} />
            </div>

            <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '6px 14px', marginBottom: '14px' }}>
              Application Status: Pending Review
            </span>

            <h2 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '12px' }}>
              Application Received Successfully!
            </h2>

            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 24px' }}>
              Thank you for applying to partner with <strong>Noléya Marketplace</strong>. Our administration team is reviewing your business information and sample inventory.
            </p>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left',
              maxWidth: '480px',
              margin: '0 auto 28px',
              fontSize: '0.88rem',
              color: '#334155',
            }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>What happens next?</div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Our team will verify your WhatsApp number: <strong>{whatsappNumber}</strong>.</li>
                <li>Upon approval, your login credentials will be activated for the Seller Hub.</li>
                <li>Products submitted will require administrator verification prior to public publication.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/" className="btn btn-primary">
                Return to Homepage
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contact Support (0545811197)
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '28px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
              <span className="badge badge-secondary" style={{ marginBottom: '8px' }}>
                NOLÉYA SELLER REGISTRATION
              </span>
              <h1 style={{ fontSize: '1.85rem', color: '#0F172A', marginTop: '4px' }}>
                Merchant Application Form
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.92rem', marginTop: '6px' }}>
                Please provide accurate details about your business and products. All applications are individually vetted to protect Ghanaian shoppers.
              </p>
            </div>

            {errorMessage && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Personal & Business Info */}
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#065F46', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                1. Contact & Business Identity
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Emmanuel Mensah"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Name / Brand *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Accra Leather Craft"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">WhatsApp Number (For Customer Orders) *</label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 0545811197"
                    className="form-input"
                  />
                  <div className="form-helper">This number will receive direct product order messages.</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Business Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. orders@accraleather.com"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Ghanaian Region *</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="form-select"
                  >
                    {ghanaRegions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">City / Town / Area *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. East Legon, Osu, Adum"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Products & Inventory */}
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#065F46', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginTop: '10px' }}>
                2. Products & Fulfillment
              </div>

              <div className="form-group">
                <label className="form-label">Primary Product Category *</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="form-select"
                >
                  <option value="Fashion & Bags">Bags & Handbags</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Shoes & Footwear">Shoes & Footwear</option>
                  <option value="Jewellery & Watches">Jewellery & Watches</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home & Lifestyle">Home & Lifestyle</option>
                  <option value="Other">Other Ghanaian Products</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Names & Typical Price Ranges (GH₵) *</label>
                <textarea
                  rows={3}
                  required
                  value={productSamples}
                  onChange={(e) => setProductSamples(e.target.value)}
                  placeholder="e.g. Leather totes (GH₵ 350 - 450), clutch purses (GH₵ 180). We carry 50+ pieces in physical stock."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Options Offered *</label>
                <input
                  type="text"
                  required
                  value={deliveryOptions}
                  onChange={(e) => setDeliveryOptions(e.target.value)}
                  placeholder="e.g. Same day dispatch rider in Accra; VIP bus parcel for other regions."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Social Media / Website / Instagram Link</label>
                <input
                  type="text"
                  value={socialMedia}
                  onChange={(e) => setSocialMedia(e.target.value)}
                  placeholder="e.g. instagram.com/mybusinessgh"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">About Your Business & Experience</label>
                <textarea
                  rows={2}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="How long have you been operating? Are your products manufactured locally or imported?"
                  className="form-textarea"
                />
              </div>

              {/* Terms Checkbox */}
              <div style={{
                backgroundColor: '#F8FAFC',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <input
                  type="checkbox"
                  id="agreedTerms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '3px' }}
                />
                <label htmlFor="agreedTerms" style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, cursor: 'pointer' }}>
                  I confirm that all product listings are genuine and in my physical possession. I agree to honor confirmed customer orders promptly and settle the agreed 5% charitable contribution to support Noléya Foundation community programs as outlined in the <Link href="/rules" target="_blank" style={{ color: '#065F46', textDecoration: 'underline', fontWeight: 600 }}>Marketplace Rules</Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-lg btn-secondary"
                style={{ width: '100%', fontWeight: 700, marginTop: '8px' }}
              >
                {isSubmitting ? 'Submitting Application...' : 'SUBMIT SELLER APPLICATION'} <Send size={18} />
              </button>

              <div style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
                Need help with your application? Call our Accra merchant helpline at <strong>0545811197</strong> or <strong>0204822847</strong>.
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
