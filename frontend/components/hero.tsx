'use client';
import { Camera, ShoppingBag, Sparkles, Scan, CheckCheck } from 'lucide-react';

export function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> LESS GUESSWORK. MORE YOU.
          </div>
          <h1>
            Your next look.
            <br />
            <em>Already on you.</em>
          </h1>
          <p>
            Good style should feel like you. Discover everyday
            <br className="desktop-break" /> pieces and try them on, right where you are.
          </p>
          <div className="hero-ctas">
            <a className="button dark" href="#fitting-room">
              <Scan size={18} />
              Step into the fitting room
            </a>
            <a className="text-link" href="#collection">
              Explore the collection
            </a>
          </div>
          <div className="hero-note">
            <span className="mini-icon">
              <Camera size={16} />
            </span>
            <span>Your camera. Your space. A whole new way to shop.</span>
          </div>
        </div>
        <div className="hero-art">
          <img src="/images/mens-editorial.jpg" alt="Men's everyday clothing editorial" />
          <div className="editorial-label">
            THE EVERYDAY EDIT <span>Autumn / Winter ’26</span>
          </div>
          <div className="floating-card">
            <div className="float-icon">
              <Scan size={22} />
            </div>
            <div>
              <strong>
                Looks good on the rack.
                <br />
                Even better on you.
              </strong>
              <span>Discover real-time virtual try-on</span>
            </div>
            <span className="float-spark">
              <Sparkles size={18} />
            </span>
          </div>
          <div className="image-caption">CONSIDERED PIECES. ENDLESS POSSIBILITIES.</div>
        </div>
      </section>
      <div className="benefits">
        <span>
          <Scan />
          Try it on before you decide
        </span>
        <span>
          <CheckCheck />
          Considered quality. Everyday prices.
        </span>
        <span>
          <ShoppingBag />
          Your wardrobe, thoughtfully built
        </span>
      </div>
    </>
  );
}
