'use client';
import { useSession } from './use-session';
import { useHydrated } from './use-hydrated';
import { useShop } from '../lib/store';

/** Wait for persisted state and the signed-in user's initial shopping sync. */
export function useShoppingReady() {
  const hydrated = useHydrated();
  const { data, isPending } = useSession();
  const syncUser = useShop((state) => state.accountSyncUser);
  const syncStatus = useShop((state) => state.accountSyncStatus);
  const user = data?.user;
  return (
    hydrated &&
    !isPending &&
    (!user ||
      (syncUser === user.id && (syncStatus === 'ready' || syncStatus === 'error')))
  );
}
