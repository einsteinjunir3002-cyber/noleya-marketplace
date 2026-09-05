import React from 'react';
import Link from 'next/link';
import { Search, Filter, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ShopSortSelect, ShopRegionSelect } from '@/components/ShopControls';
import { getProducts, getCategories, getRegions, formatGHS } from '@/lib/services';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Products | Noléya Marketplace Ghana',
  description: 'Browse authentic health supplements, luxury POMBELL leather handbags, personal care, and fashion from verified Ghanaian sellers.',
};

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    region?: string;
    sort?: 'featured' | 'newest' | 'name_asc';
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const region = params.region || '';
  const sort = params.sort || 'featured';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = 16;
  const offset = (page - 1) * pageSize;

  const { products, total } = getProducts({
    search,
    category,
    region,
    sort,
    limit: pageSize,
    offset,
  });

  const categories = getCategories();
  const regions = getRegions();
  const totalPages = Math.ceil(total / pageSize);

  // Helper to construct query strings for filters
  const makeFilterUrl = (overrides: Record<string, string | number | undefined>) => {
    const current: Record<string, string> = {};
    if (search) current.search = search;
    if (category) current.category = category;
    if (region) current.region = region;
    if (sort) current.sort = sort;

    for (const [key, val] of Object.entries(overrides)) {
      if (val === undefined || val === '') {
        delete current[key];
      } else {
        current[key] = String(val);
      }
    }

    const q = new URLSearchParams(current).toString();
    return `/shop${q ? `?${q}` : ''}`;
  };

  const hasActiveFilters = Boolean(search || category || region);

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: '#64748B',
          marginBottom: '8px',
        }}>
          <Link href="/" style={{ color: '#065F46' }}>Home</Link>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>Catalogue</span>
          {category && (
            <>
              <span>/</span>
              <span style={{ color: '#C2410C', fontWeight: 600 }}>
                {categories.find(c => c.slug === category)?.name || category}
              </span>
            </>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)' }}>
              {category
                ? (categories.find(c => c.slug === category)?.name || 'Category')
                : search
                ? `Search: "${search}"`
                : 'Marketplace Catalogue'}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.95rem', marginTop: '4px' }}>
              Showing {products.length} of {total} genuine Ghanaian products
            </p>
          </div>

          {/* Sorting Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>Sort by:</span>
            <ShopSortSelect currentSort={sort} />
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: '32px',
        alignItems: 'flex-start',
      }} className="shop-layout">
        {/* Filters Sidebar */}
        <aside className="card" style={{
          padding: '24px',
          position: 'sticky',
          top: '90px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '12px',
          }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} style={{ color: '#065F46' }} /> Filters
            </h3>

            {hasActiveFilters && (
              <Link
                href="/shop"
                style={{
                  fontSize: '0.78rem',
                  color: '#DC2626',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <X size={13} /> Reset All
              </Link>
            )}
          </div>

          {/* Search Box */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Keyword Search</label>
            <form action="/shop" method="GET" style={{ position: 'relative' }}>
              {category && <input type="hidden" name="category" value={category} />}
              {region && <input type="hidden" name="region" value={region} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Product name, bag..."
                className="form-input"
                style={{ paddingRight: '36px', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                }}
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', color: '#475569' }}>
              Categories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link
                href={makeFilterUrl({ category: undefined, page: 1 })}
                style={{
                  fontSize: '0.88rem',
                  color: !category ? '#065F46' : '#64748B',
                  fontWeight: !category ? 700 : 500,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  backgroundColor: !category ? '#ECFDF5' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>All Categories</span>
                <span>{total}</span>
              </Link>

              {categories.map((c) => {
                const isActive = category === c.slug;
                return (
                  <Link
                    key={c.id}
                    href={makeFilterUrl({ category: isActive ? undefined : c.slug, page: 1 })}
                    style={{
                      fontSize: '0.88rem',
                      color: isActive ? '#065F46' : '#64748B',
                      fontWeight: isActive ? 700 : 500,
                      padding: '5px 8px',
                      borderRadius: '6px',
                      backgroundColor: isActive ? '#ECFDF5' : 'transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{c.name}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{c.product_count || 0}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Regional Location Filter */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px', color: '#475569' }}>
              Seller Location
            </div>
            <ShopRegionSelect currentRegion={region} regions={regions} />
          </div>

        </aside>

        {/* Product Grid & Active Tags */}
        <section>
          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>Active filters:</span>
              
              {search && (
                <Link href={makeFilterUrl({ search: undefined })} className="badge badge-primary">
                  Keyword: &quot;{search}&quot; <X size={12} />
                </Link>
              )}

              {category && (
                <Link href={makeFilterUrl({ category: undefined })} className="badge badge-secondary">
                  Category: {categories.find(c => c.slug === category)?.name || category} <X size={12} />
                </Link>
              )}

              {region && (
                <Link href={makeFilterUrl({ region: undefined })} className="badge badge-accent">
                  Region: {region} <X size={12} />
                </Link>
              )}

            </div>
          )}

          {/* Product Results */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-3" style={{ gap: '20px' }}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  marginTop: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <Link
                      key={pNum}
                      href={makeFilterUrl({ page: pNum })}
                      className={`btn btn-sm ${pNum === page ? 'btn-primary' : 'btn-outline'}`}
                      style={{ minWidth: '38px', height: '38px', padding: 0 }}
                    >
                      {pNum}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card empty-state" style={{ minHeight: '380px' }}>
              <div className="empty-state-icon">
                <ShoppingBag size={32} />
              </div>
              <h3 className="empty-state-title">No Matching Products Found</h3>
              <p className="empty-state-text">
                We couldn&apos;t find any items matching your selected criteria. Try adjusting your filters or search keywords.
              </p>
              <Link href="/shop" className="btn btn-primary">
                Clear All Filters
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
