'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Edit, Trash2, Eye, Upload, CheckCircle, 
  AlertCircle, ShoppingBag, X, RefreshCw 
} from 'lucide-react';
import { Product, Category } from '@/lib/types';
import { formatGHS } from '@/lib/utils';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceGhs, setPriceGhs] = useState('');
  const [comparePriceGhs, setComparePriceGhs] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [deliveryInfo, setDeliveryInfo] = useState('Same-day delivery in Accra; 24-48h nationwide courier.');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get categories
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      setCategories(catData.categories || []);
      if (catData.categories?.length > 0) {
        setCategoryId(catData.categories[0].id.toString());
      }

      // Get current user info to find seller products
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.user) {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
    } catch (err) {
      console.error('Error loading seller products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !description.trim() || !priceGhs) {
      setErrorMsg('Product name, description, and price are required.');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload files first if selected
      const uploadedImages: Array<{ url: string; thumbnailUrl: string }> = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const upData = await upRes.json();
        if (upRes.ok && upData.url) {
          uploadedImages.push({
            url: upData.url,
            thumbnailUrl: upData.thumbnailUrl,
          });
        }
      }

      // 2. Submit product
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          priceGhs: parseFloat(priceGhs),
          comparePriceGhs: comparePriceGhs ? parseFloat(comparePriceGhs) : null,
          categoryId: parseInt(categoryId, 10),
          stockQuantity: parseInt(stockQuantity, 10) || 10,
          deliveryInfo,
          images: uploadedImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create product.');
      }

      // Reset form & reload
      setName('');
      setDescription('');
      setPriceGhs('');
      setComparePriceGhs('');
      setSelectedFiles([]);
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating product.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>My Product Listings</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Manage your active marketplace items, inventory status, and prices.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            Loading products...
          </div>
        ) : products.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price (GH₵)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.thumbnail_image || p.primary_image || '/placeholder.png'}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>SKU: {p.sku || `NL-${p.id}`}</div>
                    </td>
                    <td>
                      <span className="badge badge-subtle">{p.category_name}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#065F46' }}>
                      {formatGHS(p.price_ghs)}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-subtle'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/product/${p.slug}`} target="_blank" className="btn btn-sm btn-outline" title="Preview on store">
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="btn btn-sm btn-outline"
                          title="Delete product"
                          style={{ color: '#DC2626' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-state-icon"><ShoppingBag size={32} /></div>
            <h3 className="empty-state-title">No Products Listed Yet</h3>
            <p className="empty-state-text">Add your genuine inventory to start receiving direct WhatsApp orders.</p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ marginTop: '14px' }}>
              <Plus size={16} /> Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="card" style={{
            maxWidth: '620px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Add New Product Listing</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div className="alert alert-danger" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. POMBELL Leather Satchel F6723"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Selling Price (GH₵) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={priceGhs}
                    onChange={(e) => setPriceGhs(e.target.value)}
                    placeholder="e.g. 350.00"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Regular / Compare Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={comparePriceGhs}
                    onChange={(e) => setComparePriceGhs(e.target.value)}
                    placeholder="e.g. 420.00"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity Available</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="10"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe material, benefits, authenticity, and condition..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Note</label>
                <input
                  type="text"
                  value={deliveryInfo}
                  onChange={(e) => setDeliveryInfo(e.target.value)}
                  placeholder="e.g. Delivery in Accra within 24 hours."
                  className="form-input"
                />
              </div>

              {/* Photos upload */}
              <div className="form-group">
                <label className="form-label">Product Photographs</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="form-input"
                  style={{ padding: '8px' }}
                />
                <div className="form-helper">
                  Select clear, real photographs of the product in physical inventory.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {uploading ? 'Processing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
