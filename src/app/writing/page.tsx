import { getEssays } from '@/lib/notion';
import { CategoryList } from '@/components/category-list';
import { DailyThoughts } from '@/components/daily-thoughts';

export const revalidate = 60;

function isFanfictionCategory(category: string): boolean {
  const norm = category.toLowerCase().replace(/[\s_-]+/g, '');
  return norm.includes('fanfic');
}

const CATEGORY_ORDER = [
  'Daily Thoughts',
  'Daily Thought',
  'Personal Essay',
  'Personal Essays',
  'Poem, Proses, Short Stories',
  'Poem, Prose, Short Stories',
  'Poem Proses Short Stories',
  'Poems, Prose, Short Stories',
  'Poems, Proses, Short Stories',
  'Poem',
  'Poems',
  'Poetry',
  'Proses',
  'Prose',
  'Short Stories',
  'Short Story',
];

function getCategoryRank(category: string): number {
  const directIndex = CATEGORY_ORDER.indexOf(category);
  if (directIndex !== -1) return directIndex;

  const norm = category.toLowerCase().trim();
  const caseIndex = CATEGORY_ORDER.findIndex(c => c.toLowerCase() === norm);
  if (caseIndex !== -1) return caseIndex;

  const clean = norm.replace(/[^a-z0-9]/g, ' ');
  const hasPoem = clean.includes('poem') || clean.includes('poetry');
  const hasProse = clean.includes('prose');
  const hasStories = clean.includes('stor') || clean.includes('short');

  // Combined Poem, Prose(s), Short Stories category (placed right after Personal Essay)
  if (hasPoem && (hasProse || hasStories)) {
    return 2;
  }

  // Individual categories
  if (hasPoem) return 7; // Poem / Poems / Poetry
  if (hasProse) return 10; // Proses / Prose
  if (hasStories) return 12; // Short Stories / Short Story

  return Infinity;
}

export default async function WritingPage() {
  const allEssays = await getEssays();
  const essays = allEssays.filter((essay: any) => !isFanfictionCategory(essay.category || ''));

  // Group essays by category
  const groupedEssays = essays.reduce((acc: any, essay: any) => {
    const category = essay.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(essay);
    return acc;
  }, {});

  function getEssaySortTime(essay: any): number {
    if (!essay.date) return 0;
    if (essay.date === '2016-2020' || essay.date === '2016–2020') {
      return new Date('2020-01-01T00:00:00Z').getTime();
    }
    const t = new Date(essay.date).getTime();
    return isNaN(t) ? 0 : t;
  }

  // Sort essays within each category by date descending
  Object.keys(groupedEssays).forEach(category => {
    groupedEssays[category].sort((a: any, b: any) => {
      const timeA = getEssaySortTime(a);
      const timeB = getEssaySortTime(b);
      if (timeB !== timeA) return timeB - timeA;
      const createA = new Date(a.createdTime || 0).getTime();
      const createB = new Date(b.createdTime || 0).getTime();
      if (!isNaN(createA) && !isNaN(createB) && createB !== createA) {
        return createB - createA;
      }
      return (a.title || '').localeCompare(b.title || '');
    });
  });

  const categories = Object.keys(groupedEssays)
    .filter(category => !isFanfictionCategory(category))
    .sort((a, b) => {
      const rankA = getCategoryRank(a);
      const rankB = getCategoryRank(b);
      if (rankA !== Infinity && rankB !== Infinity) return rankA - rankB;
      if (rankA !== Infinity) return -1;
      if (rankB !== Infinity) return 1;
      return a.localeCompare(b);
    });

  return (
    <div className="flex flex-col gap-12 w-full max-w-2xl mx-auto pt-0 pb-8">
      {essays.length === 0 ? (
        <p className="text-muted-foreground text-sm">No essays found yet. Add some in Notion!</p>
      ) : (
        <div className="flex flex-col gap-14">
          {categories.map(category => {
            const isDaily = category.toLowerCase().replace(/[\s_-]+/g, '').includes('dailythought');
            if (isDaily) {
              return (
                <DailyThoughts key={category} essays={groupedEssays[category]} />
              );
            }
            return (
              <CategoryList key={category} category={category} essays={groupedEssays[category]} />
            );
          })}
        </div>
      )}
    </div>
  );
}
