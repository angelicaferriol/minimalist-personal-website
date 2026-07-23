'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Layers, Play } from 'lucide-react';
import { HeicImage, isHeicUrl } from './heic-image';
import { LoadingImage } from './loading-image';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export function GalleryGrid({ title, images }: { title: string, images: any[] }) {
  const [expanded, setExpanded] = useState(false);
  // Which gallery post is open in the lightbox (null = closed)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Which media item within the carousel of the selected post
  const [carouselIndex, setCarouselIndex] = useState(0);

  const selectedPost = selectedIndex !== null ? images[selectedIndex] : null;
  const mediaItems: MediaItem[] = selectedPost?.media ?? [];
  const totalCarouselItems = mediaItems.length;
  const currentMedia = mediaItems[carouselIndex] ?? null;

  const displayImages = expanded ? images : images.slice(0, 9);
  const hasMore = images.length > 9;

  // Reset carousel index when opening a different post
  useEffect(() => {
    setCarouselIndex(0);
  }, [selectedIndex]);

  const handleCarouselNext = useCallback(() => {
    if (totalCarouselItems <= 1) return;
    setCarouselIndex((prev) => (prev + 1) % totalCarouselItems);
  }, [totalCarouselItems]);

  const handleCarouselPrev = useCallback(() => {
    if (totalCarouselItems <= 1) return;
    setCarouselIndex((prev) => (prev - 1 + totalCarouselItems) % totalCarouselItems);
  }, [totalCarouselItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') handleCarouselPrev();
      if (e.key === 'ArrowRight') handleCarouselNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleCarouselNext, handleCarouselPrev]);

  const isArt = title.toLowerCase() === 'art';

  return (
    <section className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase bg-foreground text-background px-2.5 py-1 inline-block">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {displayImages.map((image) => {
          const index = images.findIndex((img) => img.id === image.id);
          const dateString = new Date(image.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          const hasMultiple = image.media && image.media.length > 1;
          const isVideo = image.coverType === 'video';

          return (
            <div 
              key={image.id} 
              className="relative aspect-square overflow-hidden bg-muted rounded-sm group cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              {isArt && (
                <div className="absolute inset-0 border border-foreground/10 rounded-sm pointer-events-none z-10" />
              )}
              {isVideo ? (
                <video
                  src={image.imageUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : isHeicUrl(image.imageUrl) ? (
                <HeicImage 
                  src={image.imageUrl} 
                  alt={image.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <LoadingImage 
                  src={image.imageUrl} 
                  alt={image.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  wrapperClassName="w-full h-full"
                />
              )}
              {/* Video play icon overlay */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
              )}
              {/* Multi-media indicator badge */}
              {hasMultiple && (
                <div className="absolute top-1.5 right-1.5 z-10 bg-black/60 backdrop-blur-sm rounded-md p-1 flex items-center gap-0.5 pointer-events-none">
                  <Layers className="w-3 h-3 text-white/90" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-2">
                {image.title && (
                  <span className="text-white text-xs font-medium tracking-wide mb-1">
                    {image.title}
                  </span>
                )}
                <span className="text-white/70 text-[10px] tracking-wider uppercase">
                  {dateString}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start py-1 mt-2 flex items-center gap-1"
        >
          {expanded ? "See less" : `See more (${images.length - 9})`}
        </button>
      )}

      {/* Lightbox Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200"
        >
          {/* Close Area (clicking outside) */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setSelectedIndex(null)} />
          
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-md rounded-full"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Carousel Previous Button */}
          {totalCarouselItems > 1 && (
            <button 
              className="absolute left-2 sm:left-8 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-md rounded-full"
              onClick={(e) => { e.stopPropagation(); handleCarouselPrev(); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <div className="relative w-full max-w-5xl max-h-full flex flex-col items-center justify-center pointer-events-none">
            {/* Media counter badge */}
            {totalCarouselItems > 1 && (
              <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
                {carouselIndex + 1} / {totalCarouselItems}
              </div>
            )}

            {/* Render image or video */}
            {currentMedia?.type === 'video' ? (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl pointer-events-auto"
              />
            ) : isHeicUrl(currentMedia?.url || selectedPost.imageUrl) ? (
              <HeicImage 
                src={currentMedia?.url || selectedPost.imageUrl} 
                alt={selectedPost.title} 
                className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl pointer-events-auto"
              />
            ) : (
              <LoadingImage 
                src={currentMedia?.url || selectedPost.imageUrl} 
                alt={selectedPost.title} 
                className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl pointer-events-auto"
                wrapperClassName="flex items-center justify-center max-w-full max-h-[85vh]"
              />
            )}

            {/* Dot indicators */}
            {totalCarouselItems > 1 && (
              <div className="flex items-center gap-1.5 mt-4 pointer-events-auto">
                {mediaItems.map((_: MediaItem, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === carouselIndex
                        ? 'w-2 h-2 bg-foreground'
                        : 'w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col items-center text-center pointer-events-auto">
              {selectedPost.title && (
                <span className="text-foreground font-medium mb-1">
                  {selectedPost.title}
                </span>
              )}
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                {new Date(selectedPost.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Carousel Next Button */}
          {totalCarouselItems > 1 && (
            <button 
              className="absolute right-2 sm:right-8 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-md rounded-full"
              onClick={(e) => { e.stopPropagation(); handleCarouselNext(); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
