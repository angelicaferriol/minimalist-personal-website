'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function GalleryGrid({ images }: { images: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {images.map((image, index) => {
          const dateString = new Date(image.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          return (
            <div 
              key={image.id} 
              className="relative aspect-square overflow-hidden bg-muted rounded-sm group cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              <img 
                src={image.imageUrl} 
                alt={image.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
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

      {/* Lightbox Modal */}
      {selectedImage && (
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

          {/* Previous Button */}
          {images.length > 1 && (
            <button 
              className="absolute left-2 sm:left-8 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-md rounded-full"
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <div className="relative w-full max-w-5xl max-h-full flex flex-col items-center justify-center pointer-events-none">
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.title} 
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl pointer-events-auto"
            />
            <div className="mt-4 flex flex-col items-center text-center pointer-events-auto">
              {selectedImage.title && (
                <span className="text-foreground font-medium mb-1">
                  {selectedImage.title}
                </span>
              )}
              <span className="text-muted-foreground text-xs tracking-wider uppercase">
                {new Date(selectedImage.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button 
              className="absolute right-2 sm:right-8 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-md rounded-full"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
