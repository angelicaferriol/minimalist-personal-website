'use client';

import { useEffect, useState } from 'react';

// Dynamically import heic2any only on the client side
let heic2anyPromise: any = null;
const getHeic2Any = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!heic2anyPromise) {
    heic2anyPromise = import('heic2any').then((mod) => mod.default);
  }
  return heic2anyPromise;
};

export function isHeicUrl(url: string): boolean {
  if (!url) return false;
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return pathname.endsWith('.heic') || pathname.endsWith('.heif');
  } catch {
    const lower = url.toLowerCase().split('?')[0];
    return lower.endsWith('.heic') || lower.endsWith('.heif');
  }
}

interface HeicImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function HeicImage({ src, alt, className }: HeicImageProps) {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const convertImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        
        const convert = await getHeic2Any();
        if (!convert) return;

        const convertedBlob = await convert({
          blob,
          toType: 'image/jpeg',
        });

        if (active) {
          const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          objectUrl = URL.createObjectURL(blobToUse);
          setDisplayUrl(objectUrl);
        }
      } catch (err) {
        console.error('HEIC conversion failed:', err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    convertImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center text-xs text-muted-foreground animate-pulse`}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center text-xs text-red-500`}>
        Failed to load image
      </div>
    );
  }

  return displayUrl ? (
    <img src={displayUrl} alt={alt} className={className} />
  ) : (
    <div className={`${className} bg-muted`} />
  );
}
