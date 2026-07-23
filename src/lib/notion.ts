import { APIErrorCode, APIResponseError, Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

function isNotionAuthError(error: unknown) {
  return APIResponseError.isAPIResponseError(error) && error.code === APIErrorCode.Unauthorized;
}

function isNotionUnavailableError(error: unknown) {
  return APIResponseError.isAPIResponseError(error) && error.code === APIErrorCode.ObjectNotFound;
}

export const getEssays = async () => {
  if (!process.env.NOTION_WRITING_DB_ID) {
    console.warn("NOTION_WRITING_DB_ID is missing");
    return [];
  }
  
  const databaseId = process.env.NOTION_WRITING_DB_ID;
  let response;

  try {
    response = await notion.databases.query({
      database_id: databaseId,
    });
  } catch (error) {
    if (isNotionAuthError(error)) {
      console.warn('NOTION_API_KEY is invalid or revoked; returning no essays');
      return [];
    }
    if (isNotionUnavailableError(error)) {
      console.warn('NOTION_WRITING_DB_ID is not shared with the integration or does not exist; returning no essays');
      return [];
    }
    throw error;
  }

  const essays = await Promise.all(response.results.map(async (page: any) => {
    // Dynamically check for different property names to avoid crashes
    const titleProp = page.properties.Title || page.properties.Name;
    const dateProp = page.properties['Date Created'] || page.properties.Date;
    const slugProp = page.properties.Slug;
    const category = page.properties.Category?.select?.name || 'Uncategorized';

    let thoughts: any[] = [];
    if (category === 'Daily Thoughts') {
      try {
        const blocksResponse = await notion.blocks.children.list({
          block_id: page.id,
        });
        thoughts = blocksResponse.results
          .map((block: any) => {
            const type = block.type;
            const richText = block[type]?.rich_text;
            if (!richText) return null;
            const text = richText.map((t: any) => t.plain_text).join('');
            if (!text.trim()) return null;
            return {
              id: block.id,
              text,
              createdTime: block.created_time,
            };
          })
          .filter(Boolean);
      } catch (error) {
        console.error(`Failed to fetch blocks for page ${page.id}:`, error);
      }
    }

    return {
      id: page.id,
      title: titleProp?.title?.[0]?.plain_text || 'Untitled',
      // If they don't have a Slug property, fallback to using the Notion page ID as the URL
      slug: slugProp?.rich_text?.[0]?.plain_text || page.id,
      date: dateProp?.date?.start || page.created_time,
      description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
      category,
      createdTime: page.created_time,
      thoughts,
      url: page.properties.URL?.url || null,
    };
  }));

  return essays;
};

export const getEssayBySlug = async (slugOrId: string) => {
  if (!process.env.NOTION_WRITING_DB_ID) return null;
  const databaseId = process.env.NOTION_WRITING_DB_ID;
  
  let page;

  try {
    // First, let's try to query by Slug (if they created the property)
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slugOrId,
        },
      },
    });
    
    if (response.results.length > 0) {
      page = response.results[0];
    }
  } catch (error) {
    if (isNotionAuthError(error) || isNotionUnavailableError(error)) {
      console.warn('NOTION_WRITING_DB_ID is not accessible; unable to load essay content');
      return null;
    }
    // If querying by Slug fails (e.g. property doesn't exist), we will catch the error silently
  }

  // If we still don't have a page, assume the slug is actually the page ID (fallback)
  if (!page) {
    try {
      page = await notion.pages.retrieve({ page_id: slugOrId });
    } catch (error) {
      return null;
    }
  }

  if (!page) return null;
  let mdString;

  try {
    const mdblocks = await n2m.pageToMarkdown(page.id);
    mdString = n2m.toMarkdownString(mdblocks);
  } catch (error) {
    if (isNotionAuthError(error)) {
      console.warn('NOTION_API_KEY is invalid or revoked; unable to load essay content');
      return null;
    }
    throw error;
  }
  
  const titleProp = (page as any).properties.Title || (page as any).properties.Name;
  const dateProp = (page as any).properties['Date Created'] || (page as any).properties.Date;

  return {
    id: page.id,
    title: titleProp?.title?.[0]?.plain_text || 'Untitled',
    date: dateProp?.date?.start || (page as any).created_time,
    content: mdString.parent,
  };
};

export const getBooks = async () => {
  if (!process.env.NOTION_READING_DB_ID) {
    console.warn("NOTION_READING_DB_ID is missing");
    return [];
  }
  
  const databaseId = process.env.NOTION_READING_DB_ID;
  const allResults: any[] = [];
  let cursor: string | undefined;

  try {
    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        sorts: [
          {
            property: 'Title',
            direction: 'ascending',
          },
        ],
      });
      allResults.push(...response.results);
      cursor = response.has_more ? response.next_cursor! : undefined;
    } while (cursor);
  } catch (error) {
    if (isNotionAuthError(error)) {
      console.warn('NOTION_API_KEY is invalid or revoked; returning no books');
      return [];
    }
    if (isNotionUnavailableError(error)) {
      console.warn('NOTION_READING_DB_ID is not shared with the integration or does not exist; returning no books');
      return [];
    }
    throw error;
  }

  return allResults.map((page: any) => {
    const titleProp = page.properties.Title || page.properties.Name;
    const authorProp = page.properties.Author;
    const genreProp = page.properties.Genre;
    const statusProp = page.properties.Status;
    const ratingProp = page.properties.Rating;
    const dateProp = page.properties['Date Finished'];

    const slugProp = page.properties.Slug;

    let genre = [];
    if (genreProp?.multi_select) {
      genre = genreProp.multi_select.map((s: any) => s.name);
    } else if (genreProp?.select) {
      genre = [genreProp.select.name];
    }

    return {
      id: page.id,
      title: titleProp?.title?.[0]?.plain_text || 'Unknown Title',
      slug: slugProp?.rich_text?.[0]?.plain_text || page.id,
      author: authorProp?.rich_text?.[0]?.plain_text || 'Unknown Author',
      genre,
      status: statusProp?.status?.name || statusProp?.select?.name || 'Not started',
      rating: ratingProp?.select?.name || null,
      dateFinished: dateProp?.date?.start || null,
    };
  });
};

export const getBookBySlugOrId = async (slugOrId: string) => {
  if (!process.env.NOTION_READING_DB_ID) return null;
  const databaseId = process.env.NOTION_READING_DB_ID;
  
  let page;

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slugOrId,
        },
      },
    });
    
    if (response.results.length > 0) {
      page = response.results[0];
    }
  } catch (error) {
    if (isNotionAuthError(error) || isNotionUnavailableError(error)) {
      console.warn('NOTION_READING_DB_ID is not accessible; unable to load book content');
      return null;
    }
  }

  if (!page) {
    try {
      page = await notion.pages.retrieve({ page_id: slugOrId });
    } catch (error) {
      return null;
    }
  }

  if (!page) return null;
  let mdString;

  try {
    const mdblocks = await n2m.pageToMarkdown(page.id);
    mdString = n2m.toMarkdownString(mdblocks);
  } catch (error) {
    if (isNotionAuthError(error)) {
      console.warn('NOTION_API_KEY is invalid or revoked; unable to load book content');
      return null;
    }
    throw error;
  }
  
  const titleProp = (page as any).properties.Title || (page as any).properties.Name;
  const authorProp = (page as any).properties.Author;

  return {
    id: page.id,
    title: titleProp?.title?.[0]?.plain_text || 'Unknown Title',
    author: authorProp?.rich_text?.[0]?.plain_text || 'Unknown Author',
    content: mdString.parent,
  };
};

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.ogv'];

function getMediaType(url: string): 'video' | 'image' {
  try {
    // Strip query params and get the pathname
    const pathname = new URL(url).pathname.toLowerCase();
    if (VIDEO_EXTENSIONS.some(ext => pathname.endsWith(ext))) return 'video';
  } catch {
    // If URL parsing fails, check the raw string
    const lower = url.toLowerCase();
    if (VIDEO_EXTENSIONS.some(ext => lower.includes(ext))) return 'video';
  }
  return 'image';
}

export const getGalleryImages = async () => {
  if (!process.env.NOTION_GALLERY_DB_ID) {
    console.warn("NOTION_GALLERY_DB_ID is missing");
    return [];
  }
  
  const databaseId = process.env.NOTION_GALLERY_DB_ID;
  let response;

  try {
    response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });
  } catch (error) {
    if (isNotionAuthError(error)) {
      console.warn('NOTION_API_KEY is invalid or revoked; returning no gallery images');
      return [];
    }
    if (isNotionUnavailableError(error)) {
      console.warn('NOTION_GALLERY_DB_ID is not shared with the integration or does not exist; returning no gallery images');
      return [];
    }
    throw error;
  }

  return response.results.map((page: any) => {
    // Skip if Status is Archived
    const status = page.properties.Status?.select?.name || page.properties.Status?.status?.name;
    if (status === 'Archived') return null;

    // The user might have named their properties differently
    const titleProp = page.properties.Title || page.properties.Name || page.properties['image description'];
    const dateProp = page.properties.Date;
    const imageProp = page.properties.Image || page.properties['Files & media'];

    const media: { url: string; type: 'image' | 'video' }[] = [];
    if (imageProp?.files && imageProp.files.length > 0) {
      for (const file of imageProp.files) {
        const url = file.file ? file.file.url : file.external?.url;
        if (url) {
          media.push({ url, type: getMediaType(url) });
        }
      }
    }

    const cover = media[0] || null;
    const category = page.properties.Category?.select?.name || 'Uncategorized';

    return {
      id: page.id,
      title: titleProp?.title?.[0]?.plain_text || '',
      date: dateProp?.date?.start || (page as any).created_time,
      imageUrl: cover?.url || null,
      coverType: cover?.type || 'image',
      media, // all media items for carousel (images + videos)
      category,
    };
  }).filter((item: any) => item !== null && item.imageUrl !== null);
};

export const getProjects = async () => {
  if (!process.env.NOTION_PROJECTS_DB_ID) {
    console.warn("NOTION_PROJECTS_DB_ID is missing");
    return [];
  }
  
  const databaseId = process.env.NOTION_PROJECTS_DB_ID;
  let response;

  try {
    response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'ascending',
        },
      ],
    });
  } catch (error) {
    if (isNotionAuthError(error)) {
      console.warn('NOTION_API_KEY is invalid or revoked; returning no projects');
      return [];
    }
    if (isNotionUnavailableError(error)) {
      console.warn('NOTION_PROJECTS_DB_ID is not shared with the integration or does not exist; returning no projects');
      return [];
    }
    throw error;
  }

  return response.results.map((page: any) => {
    const nameProp = page.properties.Name;
    const linkProp = page.properties.Link;
    const textProp = page.properties.Text;
    const techProp = page.properties['Tech Stacks'];
    const categoryProp = page.properties.Category;

    const name = nameProp?.title?.[0]?.plain_text || 'Untitled';
    const link = linkProp?.url || '#';
    const description = textProp?.rich_text?.[0]?.plain_text || '';
    const techStacks = techProp?.multi_select?.map((s: any) => s.name) || [];
    const category = categoryProp?.select?.name || 'Uncategorized';

    return {
      id: page.id,
      name,
      link,
      description,
      techStacks,
      category,
    };
  });
};
