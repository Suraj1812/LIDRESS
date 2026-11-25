'use client';

import { useEffect, useRef, useState } from 'react';
import { createDecartClient, models, type RealTimeClient } from '@decartai/sdk';
import { getBackendStatus, requestTryOnCredential } from '../lib/api';
import type { Product } from '../lib/products';

async function loadGarment(product: Product): Promise<File> {
  const response = await fetch(product.image);
  if (!response.ok) throw new Error('Unable to load the garment reference.');
  return new File([await response.blob()], `${product.name}.jpg`, { type: 'image/jpeg' });
}

/** Owns camera permission, WebRTC, garment changes, and stream cleanup. */
export function useFittingRoom(notify: (message: string) => void) {
  const [camera, setCamera] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [ai, setAi] = useState(false);
  const [error, setError] = useState('');
  const [compare, setCompare] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const output = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const client = useRef<RealTimeClient | null>(null);
  const sessionVersion = useRef(0);
  const garmentVersion = useRef(0);
  const pendingGarment = useRef<Product | null>(null);
  const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function releaseStreams() {
    sessionVersion.current += 1;
    client.current?.disconnect();
    client.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (sessionTimer.current) clearTimeout(sessionTimer.current);
    sessionTimer.current = null;
    if (video.current) video.current.srcObject = null;
    if (output.current) output.current.srcObject = null;
  }

  function stop() {
    releaseStreams();
    setCamera(false);
    setAi(false);
    setConnecting(false);
    setCompare(false);
  }

  async function checkConnection() {
    setCheckingBackend(true);
    try {
      setBackendReady(await getBackendStatus());
    } catch {
      setBackendReady(false);
    } finally {
      setCheckingBackend(false);
    }
  }

  useEffect(() => {
    void checkConnection();
    return releaseStreams;
  }, []);

  async function start(product: Product, enableAi = false) {
    if (connecting || camera) return;
    setError('');
    setConnecting(true);
    pendingGarment.current = product;
    const version = ++sessionVersion.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Camera access requires localhost or HTTPS and a supported browser.',
        );
      }
      const media = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      // A user may cancel while the camera permission dialog is still open.
      if (version !== sessionVersion.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      setCamera(true);
      if (video.current) video.current.srcObject = media;
      if (!enableAi) {
        notify(
          'Free try-on is on. Keep your shoulders in view while body tracking loads.',
        );
        return;
      }
      // Mint a fresh, restricted credential on every connection, never in the bundle.
      const credential = await requestTryOnCredential();
      const currentProduct = pendingGarment.current || product;
      const garment = await loadGarment(currentProduct);
      if (version !== sessionVersion.current) return;
      const decart = createDecartClient({ apiKey: credential.apiKey });
      const connection = await decart.realtime.connect(media, {
        model: models.realtime(credential.model),
        mirror: 'auto',
        onRemoteStream(remoteStream) {
          if (version === sessionVersion.current && output.current) {
            output.current.srcObject = remoteStream;
            setAi(true);
          }
        },
        onConnectionChange(state) {
          if (version !== sessionVersion.current) return;
          if (state === 'disconnected') {
            setAi(false);
            setError(
              'AI session disconnected. End this session and reconnect to try again.',
            );
          }
        },
        initialState: {
          prompt: {
            text: `Replace the current top with ${currentProduct.prompt}`,
            enhance: false,
          },
          image: garment,
        },
      });
      if (version !== sessionVersion.current) {
        connection.disconnect();
        return;
      }
      client.current = connection;
      if (pendingGarment.current?.id !== currentProduct.id && pendingGarment.current) {
        await switchGarment(pendingGarment.current);
      }
      // Bound paid sessions even if the user leaves the tab open.
      sessionTimer.current = setTimeout(() => {
        stop();
        notify('Your two-minute fitting session has ended. You can start another.');
      }, credential.maxSessionSeconds * 1000);
    } catch (cause) {
      if (version !== sessionVersion.current) return;
      setError(
        cause instanceof Error ? cause.message : 'Unable to start the fitting room.',
      );
      setAi(false);
      // Retain a working local camera preview when the AI service fails.
      if (!stream.current) setCamera(false);
    } finally {
      if (version === sessionVersion.current) setConnecting(false);
    }
  }

  async function switchGarment(product: Product) {
    pendingGarment.current = product;
    setError('');
    const connection = client.current;
    if (!connection) return;
    const version = ++garmentVersion.current;
    try {
      const image = await loadGarment(product);
      if (version !== garmentVersion.current || connection !== client.current) return;
      await connection.set({
        prompt: `Replace the current top with ${product.prompt}`,
        image,
        enhance: false,
      });
    } catch {
      setError('Could not switch the garment. Please reconnect the fitting room.');
    }
  }

  function snapshot(overlay?: HTMLCanvasElement | null) {
    const source = ai && !compare ? output.current : video.current;
    if (!source?.videoWidth) {
      notify('Start your camera before capturing a look.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    canvas.getContext('2d')?.drawImage(!ai && overlay?.width ? overlay : source, 0, 0);
    const download = document.createElement('a');
    download.href = canvas.toDataURL('image/png');
    download.download = 'lidress-my-look.png';
    download.click();
    notify('Your look has been saved.');
  }

  return {
    camera,
    connecting,
    ai,
    error,
    compare,
    setCompare,
    backendReady,
    checkingBackend,
    checkConnection,
    video,
    output,
    startSession: start,
    stop,
    switchGarment,
    snapshot,
  };
}
