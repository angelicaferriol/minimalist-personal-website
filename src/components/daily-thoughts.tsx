'use client';

import { useState, useEffect } from 'react';

interface ThoughtBlock {
  id: string;
  text: string;
  createdTime: string;
}

interface ThoughtPage {
  id: string;
  title: string;
  slug: string;
  date: string;
  description: string;
  category: string;
  createdTime: string;
  thoughts: ThoughtBlock[];
}

// Client-side timezone-aware time formatter
function ThoughtTime({ createdTime }: { createdTime: string }) {
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const date = new Date(createdTime);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    setFormattedTime(`${hours}:${minutes}`);
  }, [createdTime]);

  return <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{formattedTime || '..:..'}</span>;
}

export function DailyThoughts({ essays }: { essays: ThoughtPage[] }) {
  const [expanded, setExpanded] = useState(false);

  // Group thoughts by date
  const grouped: { [date: string]: ThoughtBlock[] } = {};

  essays.forEach(essay => {
    let dateStr = essay.date;
    const title = essay.title.trim();
    // If the page title itself is a date (e.g. YYYY-MM-DD or MM/DD/YY)
    if (/^\d{4}-\d{2}-\d{2}$/.test(title) || /^\d{2}\/\d{2}\/\d{2,4}$/.test(title)) {
      dateStr = title;
    } else if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }

    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }

    if (essay.thoughts && essay.thoughts.length > 0) {
      grouped[dateStr].push(...essay.thoughts);
    }
  });

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Function to format Date to MM/DD/YY
  const formatDateHeader = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const [year, month, day] = parts;
      const yy = year.slice(-2);
      return `${month}/${day}/${yy}`;
    }
    
    // Check if it's already MM/DD/YY
    if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const yy = String(date.getUTCFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  // Limit display to first 3 dates initially, unless expanded
  const displayDates = expanded ? sortedDates : sortedDates.slice(0, 3);
  const hasMore = sortedDates.length > 3;

  return (
    <section className="flex flex-col gap-6 w-full">
      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase bg-foreground text-background px-2.5 py-1 inline-block">
          Daily Thoughts
        </h2>
      </div>

      <div className="flex flex-col gap-10 w-full">
        {displayDates.map(dateKey => {
          // Sort thoughts within the same date by createdTime descending
          const dayThoughts = grouped[dateKey].sort(
            (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
          );

          if (dayThoughts.length === 0) return null;

          return (
            <div key={dateKey} className="flex flex-col">
              {/* Left-aligned Date Header */}
              <div className="text-left my-2">
                <time className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  {formatDateHeader(dateKey)}
                </time>
              </div>
              
              {/* Horizontal Line */}
              <hr className="border-t border-border/50 my-2 w-full" />

              {/* List of thoughts */}
              <ul className="flex flex-col gap-3 py-1">
                {dayThoughts.map(thought => (
                  <li key={thought.id} className="flex items-start gap-6 py-1">
                    {/* Timestamp column */}
                    <div className="w-10 shrink-0 pt-0.5">
                      <ThoughtTime createdTime={thought.createdTime} />
                    </div>
                    
                    {/* Thought content column */}
                    <div className="flex-1 text-sm font-medium text-foreground/90 leading-relaxed">
                      {thought.text}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start py-1 flex items-center gap-1"
        >
          {expanded ? "See less" : `See more dates (${sortedDates.length - 3})`}
        </button>
      )}
    </section>
  );
}
