import React from 'react';
import { query, run } from '@/lib/db';
import { Heart, Plus, Trash2, Edit } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminImpactPage() {
  const initiatives = query<{
    id: number;
    initiative_name: string;
    summary: string;
    description: string;
    metric_label: string;
    metric_value: string;
    image_url: string;
    status: string;
    display_order: number;
  }>('SELECT * FROM foundation_impact ORDER BY display_order ASC');

  async function handleAddInitiative(formData: FormData) {
    'use server';
    const initiativeName = formData.get('initiativeName') as string;
    const metricValue = formData.get('metricValue') as string;
    const metricLabel = formData.get('metricLabel') as string;
    const description = formData.get('description') as string;
    const summary = formData.get('summary') as string;
    const imageUrl = formData.get('imageUrl') as string;

    if (!initiativeName?.trim() || !description?.trim()) return;

    const slug = initiativeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { run } = await import('@/lib/db');
    run(
      `INSERT INTO foundation_impact (initiative_name, slug, summary, description, metric_label, metric_value, image_url, status, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 10, datetime('now'), datetime('now'))`,
      [initiativeName.trim(), slug, summary || '', description.trim(), metricLabel || null, metricValue || null, imageUrl || null]
    );

    revalidatePath('/admin/impact');
    revalidatePath('/impact');
    revalidatePath('/');
  }

  async function handleDeleteInitiative(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const { run } = await import('@/lib/db');
    run('DELETE FROM foundation_impact WHERE id = ?', [id]);
    revalidatePath('/admin/impact');
    revalidatePath('/impact');
    revalidatePath('/');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }} className="impact-layout">
      {/* Existing Initiatives */}
      <div>
        <h2 style={{ fontSize: '1.4rem', color: '#0F172A', marginBottom: '14px' }}>
          Foundation Impact Initiatives ({initiatives.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {initiatives.map((item) => (
            <div key={item.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-accent">{item.metric_value}</span>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>{item.metric_label}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '6px' }}>{item.initiative_name}</h3>
                  <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '8px' }}>
                    {item.description}
                  </p>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic' }}>
                    {item.summary}
                  </div>
                </div>

                <form action={handleDeleteInitiative}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="btn btn-sm btn-outline" style={{ color: '#DC2626' }} title="Remove initiative">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Initiative Form */}
      <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Add New Initiative</h3>
        <form action={handleAddInitiative} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Initiative Name *</label>
            <input type="text" name="initiativeName" required placeholder="e.g. Health & Nutrition Relief" className="form-input" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Metric Number</label>
              <input type="text" name="metricValue" placeholder="e.g. 1,200+" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Metric Label</label>
              <input type="text" name="metricLabel" placeholder="e.g. Tonics Distributed" className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Summary</label>
            <input type="text" name="summary" placeholder="e.g. Sponsoring 500+ packs" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea name="description" rows={3} required placeholder="Explain field impact, beneficiaries, and outcomes..." className="form-textarea" />
          </div>

          <button type="submit" className="btn btn-primary">
            <Plus size={16} /> Add Impact Initiative
          </button>
        </form>
      </div>
    </div>
  );
}
