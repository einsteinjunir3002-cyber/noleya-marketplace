'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, Search, Menu, X, Heart, 
  ShieldCheck, Phone, User, ArrowRight, LogOut, Settings, LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isNavActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#FFFFFF',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s ease',
    }}>
      {/* Top Banner: Foundation Link & Helplines */}
      <div style={{
        backgroundColor: '#065F46',
        color: '#FFFFFF',
        padding: '7px 0',
        fontSize: '0.8rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}>
              NOLÉYA FOUNDATION
            </span>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>
              Spreading joy. Restoring hope. Shopping here funds community outreach.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a 
              href="tel:0545811197" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#FEF3C7', fontWeight: 600 }}
            >
              <Phone size={12} /> 0545811197
            </a>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>|</span>
            <a 
              href="tel:0204822847" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#FEF3C7', fontWeight: 600 }}
            >
              <Phone size={12} /> 0204822847
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container" style={{
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontFamily: 'serif',
              fontWeight: 900,
              fontSize: '1.45rem',
              letterSpacing: '-0.03em',
              color: '#065F46',
            }}>
              NOLÉYA
            </span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#C2410C',
              textTransform: 'uppercase',
            }}>
              MARKETPLACE
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            color: '#64748B',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}>
            Shop with purpose.
          </span>
        </Link>

        {/* Search Bar (Desktop) */}
        <form 
          onSubmit={handleSearchSubmit} 
          style={{
            display: 'none',
            flex: '1',
            maxWidth: '380px',
            position: 'relative',
          }}
          className="desktop-search"
        >
          <input
            type="text"
            placeholder="Search products, brands, or bags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 16px 9px 38px',
              fontSize: '0.9rem',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              outline: 'none',
              transition: 'all 0.2s',
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
        </form>

        {/* Navigation Links (Desktop) */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '24px',
          fontWeight: 600,
          fontSize: '0.92rem',
        }} className="desktop-nav">
          <Link 
            href="/" 
            style={{ 
              color: isNavActive('/') ? '#065F46' : '#334155',
              borderBottom: isNavActive('/') ? '2px solid #065F46' : '2px solid transparent',
              paddingBottom: '4px',
            }}
          >
            Home
          </Link>
          <Link 
            href="/shop" 
            style={{ 
              color: isNavActive('/shop') ? '#065F46' : '#334155',
              borderBottom: isNavActive('/shop') ? '2px solid #065F46' : '2px solid transparent',
              paddingBottom: '4px',
            }}
          >
            Shop
          </Link>
          <Link 
            href="/impact" 
            style={{ 
              color: isNavActive('/impact') ? '#065F46' : '#334155',
              borderBottom: isNavActive('/impact') ? '2px solid #065F46' : '2px solid transparent',
              paddingBottom: '4px',
            }}
          >
            Impact
          </Link>
          <Link 
            href="/sell" 
            style={{ 
              color: isNavActive('/sell') ? '#065F46' : '#334155',
              borderBottom: isNavActive('/sell') ? '2px solid #065F46' : '2px solid transparent',
              paddingBottom: '4px',
            }}
          >
            Sell With Us
          </Link>
          <Link 
            href="/contact" 
            style={{ 
              color: isNavActive('/contact') ? '#065F46' : '#334155',
              borderBottom: isNavActive('/contact') ? '2px solid #065F46' : '2px solid transparent',
              paddingBottom: '4px',
            }}
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user.role === 'OWNER' || user.role === 'ADMIN' ? (
                <Link href="/admin" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LayoutDashboard size={14} /> Admin Portal
                </Link>
              ) : user.role === 'SELLER' ? (
                <Link href="/seller/dashboard" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LayoutDashboard size={14} /> Seller Hub
                </Link>
              ) : null}
              
              <Link 
                href="/api/auth/logout" 
                className="btn btn-sm btn-outline" 
                title="Log Out"
                onClick={async (e) => {
                  e.preventDefault();
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/';
                }}
              >
                <LogOut size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/auth/login" className="btn btn-sm btn-outline" style={{ display: 'none' }} id="login-nav-btn">
                <User size={14} /> Log In
              </Link>
              <Link href="/shop" className="btn btn-sm btn-primary">
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              padding: '8px',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products in Ghana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 38px',
                fontSize: '0.9rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontWeight: 600, fontSize: '1rem' }}>
            <Link href="/" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Home</Link>
            <Link href="/shop" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Shop Catalogue</Link>
            <Link href="/impact" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Noléya Impact</Link>
            <Link href="/sell" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Sell With Us</Link>
            <Link href="/rules" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Marketplace Rules</Link>
            <Link href="/about" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>About Noléya Foundation</Link>
            <Link href="/contact" style={{ padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>Contact & Help</Link>
          </div>

          <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {user ? (
              <>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Signed in as <strong>{user.name}</strong> ({user.role})
                </div>
                {user.role === 'OWNER' || user.role === 'ADMIN' ? (
                  <Link href="/admin" className="btn btn-primary btn-full">
                    Go to Admin Portal
                  </Link>
                ) : user.role === 'SELLER' ? (
                  <Link href="/seller/dashboard" className="btn btn-primary btn-full">
                    Go to Seller Hub
                  </Link>
                ) : null}
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                  className="btn btn-outline btn-full"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/auth/login" className="btn btn-outline" style={{ flex: 1 }}>
                  Portal Login
                </Link>
                <Link href="/shop" className="btn btn-primary" style={{ flex: 1 }}>
                  Shop Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
