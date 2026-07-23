'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function ProjectSection({ title, projects }: { title: string; projects: any[] }) {
  const [expanded, setExpanded] = useState(false);

  const displayProjects = expanded ? projects : projects.slice(0, 4);
  const hasMore = projects.length > 4;

  return (
    <section className="flex flex-col gap-4 w-full">
      <div>
        <h2 className="text-xs font-semibold tracking-widest uppercase bg-foreground text-background px-2.5 py-1 inline-block">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayProjects.map((project: any) => {
          const isExternal = project.link.startsWith("http");
          return (
            <Link 
              key={project.id} 
              href={project.link}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group flex flex-col justify-between p-5 border border-border rounded-xl hover:bg-muted/30 transition-all duration-300 min-h-[160px]"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-foreground flex items-center gap-1.5">
                  {project.name}
                  {isExternal && (
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
                  )}
                </h3>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
              
              {project.techStacks && project.techStacks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/40">
                  {project.techStacks.map((stack: string) => (
                    <span 
                      key={stack} 
                      className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50 font-medium"
                    >
                      {stack}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start py-1 flex items-center gap-1 mt-2"
        >
          {expanded ? "See less" : `See more (${projects.length - 4})`}
        </button>
      )}
    </section>
  );
}
