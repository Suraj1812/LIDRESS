'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AccountSync } from './account-sync';
import dynamic from 'next/dynamic';
import { useShop } from '../../lib/store';
import { DialogSkeleton } from './skeletons';
const AuthDialog = dynamic(
  () => import('../account/auth-dialog').then((module) => module.AuthDialog),
  { loading: () => <DialogSkeleton /> },
);
const LocationDialog = dynamic(
  () => import('../layout/location-dialog').then((module) => module.LocationDialog),
  { loading: () => <DialogSkeleton /> },
);

export function Providers({ children }: { children: React.ReactNode }) {
  const authOpen = useShop((state) => state.authOpen);
  const locationOpen = useShop((state) => state.locationOpen);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <AccountSync />
      {children}
      {authOpen && <AuthDialog />}
      {locationOpen && <LocationDialog />}
      <Toaster position="bottom-center" richColors closeButton />
    </QueryClientProvider>
  );
}
