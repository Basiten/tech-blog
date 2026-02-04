# Technical Blog Design

**Date:** 2025-02-04
**Author:** Sunqizhen
**Status:** Approved

## Overview

A technical blog for sharing programming tutorials, code examples, and tech articles. Built with Astro for performance, Sanity for content management, and hosted on GitHub Pages.

## Architecture

### Tech Stack
- **Astro** - Static site generator optimized for content sites
- **Sanity CMS** - Headless CMS for content management
- **GitHub Pages** - Static hosting
- **Tailwind CSS** - Styling
- **GitHub Actions** - Automated deployment

### Data Flow
1. Author creates content in Sanity dashboard
2. Build fetches content from Sanity API
3. Astro generates static HTML/CSS
4. GitHub Actions deploys to GitHub Pages

## Site Structure

### Pages
- `/` - Home with recent posts and pagination
- `/blog/:slug` - Individual blog post
- `/tags/:tag` - Posts filtered by tag
- `/search` - Client-side search
- `/about` - About/bio page
- `/rss.xml` - RSS feed

### Components
- Header (logo, nav, dark mode toggle, search)
- Footer (copyright, social links, RSS)
- BlogCard (post preview)
- CodeBlock (syntax-highlighted code)
- TOC (table of contents)

### Layouts
- Base layout (global structure)
- Blog layout (blog-specific styling)
- Post layout (single post with sidebar)

## Content Models (Sanity)

### Blog Post
- Title, slug, excerpt
- Cover image (optional)
- Published date, reading time
- Content (portable text with code blocks)
- Tags, SEO metadata

### Tag
- Name, slug, description, color

### Author
- Name, bio, avatar, social links

### Site Settings
- Site title, description, logo, social links

## Design

### Visual Style
- Clean, minimal aesthetic
- Optimized for reading technical content
- System fonts or Inter for readability
- Mobile-first responsive design

### Themes
- Light mode: White background, dark text, blue/purple accent
- Dark mode: Dark background, light text, adjusted accent
- Theme toggle stored in localStorage

### Code Blocks
- Syntax highlighting (Shiki or Prism.js)
- Copy button
- Language label
- Support for 100+ languages

## Features

### Core Features
- Blog post listing with pagination
- Single post view with TOC
- Code syntax highlighting
- Tag filtering
- Client-side search (Fuse.js)
- Dark mode toggle
- RSS feed generation
- About page
- Social/email links (no contact form)

### SEO
- Sitemap generation
- OpenGraph metadata
- Canonical URLs
- Fast page loads (static HTML)

## Project Structure

```
/
├── src/
│   ├── components/     # Reusable components
│   ├── layouts/        # Page layouts
│   ├── pages/          # Route pages
│   └── styles/         # Global CSS
├── public/             # Static assets
├── sanity/             # Sanity configuration
├── astro.config.mjs    # Astro config
├── package.json        # Dependencies
└── .github/workflows/  # CI/CD
```

## Deployment

### GitHub Actions Workflow
1. Trigger on push to `main`
2. Install dependencies
3. Fetch content from Sanity
4. Build static files
5. Deploy to `gh-pages` branch
6. GitHub Pages serves the site

### Local Development
- `npm run dev` - Local dev server at localhost:4321
- `npm run build` - Production build
- Sanity studio at localhost:3333
