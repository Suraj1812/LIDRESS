'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
const slides = [
  {
    eyebrow: 'THE EVERYDAY UPGRADE',
    title: (
      <>
        Good style.
        <br />
        <em>Even better prices.</em>
      </>
    ),
    copy: 'Your wardrobe favourites, without the second thought.',
    offer: 'Up to 50% off',
    category: 'fashion',
    className: 'fashion-slide',
    images: ['/images/check-shirt.png', '/images/denim-jacket.png', '/images/henley.png'],
  },
  {
    eyebrow: 'SMALL TECH. BIG DIFFERENCE.',
    title: (
      <>
        Plug into
        <br />
        <em>something better.</em>
      </>
    ),
    copy: 'Headphones, laptops, and the little things that do more.',
    offer: 'Deals from ₹499',
    category: 'electronics',
    className: 'tech-slide',
    images: ['/products/100.webp', '/products/78.webp', '/products/103.webp'],
  },
  {
    eyebrow: 'ROOM FOR THE GOOD STUFF',
    title: (
      <>
        Make home
        <br />
        <em>your favourite place.</em>
      </>
    ),
    copy: 'Fresh corners. Better mornings. Everyday comforts.',
    offer: 'Up to 35% off',
    category: 'home',
    className: 'home-slide',
    images: ['/products/12.webp', '/products/13.webp', '/products/14.webp'],
  },
];
export function HeroCarousel() {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
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
      <div className="hero-carousel" aria-label="Featured collections">
        <div className="embla" ref={emblaRef}>
          <div className="embla-container">
            {slides.map((slide, index) => (
              <div className={`embla-slide ${slide.className}`} key={index}>
                <div className="hero-copy">
                  <span className="eyebrow">{slide.eyebrow}</span>
                  <h1>{slide.title}</h1>
                  <p>{slide.copy}</p>
                  <div>
                    <strong className="hero-offer">{slide.offer}</strong>
                    <Link
                      href={`/search?category=${slide.category}`}
                      className="button ink"
                    >
                      Shop the collection
                    </Link>
                  </div>
                </div>
                <div className="hero-products" aria-hidden="true">
                  {slide.images.map((src, imageIndex) => (
                    <img
                      key={src}
                      className={`hero-product image-${imageIndex}`}
                      src={src}
                      alt=""
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
        <span className="eyebrow">A FRESH PAIR OF POSSIBILITIES</span>
        <h2>
          Your next
          <br />
          daily driver.
        </h2>
        <img src="/products/90.webp" alt="Puma casual sneakers" />
        <div>
          <span>Men’s footwear</span>
          <strong>From ₹1,499</strong>
          <span className="promo-shop">Find your pair</span>
        </div>
      </Link>
    </section>
  );
}
