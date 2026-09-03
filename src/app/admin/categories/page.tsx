import React from 'react';
import { query, run } from '@/lib/db';
import { FolderTree, Plus, CheckCircle, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminCategoriesPage() {
  const categories = query<{
    id: number;
    name: string;
    slug: string;
    description: string;
    display_order: number;
    is_active: number;
    product_count: number;
  }>(`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
    FROM categories c
    ORDER BY c.display_order ASC, c.name ASC
  `);

  async function handleAddCategory(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string, 10) || 0;

    if (!name?.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { run } = await import('@/lib/db');
    run(
      `INSERT INTO categories (name, slug, description, display_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      [name.trim(), slug, description || null, displayOrder]
    );

    revalidatePath('/admin/categories');
    revalidatePath('/shop');
    revalidatePath('/');
  }

  async function handleDeleteCategory(formData: FormData) {
    'use server';
    const catId = formData.get('catId') as string;
    const { run } = await import('@/lib/db');
    run('DELETE FROM categories WHERE id = ?', [catId]);
    revalidatePath('/admin/categories');
    revalidatePath('/shop');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }} className="cat-layout">
      {/* Categories Table */}
      <div>
        <h2 style={{ fontSize: '1.35rem', color: '#0F172A', marginBottom: '14px' }}>
          Catalogue Categories ({categories.length})
        </h2>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: '#64748B' }}>{c.display_order}</td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{c.slug}</td>
                    <td>
                      <span className="badge badge-subtle">{c.product_count} items</span>
                    </td>
                    <td>
                      {c.product_count === 0 && (
                        <form action={handleDeleteCategory}>
                          <input type="hidden" name="catId" value={c.id} />
                          <button type="submit" className="btn btn-sm btn-outline" style={{ color: '#DC2626' }} title="Delete empty category">
                            <Trash2 size={13} />
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Add Category</h3>
        <form action={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input type="text" name="name" required placeholder="e.g. Footwear & Shoes" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input type="number" name="displayOrder" defaultValue="10" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" rows={2} placeholder="Optional short summary..." className="form-textarea" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
            <Plus size={16} /> Create Category
          </button>
        </form>
      </div>
    </div>
  );
}
