'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getProduct, type CartLine } from '../../shared/catalog';

interface ShopStore {
  accountSyncUser: string | null;
  accountSyncStatus: 'idle' | 'loading' | 'ready' | 'error';
  setAccountSync: (
    user: string | null,
    status: 'idle' | 'loading' | 'ready' | 'error',
  ) => void;
  cart: CartLine[];
  wishlist: number[];
  cartOwner: string | null;
  cartDirty: boolean;
  wishlistDirty: boolean;
  pincode: string;
  location: string;
  authOpen: boolean;
  locationOpen: boolean;
  openAuth: (open?: boolean) => void;
  openLocation: (open?: boolean) => void;
  setLocation: (pincode: string, location: string) => void;
  addItem: (item: CartLine) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  removeItem: (productId: number, size: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  hydrateAccount: (owner: string, cart: CartLine[], wishlist: number[]) => void;
  logout: () => void;
  markCartSynced: () => void;
  markWishlistSynced: () => void;
}
export const useShop = create<ShopStore>()(
  persist(
    (set, get) => ({
      accountSyncUser: null,
      accountSyncStatus: 'idle',
      setAccountSync: (accountSyncUser, accountSyncStatus) =>
        set({ accountSyncUser, accountSyncStatus }),
      cart: [],
      wishlist: [],
      cartOwner: null,
      cartDirty: false,
      wishlistDirty: false,
      pincode: '110001',
      location: 'New Delhi',
      authOpen: false,
      locationOpen: false,
      openAuth: (authOpen = true) => set({ authOpen }),
      openLocation: (locationOpen = true) => set({ locationOpen }),
      setLocation: (pincode, location) => set({ pincode, location, locationOpen: false }),
      addItem: (item) => {
        const product = getProduct(item.productId);
        if (!product || !product.sizes.includes(item.size)) return;
        const cart = [...get().cart];
        const existing = cart.findIndex(
          (line) => line.productId === item.productId && line.size === item.size,
        );
        if (existing < 0)
          cart.push({ ...item, quantity: Math.min(10, Math.max(1, item.quantity)) });
        else
          cart[existing] = {
            ...cart[existing],
            quantity: Math.min(10, cart[existing].quantity + item.quantity),
          };
        set({ cart, cartDirty: true });
      },
      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          cart: state.cart.map((line) =>
            line.productId === productId && line.size === size
              ? { ...line, quantity: Math.min(10, Math.max(1, quantity)) }
              : line,
          ),
          cartDirty: true,
        })),
      removeItem: (productId, size) =>
        set((state) => ({
          cart: state.cart.filter(
            (line) => line.productId !== productId || line.size !== size,
          ),
          cartDirty: true,
        })),
      clearCart: () => set({ cart: [], cartDirty: true }),
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((saved) => saved !== id)
            : [...state.wishlist, id],
          wishlistDirty: true,
        })),
      hydrateAccount: (cartOwner, cart, wishlist) => set({ cartOwner, cart, wishlist }),
      markCartSynced: () => set({ cartDirty: false }),
      markWishlistSynced: () => set({ wishlistDirty: false }),
      logout: () =>
        set({
          cart: [],
          wishlist: [],
          cartOwner: null,
          cartDirty: false,
          wishlistDirty: false,
        }),
    }),
    {
      name: 'lidress-shopping-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        cartOwner: state.cartOwner,
        cartDirty: state.cartDirty,
        wishlistDirty: state.wishlistDirty,
        pincode: state.pincode,
        location: state.location,
      }),
    },
  ),
);
