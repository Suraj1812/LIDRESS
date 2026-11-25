'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { PoseLandmarker } from '@mediapipe/tasks-vision';
import { getTorsoGeometry, smoothLandmarks } from '../lib/overlay-geometry';
import type { Product } from '../lib/products';
import { renderGarment } from '../lib/garment-renderer';
import type { BodyPoint } from '../lib/overlay-geometry';

export type TrackingStatus = 'idle' | 'loading' | 'searching' | 'tracking' | 'error';

/** Free, on-device pose detection. Camera frames never leave the browser. */
export function useBodyOverlay(
  video: RefObject<HTMLVideoElement | null>,
  active: boolean,
  product: Product,
  showOriginal: boolean,
) {
  const overlayCanvas = useRef<HTMLCanvasElement>(null);
  const garment = useRef<HTMLImageElement | null>(null);
  const selectedProduct = useRef(product);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('idle');
  const [trackingError, setTrackingError] = useState('');
  const [overlayScale, setOverlayScale] = useState(1);
  const [overlayOffset, setOverlayOffset] = useState(0);
  const adjustments = useRef({ scale: 1, offset: 0 });
  const original = useRef(showOriginal);
  original.current = showOriginal;
  adjustments.current = { scale: overlayScale, offset: overlayOffset };

  useEffect(() => {
    selectedProduct.current = product;
    garment.current = null;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled) garment.current = image;
    };
    image.onerror = () => {
      if (!cancelled)
        setTrackingError('The garment image could not load. Try another piece.');
    };
    image.src = product.image;
    return () => {
      cancelled = true;
    };
  }, [product]);

  useEffect(() => {
    if (!active) {
      setTrackingStatus('idle');
      return;
    }
    let cancelled = false;
    let animationFrame = 0;
    let detector: PoseLandmarker | null = null;

    let lastPoseTime = 0;
    let lastVideoTime = -1;
    let lastSeen = 0;
    let smoothedLandmarks: BodyPoint[] | null = null;
    let lastStatus: TrackingStatus = 'loading';
    setTrackingStatus('loading');
    setTrackingError('');

    function updateStatus(status: TrackingStatus) {
      if (lastStatus !== status) {
        lastStatus = status;
        setTrackingStatus(status);
      }
    }

    async function initialize() {
      try {
        const { FilesetResolver, PoseLandmarker } =
          await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks('/mediapipe');
        const options = {
          baseOptions: { modelAssetPath: '/models/pose_landmarker_lite.task' },
          runningMode: 'VIDEO' as const,
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        };
        try {
          detector = await PoseLandmarker.createFromOptions(vision, {
            ...options,
            baseOptions: { ...options.baseOptions, delegate: 'GPU' },
          });
        } catch {
          detector = await PoseLandmarker.createFromOptions(vision, options);
        }
        if (cancelled) {
          detector.close();
          return;
        }
        updateStatus('searching');
        render(performance.now());
      } catch {
        if (!cancelled) {
          setTrackingStatus('error');
          setTrackingError(
            'Body tracking could not start. Try Chrome or Edge with hardware acceleration enabled.',
          );
        }
      }
    }

    function render(timestamp: number) {
      if (cancelled) return;
      const source = video.current;
      const canvas = overlayCanvas.current;
      const context = canvas?.getContext('2d');
      if (
        source &&
        canvas &&
        context &&
        source.readyState >= 2 &&
        source.videoWidth > 0
      ) {
        if (canvas.width !== source.videoWidth || canvas.height !== source.videoHeight) {
          canvas.width = source.videoWidth;
          canvas.height = source.videoHeight;
        }
        // Pose detection runs at about 12fps; the camera renders at display speed.
        if (
          detector &&
          timestamp - lastPoseTime > 80 &&
          source.currentTime !== lastVideoTime
        ) {
          lastPoseTime = timestamp;
          lastVideoTime = source.currentTime;
          try {
            const result = detector.detectForVideo(source, timestamp);
            const image = garment.current;
            const next = result.landmarks[0];
            const torso =
              next && image
                ? getTorsoGeometry(next, { width: canvas.width, height: canvas.height })
                : null;
            if (torso) {
              smoothedLandmarks = smoothLandmarks(smoothedLandmarks, next);
              lastSeen = timestamp;
              updateStatus('tracking');
            } else if (timestamp - lastSeen > 350) {
              smoothedLandmarks = null;
              updateStatus('searching');
            }
          } catch {
            updateStatus('error');
            setTrackingError('Body tracking paused. End the session and try again.');
            detector.close();
            detector = null;
          }
        }
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Mirror the entire composition so camera, garment, and saved look agree.
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        if (
          smoothedLandmarks &&
          garment.current &&
          !original.current &&
          timestamp - lastSeen < 500
        ) {
          if (smoothedLandmarks)
            renderGarment(
              context,
              garment.current,
              source,
              smoothedLandmarks,
              { width: canvas.width, height: canvas.height },
              selectedProduct.current.overlay,
              adjustments.current,
            );
        }
      }
      animationFrame = requestAnimationFrame(render);
    }

    void initialize();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      detector?.close();
      const canvas = overlayCanvas.current;
      canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active, video]);

  return {
    overlayCanvas,
    trackingStatus,
    trackingError,
    overlayScale,
    setOverlayScale,
    overlayOffset,
    setOverlayOffset,
    resetOverlay: () => {
      setOverlayScale(1);
      setOverlayOffset(0);
    },
  };
}
