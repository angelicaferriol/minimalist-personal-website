'use client';

import { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { LoadingImage } from './loading-image';

interface VideoItem {
  id: string;
  title: string;
  imageUrl: string;
  url: string;
  date: string;
}

interface VideoListProps {
  title: string;
  videos: VideoItem[];
}

export function VideoList({ title, videos }: VideoListProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close dropdown when clicking anywhere else
  useEffect(() => {
    if (activeMenuId === null) return;
    const handleClose = () => setActiveMenuId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [activeMenuId]);

  const displayVideos = expanded ? videos : videos.slice(0, 3);
  const hasMore = videos.length > 3;

  return (
    <section className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase bg-foreground text-background px-2.5 py-1 inline-block">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {displayVideos.map((video) => {
          const dateString = new Date(video.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          return (
            <div
              key={video.id}
              onClick={() => {
                if (video.url) {
                  window.open(video.url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="group flex gap-3 sm:gap-4 items-center justify-between p-2 -mx-2 rounded-md hover:bg-muted/30 transition-colors cursor-pointer text-left"
            >
              <div className="flex gap-3 sm:gap-4 items-start flex-1 min-w-0">
                {/* Video Thumbnail */}
                <div className="relative w-32 sm:w-40 aspect-video shrink-0 bg-muted rounded-md overflow-hidden">
                  <LoadingImage
                    src={video.imageUrl}
                    alt={video.title}
                    sizes="(max-width: 640px) 128px, 160px"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    wrapperClassName="w-full h-full"
                  />
                </div>

                {/* Video Metadata */}
                <div className="flex flex-col min-w-0 justify-center">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-foreground/90 transition-colors line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-1 tracking-wide">
                    {dateString}
                  </span>
                </div>
              </div>

              {/* Options icon and custom dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === video.id ? null : video.id);
                  }}
                  className="text-muted-foreground/60 hover:text-muted-foreground transition-colors p-1 hover:bg-muted/50 rounded-sm pointer-events-auto"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuId === video.id && (
                  <div className="absolute right-0 mt-1 z-10 bg-popover text-popover-foreground border border-border shadow-md rounded-md py-1.5 px-3 min-w-[100px] pointer-events-auto text-xs text-left animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      className="hover:underline font-medium block py-0.5 w-full text-left"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveMenuId(null);
                        if (video.url) {
                          window.open(video.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      Watch video
                    </button>
                  </div>
                )}
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
          {expanded ? "See less" : `See more (${videos.length - 3})`}
        </button>
      )}
    </section>
  );
}
