'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import './brand-intro.css';

function Wheel({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`brand-intro-wheel brand-intro-wheel-${side}`}>
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="31" fill="#657538" />
        <path
          d="M18 13A24 24 0 0 1 43 11"
          stroke="#f8f7f1"
          strokeOpacity=".42"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Runs on document entry; persistent layout keeps ordinary navigation instant. */
export function BrandIntro() {
  const [phase, setPhase] = useState<'assemble' | 'depart' | 'finished'>('assemble');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (phase !== 'assemble') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => setPhase('finished');
    if (preference.matches) {
      finish();
      return;
    }
    const onPreference = () => {
      if (preference.matches) finish();
    };
    preference.addEventListener('change', onPreference);
    const started = performance.now();
    const decoded = new WeakSet<HTMLImageElement>();
    const decoding = new WeakSet<HTMLImageElement>();
    let settledAt = 0;
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const pendingData = queryClient.isFetching({
        predicate: (query) =>
          query.state.data === undefined &&
          ['catalog', 'product', 'session', 'orders', 'addresses'].includes(
            String(query.queryKey[0]),
          ),
      });
      const images = Array.from(document.images).filter((image) => {
        if (image.closest('.brand-intro')) return false;
        const rect = image.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0
        );
      });
      const imagesReady = images
        .map((image) => {
          if (!image.complete) return false;
          // Broken images must not trap visitors behind the intro.
          if (image.naturalWidth === 0 || decoded.has(image)) return true;
          if (!decoding.has(image)) {
            decoding.add(image);
            image
              .decode()
              .catch(() => {})
              .finally(() => decoded.add(image));
          }
          return false;
        })
        .every(Boolean);
      const ready = !pendingData && imagesReady && document.fonts.status === 'loaded';
      if (!ready) settledAt = 0;
      else if (!settledAt) settledAt = performance.now();
      if (
        (elapsed >= 1450 && ready && performance.now() - settledAt >= 120) ||
        elapsed >= 5000
      ) {
        window.clearInterval(interval);
        setPhase('depart');
      }
    }, 80);
    return () => {
      window.clearInterval(interval);
      preference.removeEventListener('change', onPreference);
    };
  }, [queryClient, phase]);

  useEffect(() => {
    if (phase !== 'depart') return;
    const timeout = window.setTimeout(() => setPhase('finished'), 660);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  if (phase === 'finished') return null;

  return (
    <div className="brand-intro" data-phase={phase}>
      <div className="brand-intro-stage" aria-hidden="true">
        <div className="brand-intro-launch">
          <div className="brand-intro-cart">
            <div className="brand-intro-shadow" />
            <div className="brand-intro-body">
              <img
                src="/brand/lidress-icon.png"
                alt=""
                width="512"
                height="512"
                fetchPriority="high"
              />
            </div>
            <Wheel side="left" />
            <Wheel side="right" />
          </div>
        </div>
        <div className="brand-intro-lockup">
          <span className="brand-intro-name">lidress</span>
          <span className="brand-intro-tagline">A little more everyday.</span>
        </div>
      </div>
    </div>
  );
}
