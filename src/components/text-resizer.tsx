"use client";

import { useState } from "react";
import { Type, Minus, Plus } from "lucide-react";

export function TextResizer({ children, title, date }: { children: React.ReactNode; title?: string; date?: string }) {
  const [size, setSize] = useState<"sm" | "base" | "lg" | "xl">("base");

  const handleIncrease = () => {
    if (size === "sm") setSize("base");
    else if (size === "base") setSize("lg");
    else if (size === "lg") setSize("xl");
  };

  const handleDecrease = () => {
    if (size === "xl") setSize("lg");
    else if (size === "lg") setSize("base");
    else if (size === "base") setSize("sm");
  };

  const sizeClasses = {
    sm: "prose-sm",
    base: "prose-base",
    lg: "prose-lg",
    xl: "prose-xl"
  };

  return (
    <div className="w-full">
      {title && (
        <header className="mb-14">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4 text-foreground leading-tight">
            {title}
          </h1>
          <div className="flex items-center justify-between">
            <time className="text-sm text-muted-foreground tabular-nums">
              {date}
            </time>
            <div className="flex items-center gap-1 border border-border rounded-full p-0.5 bg-background shadow-sm scale-90 origin-right">
              <button 
                onClick={handleDecrease}
                disabled={size === "sm"}
                className="p-1.5 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Decrease font size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="px-1 text-muted-foreground flex items-center justify-center">
                <Type className="w-3.5 h-3.5" />
              </div>
              <button 
                onClick={handleIncrease}
                disabled={size === "xl"}
                className="p-1.5 rounded-full hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Increase font size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>
      )}
      
      <div className={`prose prose-zinc dark:prose-invert max-w-none transition-all duration-300
                      ${sizeClasses[size]}
                      prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-foreground
                      prose-a:text-blue-500 hover:prose-a:text-blue-600 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300
                      prose-p:leading-relaxed prose-p:text-foreground/90
                      prose-li:text-foreground/90
                      prose-strong:font-medium prose-strong:text-foreground
                      prose-hr:border-border`}>
        {children}
      </div>
    </div>
  );
}
