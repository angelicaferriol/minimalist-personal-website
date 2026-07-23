// Script to update existing Notion pages with Goodreads reviews
// For books that were already in Notion before the import (skipped as duplicates)

import { Client } from '@notionhq/client';
import { readFileSync } from 'fs';

const NOTION_API_KEY = 'ntn_W92154714594UdUKoWKAcVlquyDoi4dkIwKbIlAWm4p0mc';
const DATABASE_ID = '17222548ef6381c5b110f811e3c19b6e';

const notion = new Client({ auth: NOTION_API_KEY });

// ── CSV Parser ──────────────────────────────────────────────────────
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
      if (ch === '\r' && i + 1 < csvContent.length && csvContent[i + 1] === '\n') i++;
      currentFields.push(currentField);
      currentField = '';
      if (currentFields.length > 1 || currentFields[0].trim()) {
        if (!headers) {
          headers = currentFields.map(f => f.trim());
        } else {
          const row = {};
          headers.forEach((h, idx) => { row[h] = (currentFields[idx] || '').trim(); });
          rows.push(row);
        }
      }
      currentFields = [];
    } else {
      currentField += ch;
    }
  }
  if (currentField || currentFields.length > 0) {
    currentFields.push(currentField);
    if (headers && (currentFields.length > 1 || currentFields[0].trim())) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = (currentFields[idx] || '').trim(); });
      rows.push(row);
    }
  }
  return rows;
}

// ── Clean HTML from review ──────────────────────────────────────────
function cleanReview(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[ibs]>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// ── Get ALL existing pages with their IDs ───────────────────────────
async function getExistingPages() {
  const pages = new Map(); // title (lowercase) -> page_id
  let cursor;

  do {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor,
    });

    for (const page of response.results) {
      const titleProp = page.properties.Title || page.properties.Name;
      const title = titleProp?.title?.[0]?.plain_text;
      if (title) pages.set(title.toLowerCase(), page.id);
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return pages;
}

// ── Check if page already has content ───────────────────────────────
async function pageHasContent(pageId) {
  const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 1 });
  return blocks.results.length > 0;
}

// ── Build review blocks ─────────────────────────────────────────────
function buildReviewBlocks(reviewText) {
  const cleaned = cleanReview(reviewText);
  if (!cleaned) return [];
  const paragraphs = cleaned.split('\n').filter(p => p.trim());
  return paragraphs.map(para => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{
        type: 'text',
        text: { content: para.substring(0, 2000) }
      }]
    }
  }));
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('📝 Adding missing reviews to Notion pages\n');

  // Parse CSV
  const csvPath = new URL('../src/app/reading/goodreads_library_export.csv', import.meta.url);
  const csvContent = readFileSync(csvPath, 'utf-8');
  const books = parseCSV(csvContent);

  // Build a map of title -> review from CSV
  const reviewMap = new Map();
  for (const book of books) {
    const title = (book['Title'] || '').toLowerCase();
    const review = book['My Review'] || '';
    if (title && review.trim()) {
      reviewMap.set(title, review);
    }
  }
  console.log(`📖 Found ${reviewMap.size} books with reviews in CSV`);

  // Get all existing Notion pages
  const existingPages = await getExistingPages();
  console.log(`📚 Found ${existingPages.size} books in Notion\n`);

  let updated = 0;
  let skippedNoReview = 0;
  let skippedHasContent = 0;
  let errors = 0;

  for (const [title, pageId] of existingPages) {
    const review = reviewMap.get(title);

    if (!review) {
      skippedNoReview++;
      continue;
    }

    try {
      // Check if page already has content (don't overwrite)
      const hasContent = await pageHasContent(pageId);
      if (hasContent) {
        console.log(`⏭️  Already has content: ${title}`);
        skippedHasContent++;
        await new Promise(r => setTimeout(r, 200));
        continue;
      }

      // Append review blocks
      const blocks = buildReviewBlocks(review);
      if (blocks.length === 0) {
        skippedNoReview++;
        continue;
      }

      await notion.blocks.children.append({
        block_id: pageId,
        children: blocks,
      });

      updated++;
      console.log(`✅ Added review: ${title}`);
      await new Promise(r => setTimeout(r, 350));

    } catch (err) {
      errors++;
      console.error(`❌ ${title} — ${err.message}`);
    }
  }

  console.log(`\n${'─'.repeat(40)}`);
  console.log(`✅ Updated:              ${updated}`);
  console.log(`⏭️  Already has content:  ${skippedHasContent}`);
  console.log(`📭 No review in CSV:     ${skippedNoReview}`);
  console.log(`❌ Errors:               ${errors}`);
}

main().catch(console.error);
