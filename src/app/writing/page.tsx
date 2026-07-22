import { getEssays } from '@/lib/notion';
import { CategoryList } from '@/components/category-list';

export const revalidate = 60;

export default async function WritingPage() {
  const essays = await getEssays();

  // Group essays by category
  const groupedEssays = essays.reduce((acc: any, essay: any) => {
    const category = essay.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(essay);
    return acc;
  }, {});

  // Sort essays within each category by date descending
  Object.keys(groupedEssays).forEach(category => {
    groupedEssays[category].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  const categories = Object.keys(groupedEssays).sort();

  return (
    <div className="flex flex-col gap-12 w-full max-w-2xl mx-auto py-8">
      {essays.length === 0 ? (
        <p className="text-muted-foreground text-sm">No essays found yet. Add some in Notion!</p>
      ) : (
        <div className="flex flex-col gap-14">
          {categories.map(category => (
            <CategoryList key={category} category={category} essays={groupedEssays[category]} />
          ))}
        </div>
      )}
    </div>
  );
}
