'use client';
import { ProgressiveImage } from '../commerce/progressive-image';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  Search,
  MapPin,
  UserRound,
  ShoppingCart,
  Heart,
  Package,
  ChevronDown,
  LogOut,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { products } from '../../../shared/catalog';
import { useShop } from '../../lib/store';
import { useSession, sessionKey } from '../../hooks/use-session';
import { useHydrated } from '../../hooks/use-hydrated';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useSession();
  const user = data?.user;
  const cart = useShop((state) => state.cart);
  const location = useShop((state) => state.location);
  const pincode = useShop((state) => state.pincode);
  const openAuth = useShop((state) => state.openAuth);
  const openLocation = useShop((state) => state.openLocation);
  const hydrated = useHydrated();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const suggestions =
    query.trim().length > 1
      ? products
          .filter((product) =>
            `${product.title} ${product.brand} ${product.type}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .slice(0, 5)
      : [];
  function search(event: React.FormEvent) {
    event.preventDefault();
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }
  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
      useShop.getState().logout();
      queryClient.setQueryData(sessionKey, { user: null });
      queryClient.removeQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['addresses'] });
      router.push('/');
      toast.success('You’re signed out');
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  }
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="LIDRESS home">
            <ProgressiveImage
              src="/brand/lidress-wordmark.png"
              loading="eager"
              width="162"
              height="50"
              alt="lidress"
            />
          </Link>
          <button className="delivery-location" onClick={() => openLocation()}>
            <MapPin size={19} />
            <span>
              Deliver to
              <strong>{hydrated ? `${location} ${pincode}` : 'Choose location'}</strong>
            </span>
            <ChevronDown size={13} />
          </button>
          <form className="search-form" role="search" onSubmit={search}>
            <Search size={21} />
            <input
              aria-label="Search products, brands and more"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search for products, brands and more"
            />
            <button type="submit" className="sr-only">
              Search
            </button>
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
              >
                <X size={16} />
              </button>
            )}
            {focused && suggestions.length > 0 && (
              <div className="search-suggestions">
                <span>Products you might like</span>
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={() => {
                      setFocused(false);
                      setQuery('');
                    }}
                  >
                    <ProgressiveImage src={product.images[0]} alt="" />
                    <div>
                      {product.title}
                      <small>{product.brand}</small>
                    </div>
                    <Search size={15} />
                  </Link>
                ))}
                <button type="submit">See all results for “{query}”</button>
              </div>
            )}
          </form>
          <div className="header-actions">
            <Dropdown.Root>
              <Dropdown.Trigger className="account-trigger">
                <UserRound size={21} />
                <span>{user ? user.name.split(' ')[0] : 'Account'}</span>
                <ChevronDown size={14} />
              </Dropdown.Trigger>
              <Dropdown.Portal>
                <Dropdown.Content className="dropdown-menu" align="end" sideOffset={16}>
                  {!user && (
                    <>
                      <Dropdown.Item
                        className="dropdown-item account-menu-intro"
                        onSelect={() => openAuth()}
                      >
                        New here? <strong>Sign in / Sign up</strong>
                      </Dropdown.Item>
                      <Dropdown.Separator className="dropdown-separator" />
                    </>
                  )}
                  <Dropdown.Item asChild>
                    <Link className="dropdown-item" href="/account">
                      <UserRound size={17} /> My account
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item asChild>
                    <Link className="dropdown-item" href="/orders">
                      <Package size={17} /> My orders
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item asChild>
                    <Link className="dropdown-item" href="/wishlist">
                      <Heart size={17} /> Wishlist
                    </Link>
                  </Dropdown.Item>
                  {user && (
                    <Dropdown.Item className="dropdown-item" onSelect={logout}>
                      <LogOut size={17} />
                      Sign out
                    </Dropdown.Item>
                  )}
                </Dropdown.Content>
              </Dropdown.Portal>
            </Dropdown.Root>
            <Link href="/orders" className="header-orders">
              <Package size={21} />
              <span>Orders</span>
            </Link>
            <Link href="/cart" className="cart-link">
              <ShoppingCart size={23} />
              {hydrated && cart.length > 0 && (
                <b>{cart.reduce((sum, line) => sum + line.quantity, 0)}</b>
              )}
              <span>Cart</span>
            </Link>
            <button
              className="mobile-menu-button icon-button"
              aria-label="Open shopping menu"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={23} />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <nav className="mobile-menu">
            <Link href="/account" onClick={() => setMobileMenu(false)}>
              My account
            </Link>
            <Link href="/orders" onClick={() => setMobileMenu(false)}>
              My orders
            </Link>
            <Link href="/wishlist" onClick={() => setMobileMenu(false)}>
              My wishlist
            </Link>
            <Link href="/sell" onClick={() => setMobileMenu(false)}>
              Become a seller
            </Link>
            <button
              onClick={() => {
                openLocation();
                setMobileMenu(false);
              }}
            >
              Change delivery location
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
