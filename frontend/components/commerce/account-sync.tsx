'use client';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSession } from '../../hooks/use-session';
import { api } from '../../lib/api';
import { useShop } from '../../lib/store';
import type { CartLine } from '../../../shared/catalog';

/** Merge guest shopping once, then serialize background writes to avoid races. */
export function AccountSync() {
  const { data } = useSession();
  const userId = data?.user?.id;
  const cart = useShop((state) => state.cart);
  const wishlist = useShop((state) => state.wishlist);
  const cartDirty = useShop((state) => state.cartDirty);
  const wishlistDirty = useShop((state) => state.wishlistDirty);
  const [readyUser, setReadyUser] = useState<string | null>(null);
  const cartWriting = useRef(false);
  const wishlistWriting = useRef(false);
  useEffect(() => {
    if (!userId) {
      setReadyUser(null);
      useShop.getState().setAccountSync(null, 'idle');
      return;
    }
    useShop.getState().setAccountSync(userId, 'loading');
    let cancelled = false;
    async function load() {
      try {
        const [remoteCart, remoteWishlist] = await Promise.all([
          api<{ items: CartLine[] }>('/account/cart'),
          api<{ ids: number[] }>('/account/wishlist'),
        ]);
        if (cancelled) return;
        const local = useShop.getState();
        let items = remoteCart.items;
        let ids = remoteWishlist.ids;
        if (local.cartOwner === userId) {
          if (local.cartDirty) items = local.cart;
          if (local.wishlistDirty) ids = local.wishlist;
        } else if (!local.cartOwner) {
          items = [...remoteCart.items];
          for (const item of local.cart) {
            const existing = items.find(
              (line) => line.productId === item.productId && line.size === item.size,
            );
            if (existing)
              existing.quantity = Math.min(10, existing.quantity + item.quantity);
            else items.push({ ...item });
          }
          ids = Array.from(new Set([...ids, ...local.wishlist]));
        }
        local.hydrateAccount(userId!, items, ids);
        setReadyUser(userId!);
        local.setAccountSync(userId!, 'ready');
      } catch {
        if (cancelled) return;
        useShop.getState().setAccountSync(userId!, 'error');
        toast.error(
          'Account sync is unavailable. Your shopping is still saved on this device.',
        );
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);
  useEffect(() => {
    if (!userId || readyUser !== userId || !cartDirty || cartWriting.current) return;
    cartWriting.current = true;
    async function write() {
      try {
        while (useShop.getState().cartDirty && useShop.getState().cartOwner === userId) {
          const snapshot = useShop.getState().cart;
          await api('/account/cart', {
            method: 'PUT',
            body: JSON.stringify({ items: snapshot }),
          });
          if (JSON.stringify(snapshot) === JSON.stringify(useShop.getState().cart))
            useShop.getState().markCartSynced();
        }
      } catch {
        toast.error('Bag sync paused. Your changes are saved on this device.');
      } finally {
        cartWriting.current = false;
      }
    }
    void write();
  }, [cart, cartDirty, userId, readyUser]);
  useEffect(() => {
    if (!userId || readyUser !== userId || !wishlistDirty || wishlistWriting.current)
      return;
    wishlistWriting.current = true;
    async function write() {
      try {
        while (
          useShop.getState().wishlistDirty &&
          useShop.getState().cartOwner === userId
        ) {
          const snapshot = useShop.getState().wishlist;
          await api('/account/wishlist', {
            method: 'PUT',
            body: JSON.stringify({ ids: snapshot }),
          });
          if (JSON.stringify(snapshot) === JSON.stringify(useShop.getState().wishlist))
            useShop.getState().markWishlistSynced();
        }
      } catch {
        toast.error('Wishlist sync paused. Your changes are saved on this device.');
      } finally {
        wishlistWriting.current = false;
      }
    }
    void write();
  }, [wishlist, wishlistDirty, userId, readyUser]);
  return null;
}
