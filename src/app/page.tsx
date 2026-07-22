import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          hey, this is n.
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          a computer science student and dev intern, who loves building and designing stuffs, writing tiny thoughts, and reading good books. this is my corner of the internet.
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
            <span className="text-muted-foreground">studying</span>
            <Link href="/projects" className="font-medium group-hover:underline decoration-muted-foreground/50 underline-offset-4">data science and machine learning</Link>
          </li>
          <li className="flex items-center justify-between group">
            <span className="text-muted-foreground">reading</span>
            <span className="font-medium">psychology of money</span>
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Connect
        </h2>
        <div className="flex gap-4">
          <Link href="https://github.com/angelicaferriol" target="_blank" className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors">
            Github <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Link href="https://www.linkedin.com/in/angelicaferriol/" target="_blank" className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors">
            LinkedIn <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Link href="mailto:angelicaferriol712@gmail.com" className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors">
            Email <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
