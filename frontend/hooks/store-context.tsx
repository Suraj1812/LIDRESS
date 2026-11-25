'use client';
import { createContext, useContext } from 'react';
import { useStorefront, type Storefront } from './use-storefront';
const StoreContext = createContext<Storefront | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStorefront();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Store components must be inside StoreProvider');
  return store;
}
