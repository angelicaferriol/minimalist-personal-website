import { getBookBySlugOrId } from '@/lib/notion';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TextResizer } from '@/components/text-resizer';

export const revalidate = 60;

export default async function BookPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const book = await getBookBySlugOrId(slug);

  if (!book) {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto py-8 w-full">
      <Link 
        href="/reading" 
        className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        Back to reading
      </Link>
      
      <TextResizer 
        title={book.title} 
        date={book.author}
      >
        {book.content && book.content.trim().length > 0 ? (
          <ReactMarkdown>{book.content}</ReactMarkdown>
        ) : (
          <p className="text-muted-foreground italic">No notes are added yet.</p>
        )}
      </TextResizer>
    </article>
  );
}
