'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Eye, Trash2, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatGHS } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleFeatured = async (id: number, current: number) => {
    try {
      const res = await fetch(`/api/products/${id}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: current === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, is_featured: current === 1 ? 0 : 1 } : p));
      }
    } catch (err) {
      alert('Failed to update featured status.');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/products/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === id ? { ...p, status: status as any } : p));
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.seller_name && p.seller_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>Catalogued Products Moderation</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Verify authenticity, toggle featured showcase status, and enforce quality standards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search product or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.85rem', width: '220px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          </div>
          <button onClick={loadProducts} className="btn btn-sm btn-outline">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Featured</th>
                  <th style={{ width: '60px' }}>Image</th>
                  <th>Product Name</th>
                  <th>Seller</th>
                  <th>Price (GH₵)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleFeatured(p.id, p.is_featured)}
                        title={p.is_featured ? 'Remove from Homepage Featured' : 'Showcase on Homepage Featured'}
                        style={{
                          color: p.is_featured ? '#D97706' : '#CBD5E1',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Star size={18} fill={p.is_featured ? '#D97706' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <img
                        src={p.thumbnail_image || p.primary_image || '/placeholder.png'}
                        alt={p.name}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{p.category_name}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {p.seller_name}
                    </td>
                    <td style={{ fontWeight: 700, color: '#065F46', fontSize: '0.9rem' }}>
                      {formatGHS(p.price_ghs)}
                    </td>
                    <td>
                      <select
                        value={p.status}
                        onChange={(e) => updateStatus(p.id, e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.8rem', padding: '4px 24px 4px 8px' }}
                      >
                        <option value="published">Published</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link href={`/product/${p.slug}`} target="_blank" className="btn btn-sm btn-outline" title="View product page">
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="btn btn-sm btn-outline"
                          title="Delete product"
                          style={{ color: '#DC2626' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            No products match the search query.
          </div>
        )}
      </div>
    </div>
  );
}
