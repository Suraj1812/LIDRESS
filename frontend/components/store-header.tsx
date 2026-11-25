'use client';
import { Heart, ShoppingBag, Sparkles, Menu, Search } from 'lucide-react';
import { products } from '../lib/products';
import { useStore } from '../hooks/store-context';

export function StoreHeader() {
  const {
    saved,
    onlySaved,
    setOnlySaved,
    setDrawer,
    mobileMenu,
    setMobileMenu,
    showSearch,
    setShowSearch,
    bagCount,
  } = useStore();
  return (
    <>
      <div className="announcement">
        A new way to find your next favourite.{' '}
        <span>Meet your virtual fitting room.</span>
        <Sparkles size={13} />
      </div>
      <header>
        <a href="#" className="wordmark" aria-label="Lidress home">
          li<span>dress</span>
          <i>®</i>
        </a>
        <nav className={mobileMenu ? 'open' : ''}>
          <a href="#collection" onClick={() => setMobileMenu(false)}>
            The collection
          </a>
          <a href="#fitting-room" onClick={() => setMobileMenu(false)}>
            Virtual fitting room <span className="new">NEW</span>
          </a>
          <a href="#our-approach" onClick={() => setMobileMenu(false)}>
            Our approach
          </a>
        </nav>
        <div className="header-actions">
          <button aria-label="Search products" onClick={() => setShowSearch(!showSearch)}>
            <Search size={20} />
          </button>
          <button
            aria-label="Show saved pieces"
            className={onlySaved ? 'active-icon' : ''}
            onClick={() => {
              setOnlySaved(!onlySaved);
              document
                .getElementById('collection')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Heart size={20} fill={onlySaved ? 'currentColor' : 'none'} />
            {saved.length > 0 && <b>{saved.length}</b>}
          </button>
          <button aria-label="Open shopping bag" onClick={() => setDrawer(true)}>
            <ShoppingBag size={20} />
            <span className="bag-count">{bagCount}</span>
          </button>
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={21} />
          </button>
        </div>
      </header>
    </>
  );
}
