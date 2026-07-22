// Script to import Goodreads CSV into Notion Reading database
// Usage: node scripts/import-goodreads.mjs

import { Client } from '@notionhq/client';
import { readFileSync } from 'fs';

const NOTION_API_KEY = 'ntn_W92154714594UdUKoWKAcVlquyDoi4dkIwKbIlAWm4p0mc';
const DATABASE_ID = '17222548ef6381c5b110f811e3c19b6e';

const notion = new Client({ auth: NOTION_API_KEY });

// ── CSV Parser (handles quoted fields with commas & newlines) ────────
function parseCSV(csvContent) {
  const rows = [];
  let headers = null;
  let currentFields = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const ch = csvContent[i];

    if (ch === '"') {
      if (inQuotes && i + 1 < csvContent.length && csvContent[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      currentFields.push(currentField);
      currentField = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && i + 1 < csvContent.length && csvContent[i + 1] === '\n') {
        i++; // skip \r\n
      }
      currentFields.push(currentField);
      currentField = '';

      if (currentFields.length > 1 || currentFields[0].trim()) {
        if (!headers) {
          headers = currentFields.map(f => f.trim());
        } else {
          const row = {};
          headers.forEach((h, idx) => {
            row[h] = (currentFields[idx] || '').trim();
          });
          rows.push(row);
        }
      }
      currentFields = [];
    } else {
      currentField += ch;
    }
  }

  // Handle last line without trailing newline
  if (currentField || currentFields.length > 0) {
    currentFields.push(currentField);
    if (headers && (currentFields.length > 1 || currentFields[0].trim())) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = (currentFields[idx] || '').trim();
      });
      rows.push(row);
    }
  }

  return rows;
}

// ── Map Goodreads shelf to Notion status ────────────────────────────
function mapStatus(shelf) {
  switch (shelf) {
    case 'read': return 'Done';
    case 'currently-reading': return 'In progress';
    case 'to-read': return 'Not started';
    case 'did-not-finish': return 'Not started';
    default: return 'Not started';
  }
}

// ── Map Goodreads rating to Notion rating (using ⭐️ emoji) ─────────
function mapRating(ratingStr) {
  const r = parseFloat(ratingStr);
  if (!r || r === 0) return null;
  const count = Math.round(r);
  return '⭐️'.repeat(count);
}

// ── Map Goodreads bookshelves → single Notion Genre ─────────────────
// The Notion DB uses a single select for Genre, so pick the best match
const SHELF_TO_GENRE = {
  'russian-literature': 'Classics',
  'japanese-literature': 'Classics',
  'poetry': 'Poetry',
  'memoir': 'Memoir',
  'self-help': 'Self-help',
  'business-career': 'Business',
  'technology': 'Nonfiction',
  'friends-recommendation': null,
  'physically-owned': null,
  'favorites': null,
  'highly-recommended': null,
  'to-read': null,
  'currently-reading': null,
};

function extractGenre(bookshelves) {
  if (!bookshelves) return null;
  const shelves = bookshelves.split(',').map(s => s.trim());
  for (const shelf of shelves) {
    const genre = SHELF_TO_GENRE[shelf];
    if (genre) return genre;
  }
  return null;
}

// ── Clean HTML from review text ─────────────────────────────────────
function cleanReview(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?i>/gi, '')
    .replace(/<\/?b>/gi, '')
    .replace(/<\/?s>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// ── Get existing pages to avoid duplicates ──────────────────────────
async function getExistingTitles() {
  const titles = new Set();
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor,
    });

    for (const page of response.results) {
      const titleProp = page.properties.Title || page.properties.Name;
      const title = titleProp?.title?.[0]?.plain_text;
      if (title) titles.add(title.toLowerCase());
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  console.log(`Found ${titles.size} existing books in Notion`);
  return titles;
}

// ── Build page properties ───────────────────────────────────────────
function buildPageProperties(row) {
  const title = row['Title'] || 'Untitled';
  const author = row['Author'] || '';
  const rating = mapRating(row['My Rating']);
  const status = mapStatus(row['Exclusive Shelf']);
  const dateRead = row['Date Read'] ? row['Date Read'].replace(/\//g, '-') : null;
  const genre = extractGenre(row['Bookshelves']);

  const properties = {
    'Title': { title: [{ text: { content: title } }] },
    'Author': { rich_text: [{ text: { content: author } }] },
    'Status': { status: { name: status } },
  };

  if (rating) {
    properties['Rating'] = { select: { name: rating } };
  }

  if (dateRead) {
    properties['Date Finished'] = { date: { start: dateRead } };
  }

  if (genre) {
    properties['Genre'] = { select: { name: genre } };
  }

  return properties;
}

// ── Build review as page content blocks ─────────────────────────────
function buildReviewBlocks(reviewText) {
  if (!reviewText) return [];

  const cleaned = cleanReview(reviewText);
  if (!cleaned) return [];

  // Split into paragraphs
  const paragraphs = cleaned.split('\n').filter(p => p.trim());

  return paragraphs.map(para => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: { content: para.substring(0, 2000) } // Notion's 2000-char limit per text block
      }]
    }
  }));
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('📚 Goodreads → Notion Importer\n');

  // Parse CSV
  const csvPath = new URL('../src/app/reading/goodreads_library_export.csv', import.meta.url);
  const csvContent = readFileSync(csvPath, 'utf-8');
  const books = parseCSV(csvContent);
  console.log(`📖 Found ${books.length} books in Goodreads CSV`);

  // Get existing titles to skip duplicates
  const existingTitles = await getExistingTitles();
  console.log('');

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const book of books) {
    const title = book['Title'] || 'Untitled';

    // Skip duplicates
    if (existingTitles.has(title.toLowerCase())) {
      console.log(`⏭️  Skip (exists): ${title}`);
      skipped++;
      continue;
    }

    try {
      const properties = buildPageProperties(book);
      const reviewBlocks = buildReviewBlocks(book['My Review']);

      const createParams = {
        parent: { database_id: DATABASE_ID },
        properties,
      };

      if (reviewBlocks.length > 0) {
        createParams.children = reviewBlocks;
      }

      await notion.pages.create(createParams);
      imported++;
      console.log(`✅ ${title}${reviewBlocks.length > 0 ? ' (+ review)' : ''}`);

      // Rate limit: ~3 req/sec
      await new Promise(r => setTimeout(r, 350));
    } catch (err) {
      errors++;
      console.error(`❌ ${title} — ${err.message}`);
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped:  ${skipped}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log(`📊 Total:    ${books.length}`);
}

main().catch(console.error);
