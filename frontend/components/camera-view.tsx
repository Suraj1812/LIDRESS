'use client';
import {
  Camera,
  Check,
  Sparkles,
  X,
  Scan,
  Maximize2,
  Download,
  Settings2,
  LoaderCircle,
} from 'lucide-react';
import { useStore } from '../hooks/store-context';
export function CameraView() {
  const {
    setSettings,
    backendReady,
    startAi,
    setToast,
    camera,
    connecting,
    ai,
    error,
    compare,
    setCompare,
    video,
    output,
    start,
    stop,
    snapshot,
    overlayCanvas,
    trackingStatus,
    trackingError,
    overlayScale,
    setOverlayScale,
    overlayOffset,
    setOverlayOffset,
    resetOverlay,
  } = useStore();
  return (
    <div className="camera-panel">
      <div className="camera-top">
        <span>
          <Scan size={17} />
          THE VIRTUAL FITTING ROOM
        </span>
        <span className="camera-status">
          <i className={camera ? 'on' : ''} />
          {ai
            ? 'AI try-on live'
            : camera
              ? trackingStatus === 'tracking'
                ? 'Body tracking live'
                : 'Finding your shoulders…'
              : 'Free · No API key needed'}
        </span>
      </div>
      <div className="camera-view">
        <img
          className={'camera-poster ' + (camera ? 'hidden' : '')}
          src="/images/mens-editorial.jpg"
          alt="Men's fitting room preview"
        />
        <video
          ref={video}
          autoPlay
          muted
          playsInline
          className={camera && (!ai || compare) ? 'visible' : ''}
        />
        <video
          ref={output}
          autoPlay
          muted
          playsInline
          className={camera && ai && !compare ? 'visible' : ''}
        />
        <canvas
          ref={overlayCanvas}
          className={'body-overlay ' + (camera && !ai ? 'visible' : '')}
          aria-label="Body-tracked clothing preview"
        />
        {!camera && (
          <div className="camera-intro">
            <div className="scan-corners">
              <Scan size={44} strokeWidth={1} />
            </div>
            <h3>See it. Wear it. Love it.</h3>
            <p>Find your light. Pick a piece. Make it yours.</p>
            <button className="button white" onClick={start} disabled={connecting}>
              {connecting ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <Camera size={18} />
              )}{' '}
              {connecting ? 'Opening camera…' : 'Start free try-on'}
            </button>
            {backendReady && (
              <button
                className="button glass ai-start"
                onClick={startAi}
                disabled={connecting}
              >
                <Sparkles size={16} />
                Start live AI try-on
              </button>
            )}
            <span>Free mode runs on your device. No subscription. No video uploads.</span>
          </div>
        )}
        {camera && (
          <>
            <span className="preview-badge">
              {compare
                ? 'ORIGINAL CAMERA'
                : ai
                  ? 'AI GENERATED'
                  : 'FREE · 2D BODY OVERLAY'}
            </span>
            <div className="live-controls">
              <button className="button white" onClick={stop}>
                <X size={16} />
                End session
              </button>
              {(ai || trackingStatus === 'tracking') && (
                <button className="button glass" onClick={() => setCompare(!compare)}>
                  {compare ? 'View outfit' : 'View original'}
                </button>
              )}
              <button
                className="round-button"
                aria-label="Download snapshot"
                onClick={snapshot}
              >
                <Download size={19} />
              </button>
            </div>
          </>
        )}
        {camera && !ai && trackingStatus !== 'tracking' && (
          <div className="tracking-guide" role="status">
            {trackingStatus === 'loading'
              ? 'Loading body tracker…'
              : trackingStatus === 'error'
                ? trackingError
                : 'Step back until your shoulders are in view. Face the camera.'}
          </div>
        )}
        <button
          className="fullscreen"
          aria-label="Expand fitting room"
          onClick={() => {
            const el = document.querySelector('.camera-panel');
            if (document.fullscreenElement) document.exitFullscreen();
            else
              el?.requestFullscreen().catch(() =>
                setToast('Fullscreen is unavailable in this browser'),
              );
          }}
        >
          <Maximize2 size={17} />
        </button>
      </div>
      <div className="camera-bottom">
        <span>
          <Check size={14} />
          Audio stays off. Your camera starts only with permission.
        </span>
        <button onClick={() => setSettings(true)}>
          <Settings2 size={16} /> Connection
        </button>
      </div>
      {camera && !ai && (
        <div className="overlay-adjustments">
          <label>
            Garment scale{' '}
            <input
              type="range"
              min="0.75"
              max="1.35"
              step="0.01"
              value={overlayScale}
              onChange={(event) => setOverlayScale(Number(event.target.value))}
            />
          </label>
          <label>
            Vertical position{' '}
            <input
              type="range"
              min="-0.3"
              max="0.3"
              step="0.01"
              value={overlayOffset}
              onChange={(event) => setOverlayOffset(Number(event.target.value))}
            />
          </label>
          <button onClick={resetOverlay}>Reset</button>
        </div>
      )}
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
    </div>
  );
}
