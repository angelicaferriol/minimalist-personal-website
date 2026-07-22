import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

export const getEssays = async () => {
  if (!process.env.NOTION_WRITING_DB_ID) {
    console.warn("NOTION_WRITING_DB_ID is missing");
    return [];
  }
  
  const databaseId = process.env.NOTION_WRITING_DB_ID;
  const response = await notion.databases.query({
    database_id: databaseId,
  });

  return response.results.map((page: any) => {
    // Dynamically check for different property names to avoid crashes
    const titleProp = page.properties.Title || page.properties.Name;
    const dateProp = page.properties['Date Created'] || page.properties.Date;
    const slugProp = page.properties.Slug;

    return {
      id: page.id,
      title: titleProp?.title?.[0]?.plain_text || 'Untitled',
      // If they don't have a Slug property, fallback to using the Notion page ID as the URL
      slug: slugProp?.rich_text?.[0]?.plain_text || page.id,
      date: dateProp?.date?.start || page.created_time,
      description: page.properties.Description?.rich_text?.[0]?.plain_text || '',
      category: page.properties.Category?.select?.name || 'Uncategorized',
    };
  });
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
  
  const mdblocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdblocks);
  
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
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Title',
        direction: 'ascending',
      },
    ],
  });

  return response.results.map((page: any) => {
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
  } catch (error) {}

  if (!page) {
    try {
      page = await notion.pages.retrieve({ page_id: slugOrId });
    } catch (error) {
      return null;
    }
  }

  if (!page) return null;
  
  const mdblocks = await n2m.pageToMarkdown(page.id);
  const mdString = n2m.toMarkdownString(mdblocks);
  
  const titleProp = (page as any).properties.Title || (page as any).properties.Name;
  const authorProp = (page as any).properties.Author;

  return {
    id: page.id,
    title: titleProp?.title?.[0]?.plain_text || 'Unknown Title',
    author: authorProp?.rich_text?.[0]?.plain_text || 'Unknown Author',
    content: mdString.parent,
  };
};

export const getGalleryImages = async () => {
  if (!process.env.NOTION_GALLERY_DB_ID) {
    console.warn("NOTION_GALLERY_DB_ID is missing");
    return [];
  }
  
  const databaseId = process.env.NOTION_GALLERY_DB_ID;
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  return response.results.map((page: any) => {
    // The user might have named their properties differently
    const titleProp = page.properties.Title || page.properties.Name || page.properties['image description'];
    const dateProp = page.properties.Date;
    const imageProp = page.properties.Image || page.properties['Files & media'];

    let imageUrl = null;
    if (imageProp?.files && imageProp.files.length > 0) {
      const file = imageProp.files[0];
      imageUrl = file.file ? file.file.url : file.external.url;
    }

    return {
      id: page.id,
      title: titleProp?.title?.[0]?.plain_text || '',
      date: dateProp?.date?.start || (page as any).created_time,
      imageUrl,
    };
  }).filter((img: any) => img.imageUrl !== null);
};
