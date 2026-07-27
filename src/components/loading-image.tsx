'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LoadingImageProps {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  sizes?: string;
  priority?: boolean;
}

export function LoadingImage({ 
  src, 
  alt = '', 
  className = '', 
  wrapperClassName = '', 
  sizes = '(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw',
  priority = false,
  ...props 
}: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-xs text-muted-foreground/60 animate-pulse rounded-md">
          Loading...
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}
