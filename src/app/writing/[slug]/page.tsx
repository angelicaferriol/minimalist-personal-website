import { getEssayBySlug, getEssays } from '@/lib/notion';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TextResizer } from '@/components/text-resizer';

export const revalidate = 60;

function formatEssayDate(dateStr: string) {
  if (!dateStr) return '';
  if (dateStr === '2016-2020' || dateStr === '2016–2020') return '2016-2020';
  const isoStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getRecommendations(currentEssay: any, allEssays: any[], count = 3) {
  const validEssays = allEssays.filter((item: any) => {
    if (!item || item.id === currentEssay.id || item.slug === currentEssay.slug) return false;
    const cat = (item.category || '').toLowerCase().replace(/[\s_-]+/g, '');
    if (cat.includes('fanfic')) return false;
    if (cat.includes('dailythought')) return false;
    return true;
  });

  // Prefer essays in the same category
  const currentCat = (currentEssay.category || '').toLowerCase().trim();
  const sameCategoryEssays = validEssays.filter(
    (item: any) => (item.category || '').toLowerCase().trim() === currentCat
  );

  const recommendations: any[] = [];

  for (const item of sameCategoryEssays) {
    if (recommendations.length >= count) break;
    recommendations.push(item);
  }

  // If fewer than count, fill with other visible writings
  if (recommendations.length < count) {
    for (const item of validEssays) {
      if (recommendations.length >= count) break;
      if (!recommendations.some(r => r.id === item.id)) {
        recommendations.push(item);
      }
    }
  }

  return recommendations;
}

export default async function EssayPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const [essay, allEssays] = await Promise.all([
    getEssayBySlug(slug),
    getEssays(),
  ]);

  if (!essay) {
    notFound();
  }

  const recommendations = getRecommendations(essay, allEssays);

  return (
    <article className="max-w-2xl mx-auto py-8 w-full">
      <Link 
        href="/writing" 
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        Back to writing
      </Link>
      
      <TextResizer 
        title={essay.title} 
        date={formatEssayDate(essay.date)}
      >
        <ReactMarkdown>{essay.content}</ReactMarkdown>
      </TextResizer>

      {recommendations.length > 0 && (
        <section className="mt-20 pt-10 border-t border-border/40">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {recommendations.map((item: any) => (
              <Link
                key={item.id}
                href={`/writing/${item.slug}`}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-foreground/30 transition-all duration-200"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] md:text-[11px] font-medium tracking-wider uppercase text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
