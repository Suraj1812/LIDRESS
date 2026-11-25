'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AccountSync } from './account-sync';
import { AuthDialog } from '../account/auth-dialog';
import { LocationDialog } from '../layout/location-dialog';

export function Providers({ children }: { children: React.ReactNode }) {
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
      <AuthDialog />
      <LocationDialog />
      <Toaster position="bottom-center" richColors closeButton />
    </QueryClientProvider>
  );
}
