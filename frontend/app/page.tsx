'use client';
import { StoreProvider } from '../hooks/store-context';
import { StoreHeader } from '../components/store-header';
import { Hero } from '../components/hero';
import { Collection } from '../components/collection';
import { FittingRoom } from '../components/fitting-room';
import { OurApproach } from '../components/our-approach';
import { StoreFooter } from '../components/store-footer';
import { StoreOverlays } from '../components/store-overlays';

export default function Home() {
  return (
    <StoreProvider>
      <StoreHeader />
      <main>
        <Hero />
        <Collection />
        <FittingRoom />
        <OurApproach />
      </main>
      <StoreFooter />
      <StoreOverlays />
    </StoreProvider>
  );
}
