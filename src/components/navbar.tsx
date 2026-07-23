"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const pathname = usePathname();

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header className="mb-4 md:mb-6 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
      <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2">
        <img
          src="/cat-transparent.png"
          alt="Pixel Kitten"
          className="w-40 h-auto object-contain shrink-0"
        />
      </Link>
      <nav className="flex w-full flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground font-medium md:w-auto md:justify-end">
        <Link
          href="/writing"
          className={`hover:text-foreground transition-all duration-300 pb-1 border-b-2 ${isActive("/writing")
              ? "text-foreground border-foreground"
              : "border-transparent"
            }`}
        >
          Writing
        </Link>
        <Link
          href="/reading"
          className={`hover:text-foreground transition-all duration-300 pb-1 border-b-2 ${isActive("/reading")
              ? "text-foreground border-foreground"
              : "border-transparent"
            }`}
        >
          Reading
        </Link>
        <Link
          href="/gallery"
          className={`hover:text-foreground transition-all duration-300 pb-1 border-b-2 ${isActive("/gallery")
              ? "text-foreground border-foreground"
              : "border-transparent"
            }`}
        >
          Gallery
        </Link>
        <Link
          href="/projects"
          className={`hover:text-foreground transition-all duration-300 pb-1 border-b-2 ${isActive("/projects")
              ? "text-foreground border-foreground"
              : "border-transparent"
            }`}
        >
          Projects
        </Link>
        <div className="pl-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
