import { getGalleryImages } from "@/lib/notion";
import { GalleryGrid } from "@/components/gallery-grid";

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="flex flex-col gap-12 w-full max-w-2xl mx-auto py-8">
      {images.length === 0 ? (
        <p className="text-muted-foreground text-sm">No images found yet. Add some to your Notion Gallery database!</p>
      ) : (
        <GalleryGrid images={images} />
      )}
    </div>
  );
}
