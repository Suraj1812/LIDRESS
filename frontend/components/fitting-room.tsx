'use client';
import { Sparkles } from 'lucide-react';
import { CameraView } from './camera-view';
import { ProductSelection } from './product-selection';

export function FittingRoom() {
  return (
    <>
      <section id="fitting-room" className="fitting">
        <div className="fitting-heading">
          <div>
            <div className="eyebrow">
              <Sparkles size={14} /> A LITTLE TECHNOLOGY. A LOT MORE CONFIDENCE.
            </div>
            <h2>Your room. Your runway.</h2>
          </div>
          <p>Skip the changing room. Keep the good feeling.</p>
        </div>
        <div className="studio">
          <CameraView />
          <ProductSelection />
        </div>
        <div className="how-it-works">
          <div>
            <span>01</span>
            <p>
              <strong>Make yourself comfortable</strong>Stand back, find good light, and
              enable your camera.
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              <strong>Find a piece you love</strong>Switch between looks without missing a
              moment.
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              <strong>Make it your own</strong>Save your look or add a new favourite to
              your bag.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
