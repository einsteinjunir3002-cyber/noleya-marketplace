'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Region } from '@/lib/types';

interface ShopSortSelectProps {
  currentSort: string;
}

export function ShopSortSelect({ currentSort }: ShopSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      defaultValue={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="form-select"
      style={{
        padding: '8px 32px 8px 14px',
        fontSize: '0.88rem',
        fontWeight: 600,
        backgroundColor: '#FFFFFF',
        width: 'auto',
      }}
    >
      <option value="featured">Featured First</option>
      <option value="newest">Newest Arrivals</option>
      <option value="name_asc">Alphabetical (A-Z)</option>
    </select>
  );
}

interface ShopRegionSelectProps {
  currentRegion: string;
  regions: Region[];
}

export function ShopRegionSelect({ currentRegion, regions }: ShopRegionSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRegionChange = (newRegion: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRegion) {
      params.set('region', newRegion);
    } else {
      params.delete('region');
    }
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      value={currentRegion}
      onChange={(e) => handleRegionChange(e.target.value)}
      className="form-select"
      style={{ fontSize: '0.85rem' }}
    >
      <option value="">All 16 Ghana Regions</option>
      {regions.map((r) => (
        <option key={r.id} value={r.name}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
