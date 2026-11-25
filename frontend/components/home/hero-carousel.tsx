'use client';
import { ProgressiveImage } from '../commerce/progressive-image';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { products, money, discountPercent } from '../../../shared/catalog';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
const slides = [
  {
    title: 'Men’s fashion',
    category: 'fashion',
    className: 'fashion-slide',
    images: ['/images/check-shirt.png', '/images/denim-jacket.png', '/images/henley.png'],
  },
  {
    title: 'Electronics',
    category: 'electronics',
    className: 'tech-slide',
    images: ['/products/100.webp', '/products/78.webp', '/products/103.webp'],
  },
  {
    title: 'Home essentials',
    category: 'home',
    className: 'home-slide',
    images: ['/products/12.webp', '/products/13.webp', '/products/14.webp'],
  },
  {
    title: 'Watches',
    category: 'watches',
    className: 'watch-slide',
    images: ['/products/93.webp', '/products/94.webp', '/products/98.webp'],
  },
  {
    title: 'Smartphones',
    category: 'mobiles',
    className: 'mobile-slide',
    images: ['/products/123.webp', '/products/126.webp', '/products/128.webp'],
  },
  {
    title: 'Sports essentials',
    category: 'sports',
    className: 'sports-slide',
    images: ['/products/137.webp', '/products/143.webp', '/products/140.webp'],
  },
];
export function HeroCarousel() {
  const [autoplay] = useState(() =>
    Autoplay({
      delay: 4500,
      playOnInit: false,
      stopOnInteraction: false,
      stopOnFocusIn: false,
    }),
  );
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true }, [autoplay]);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!embla) return;
    if (paused || reducedMotion) autoplay.stop();
    else autoplay.play();
  }, [embla, autoplay, paused, reducedMotion]);
  function resume() {
    if (!paused && !reducedMotion) autoplay.play();
  }
  const [selected, setSelected] = useState(0);
  const update = useCallback(() => {
    if (embla) setSelected(embla.selectedScrollSnap());
  }, [embla]);
  useEffect(() => {
    if (!embla) return;
    embla.on('select', update);
    return () => {
      embla.off('select', update);
    };
  }, [embla, update]);
  return (
    <section className="hero-grid">
      <div
        className="hero-carousel"
        aria-label="Featured collections"
        onMouseEnter={() => autoplay.stop()}
        onMouseLeave={resume}
        onFocusCapture={() => autoplay.stop()}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) resume();
        }}
      >
        <div className="embla" ref={emblaRef}>
          <div className="embla-container">
            {slides.map((slide, index) => (
              <div className={`embla-slide ${slide.className}`} key={index}>
                <div className="hero-copy">
                  <h1>{slide.title}</h1>
                  <div>
                    <strong className="hero-offer">{`Up to ${Math.max(...products.filter((product) => product.category === slide.category).map(discountPercent))}% off`}</strong>
                    <Link
                      href={`/search?category=${slide.category}`}
                      className="button ink"
                    >
                      Shop now
                    </Link>
                  </div>
                </div>
                <div className="hero-products" aria-hidden="true">
                  {slide.images.map((src, imageIndex) => (
                    <ProgressiveImage
                      key={src}
                      className={`hero-product image-${imageIndex}`}
                      src={src}
                      alt=""
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          className="carousel-nav previous"
          aria-label="Previous collection"
          onClick={() => embla?.scrollPrev()}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="carousel-nav next"
          aria-label="Next collection"
          onClick={() => embla?.scrollNext()}
        >
          <ChevronRight size={22} />
        </button>
        <button
          className="carousel-playback"
          aria-label={paused || reducedMotion ? 'Play collections' : 'Pause collections'}
          onClick={() => {
            if (reducedMotion) setReducedMotion(false);
            setPaused(!paused && !reducedMotion);
          }}
        >
          {paused || reducedMotion ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={index === selected ? 'selected' : ''}
              aria-label={`View collection ${index + 1}`}
              aria-pressed={index === selected}
              onClick={() => embla?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
      <Link href="/search?category=footwear" className="side-promotion">
        <h2>Footwear</h2>
        <ProgressiveImage
          src="/products/90.webp"
          loading="eager"
          alt="Puma casual sneakers"
        />
        <div>
          <strong>
            From{' '}
            {money(
              Math.min(
                ...products
                  .filter((product) => product.category === 'footwear')
                  .map((product) => product.price),
              ),
            )}
          </strong>
          <span className="promo-shop">Shop now</span>
        </div>
      </Link>
    </section>
  );
}
