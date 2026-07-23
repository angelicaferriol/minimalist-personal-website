'use client';

import { useState } from 'react';
import Link from 'next/link';

export function BookList({ title, list }: { title: string, list: any[] }) {
  const [expanded, setExpanded] = useState(false);
  
  if (list.length === 0) return null;

  const displayBooks = expanded ? list : list.slice(0, 5);
  const hasMore = list.length > 5;

  return (
    <section className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase bg-foreground text-background px-2.5 py-1 inline-block">
          {title}
        </h2>
      </div>
      <ul className="flex flex-col gap-1 w-full">
        {displayBooks.map(book => (
          <li key={book.id}>
            <Link 
              href={`/reading/${book.slug}`}
              className="flex flex-row items-center justify-between py-2 -mx-2 px-2 rounded-md hover:bg-muted/30 transition-colors group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">{book.title}</span>
                <span className="text-xs text-muted-foreground">{book.author}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                {book.genre.length > 0 && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-muted/50 border border-border/50">{book.genre.join(", ")}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start py-1 flex items-center gap-1"
        >
          {expanded ? "See less" : `See more (${list.length - 5})`}
        </button>
      )}
    </section>
  );
}
