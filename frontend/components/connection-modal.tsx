'use client';
import { Scan, X } from 'lucide-react';
import { useDialog } from '../hooks/use-dialog';
import { useStore } from '../hooks/store-context';

export function ConnectionModal() {
  const { settings, setSettings } = useStore();
  const dialogRef = useDialog(settings);
  if (!settings) return null;
  return (
    <div className="overlay modal-overlay" onClick={() => setSettings(false)}>
      <div
        ref={dialogRef}
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connection-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <span className="eyebrow">FREE. PERSONAL. ON YOUR DEVICE.</span>
          <button
            aria-label="Close fitting room details"
            onClick={() => setSettings(false)}
          >
            <X />
          </button>
        </div>
        <Scan size={30} />
        <h2 id="connection-title">Your camera. Your space.</h2>
        <p>
          Free try-on uses body tracking to place a 2D garment over your shoulders and
          torso. Move naturally, switch pieces, and use the scale and position controls to
          fine-tune the look.
        </p>
        <div className="privacy-details">
          <strong>Your video stays with you.</strong>
          <p>
            Body tracking runs in your browser. Free mode never uploads camera frames.
            Audio is always off, and snapshots download straight to your device.
          </p>
        </div>
        <div className="privacy-details">
          <strong>A style preview, not a fit guarantee.</strong>
          <p>
            This is a flat clothing overlay. Sleeves won’t bend with your arms, and it
            cannot predict fabric drape, exact sizing, or how a garment fits.
          </p>
        </div>
        <button className="button dark" onClick={() => setSettings(false)}>
          Got it. Let’s try something on.
        </button>
      </div>
    </div>
  );
}
