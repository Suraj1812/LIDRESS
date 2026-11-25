'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Mount once near the viewport; retain state when scrolling away. */
export function DeferredContent({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '320px' },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="deferred-content" ref={ref}>
      {visible ? children : fallback}
    </div>
  );
}
