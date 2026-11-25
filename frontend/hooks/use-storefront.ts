'use client';

import { useEffect, useState } from 'react';
import { products, type Product, type BagItem } from '../lib/products';
import { useFittingRoom } from './use-fitting-room';
import { useBodyOverlay } from './use-body-overlay';

/** Store state stays here; camera and provider details live in useFittingRoom. */
export function useStorefront() {
  const [filter, setFilter] = useState('All pieces');
  const [sort, setSort] = useState('Featured');
  const [saved, setSaved] = useState<number[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);
  const [selected, setSelected] = useState(products[0]);
  const [size, setSize] = useState('M');
  const [bag, setBag] = useState<BagItem[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [settings, setSettings] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fittingRoom = useFittingRoom(setToast);
  const bodyOverlay = useBodyOverlay(
    fittingRoom.video,
    fittingRoom.camera && !fittingRoom.ai,
    selected,
    fittingRoom.compare,
  );

  useEffect(() => {
    try {
      const savedIds: unknown = JSON.parse(localStorage.getItem('lidress-saved') || '[]');
      const storedBag: unknown = JSON.parse(localStorage.getItem('lidress-bag') || '[]');
      if (Array.isArray(savedIds))
        setSaved(savedIds.filter((id) => products.some((p) => p.id === id)));
      if (Array.isArray(storedBag)) {
        // Resolve products from the catalogue rather than trusting stored prices/content.
        setBag(
          storedBag.flatMap((item) => {
            const product = products.find((p) => p.id === item?.product?.id);
            const validSize = ['XS', 'S', 'M', 'L', 'XL'].includes(item?.size);
            if (!product || !validSize || !Number.isInteger(item?.qty) || item.qty < 1)
              return [];
            return [{ product, size: item.size, qty: Math.min(item.qty, 99) }];
          }),
        );
      }
    } catch {
      // Storage can be unavailable or contain an older version of the catalogue.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem('lidress-saved', JSON.stringify(saved));
      localStorage.setItem('lidress-bag', JSON.stringify(bag));
    } catch {
      // Browsing and the bag still work when storage is blocked.
    }
  }, [saved, bag, loaded]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDrawer(false);
        setSettings(false);
        setMobileMenu(false);
      }
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  function choose(product: Product) {
    setSelected(product);
    void fittingRoom.switchGarment(product);
  }

  function add() {
    setBag((items) => {
      const existing = items.findIndex(
        (item) => item.product.id === selected.id && item.size === size,
      );
      if (existing < 0) return [...items, { product: selected, size, qty: 1 }];
      return items.map((item, index) =>
        index === existing ? { ...item, qty: Math.min(item.qty + 1, 99) } : item,
      );
    });
    setToast(`${selected.name} added to your bag`);
  }

  const visible = products.filter(
    (product) =>
      (filter === 'All pieces' || product.category === filter) &&
      (!onlySaved || saved.includes(product.id)) &&
      product.name.toLowerCase().includes(search.toLowerCase()),
  );
  if (sort === 'Price: low to high') visible.sort((a, b) => a.price - b.price);
  if (sort === 'Price: high to low') visible.sort((a, b) => b.price - a.price);
  const bagCount = bag.reduce((total, item) => total + item.qty, 0);

  return {
    filter,
    setFilter,
    sort,
    setSort,
    saved,
    setSaved,
    onlySaved,
    setOnlySaved,
    selected,
    size,
    setSize,
    bag,
    setBag,
    drawer,
    setDrawer,
    settings,
    setSettings,
    toast,
    setToast,
    mobileMenu,
    setMobileMenu,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    choose,
    add,
    visible,
    bagCount,
    ...fittingRoom,
    ...bodyOverlay,
    snapshot: () => fittingRoom.snapshot(bodyOverlay.overlayCanvas.current),
    start: () => fittingRoom.startSession(selected),
    startAi: () => fittingRoom.startSession(selected, true),
  };
}
export type Storefront = ReturnType<typeof useStorefront>;
