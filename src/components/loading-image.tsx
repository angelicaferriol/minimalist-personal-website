'use client';

import { useState } from 'react';

interface LoadingImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
}

export function LoadingImage({ src, alt, className, wrapperClassName = '', ...props }: LoadingImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-xs text-muted-foreground/60 animate-pulse rounded-md">
          Loading...
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}
