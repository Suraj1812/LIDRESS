'use client';
import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & { src: string };

/** Keeps native image layout/selectors intact, with a placeholder until decoded. */
export function ProgressiveImage(props: ImageProps) {
  return <ImageResource key={props.src} {...props} />;
}
function ImageResource({
  className = '',
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    const image = ref.current;
    if (image?.complete) setState(image.naturalWidth ? 'ready' : 'error');
  }, []);
  return (
    <img
      {...props}
      ref={ref}
      loading={loading}
      decoding="async"
      className={`${className} ${state === 'loading' ? 'image-loading' : state === 'error' ? 'image-failed' : ''}`.trim()}
      onLoad={(event) => {
        setState('ready');
        onLoad?.(event);
      }}
      onError={(event) => {
        setState('error');
        onError?.(event);
      }}
    />
  );
}
