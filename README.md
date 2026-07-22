# Minimalist Personal Website

A personal website and blog built with Next.js, Tailwind CSS, and seamlessly integrated with Notion as a headless CMS.

## Features

- **Minimalist Design:** Clean aesthetics, heavily focused on typography, whitespace, and a beautiful dark/light mode toggle.
- **Notion CMS Integration:** Add and manage content entirely through Notion without touching a single line of code!
  - **Writing:** Publishes essays and blog posts directly from a Notion database (supports full Markdown rendering).
  - **Reading Corner:** Tracks and categorizes books you are currently reading, want to read, or have finished, complete with dynamic ratings and genres.
  - **Gallery:** An Instagram-style, responsive photo grid with a built-in zoomable lightbox overlay. 
- **Lightning Fast:** Built on Next.js 16 (App Router) for static rendering and blazing fast page loads.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **CMS:** [Notion API](https://developers.notion.com/) (`@notionhq/client`)
- **Markdown Rendering:** `notion-to-md` & `react-markdown`
- **Icons:** [Lucide React](https://lucide.dev/)
- **Theme Management:** `next-themes`

## Structure

- `src/app/` - The core Next.js routing structure (pages for Home, Writing, Reading, Gallery, Projects).
- `src/components/` - Reusable UI elements (Navbar, ThemeToggle, GalleryGrid, BookList).
- `src/lib/notion.ts` - The powerhouse file that securely connects to and queries your Notion databases.
