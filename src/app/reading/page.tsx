import { getBooks } from "@/lib/notion";
import { BookList } from "@/components/book-list";

export const revalidate = 60;

export default async function ReadingPage() {
  const books = await getBooks();

  const inProgress = books.filter(b => b.status === "In progress" || b.status === "Reading");
  const completed = books.filter(b => b.status === "Done" || b.status === "Completed");
  const upNext = books.filter(b => b.status === "Not started" || b.status === "To Be Read");

  return (
    <div className="flex flex-col gap-12 w-full max-w-2xl mx-auto py-8">
      {books.length === 0 ? (
        <p className="text-muted-foreground text-sm">No books found yet. Add some in Notion!</p>
      ) : (
        <>
          <BookList title="Currently Reading" list={inProgress} />
          <BookList title="Up Next" list={upNext} />
          <BookList title="Completed" list={completed} />
        </>
      )}
    </div>
  );
}
