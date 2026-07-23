'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function CategoryList({ category, essays }: { category: string, essays: any[] }) {
  const [expanded, setExpanded] = useState(false);
  
  const displayEssays = expanded ? essays : essays.slice(0, 5);
  const hasMore = essays.length > 5;

  return (
    <section className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase bg-foreground text-background px-2.5 py-1 inline-block">
          {category}
        </h2>
      </div>
      <ul className="flex flex-col gap-1 w-full">
        {displayEssays.map((essay: any) => (
          <li key={essay.id}>
            <Link 
              href={`/writing/${essay.slug}`} 
              className="group flex flex-row items-center justify-between py-2 -mx-2 px-2 rounded-md hover:bg-muted/30 transition-colors"
            >
              <h3 className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors flex items-center gap-1.5">
                {essay.title}
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
              </h3>
              <time className="text-xs text-muted-foreground shrink-0 tabular-nums">
                {new Date(essay.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start py-1 flex items-center gap-1"
        >
          {expanded ? "See less" : `See more (${essays.length - 5})`}
        </button>
      )}
    </section>
  );
}
