import { getEssayBySlug } from '@/lib/notion';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TextResizer } from '@/components/text-resizer';

export const revalidate = 60;

function formatEssayDate(dateStr: string) {
  if (!dateStr) return '';
  const isoStr = dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function EssayPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const essay = await getEssayBySlug(slug);

  if (!essay) {
    notFound();
  }

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
    </article>
  );
}
