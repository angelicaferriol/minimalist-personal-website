import { getGalleryImages } from "@/lib/notion";
import { GalleryGrid } from "@/components/gallery-grid";
import { VideoList } from "@/components/video-list";

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await getGalleryImages();

  // Group images by category
  const groupedImages = images.reduce((acc: any, img: any) => {
    let category = img.category || 'Uncategorized';
    // Normalize names (e.g. video logs -> Video Logs)
    const lowerCategory = category.toLowerCase();
    if (lowerCategory === 'video logs') {
      category = 'Video Logs';
    } else {
      category = category.charAt(0).toUpperCase() + category.slice(1);
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(img);
    return acc;
  }, {});

  // Define preferred category order
  const CATEGORY_ORDER = ['Life', 'Video Logs', 'Art'];
  const categories = Object.keys(groupedImages).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col gap-12 w-full max-w-2xl mx-auto pt-0 pb-8">
      {images.length === 0 ? (
        <p className="text-muted-foreground text-sm">No images found yet. Add some to your Notion Gallery database!</p>
      ) : (
        <div className="flex flex-col gap-14">
          {categories.map(category => (
            category === 'Video Logs' ? (
              <VideoList key={category} title={category} videos={groupedImages[category]} />
            ) : (
              <GalleryGrid key={category} title={category} images={groupedImages[category]} />
            )
          ))}
        </div>
      )}
    </div>
  );
}
