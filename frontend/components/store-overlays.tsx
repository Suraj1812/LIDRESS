'use client';
import { Check } from 'lucide-react';
import { BagDrawer } from './bag-drawer';
import { ConnectionModal } from './connection-modal';
import { useStore } from '../hooks/store-context';
export function StoreOverlays() {
  const store = useStore();
  return (
    <>
      {store.toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {store.toast}
        </div>
      )}
      <BagDrawer />
      <ConnectionModal />
    </>
  );
}
