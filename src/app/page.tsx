import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          hey, i'm angelica.
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          i'm a software engineer and designer. i love building minimalist interfaces, writing tiny thoughts, and reading good books. this is my corner of the internet.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Currently
        </h2>
        <ul className="flex flex-col gap-3 text-sm">
          <li className="flex items-center justify-between group">
            <span className="text-muted-foreground">building</span>
            <Link href="/projects" className="font-medium group-hover:underline decoration-muted-foreground/50 underline-offset-4">minimalist personal site</Link>
          </li>
          <li className="flex items-center justify-between group">
            <span className="text-muted-foreground">reading</span>
            <span className="font-medium">the design of everyday things</span>
          </li>
          <li className="flex items-center justify-between group">
            <span className="text-muted-foreground">listening</span>
            <span className="font-medium">blonde - frank ocean</span>
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Connect
        </h2>
        <div className="flex gap-4">
          <Link href="https://github.com" target="_blank" className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors">
            Github <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Link href="https://twitter.com" target="_blank" className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors">
            Twitter <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Link href="mailto:hello@example.com" className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors">
            Email <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
