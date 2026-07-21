import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="mb-14 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg hover:opacity-80 transition-opacity">
        Angelica
      </Link>
      <nav className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/writing" className="hover:text-foreground transition-colors">
          Writing
        </Link>
        <Link href="/reading" className="hover:text-foreground transition-colors">
          Reading
        </Link>
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
