import { Client } from '@notionhq/client';
import fs from 'fs';

// simple .env parser
const envFile = fs.readFileSync('.env', 'utf-8');
for (const line of envFile.split('\n')) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    const val = valueParts.join('=').trim();
    if (!val.startsWith('#')) {
      process.env[key.trim()] = val;
    }
  }
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function run() {
  const pageId = "3a522548-ef63-80d5-91a7-deb19540c7da"; // hyperfixations and changes
  const response = await notion.blocks.children.list({
    block_id: pageId,
  });
  console.log(JSON.stringify(response.results, null, 2));
}
run();
