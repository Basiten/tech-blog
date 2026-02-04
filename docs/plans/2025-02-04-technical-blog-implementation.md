# Technical Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a technical blog with Astro, Sanity CMS, and GitHub Pages deployment

**Architecture:** Static site generator (Astro) fetches content from headless CMS (Sanity) during build, deploys to GitHub Pages via GitHub Actions.

**Tech Stack:** Astro, Sanity CMS, Tailwind CSS, TypeScript, GitHub Actions, Shiki (syntax highlighting), Fuse.js (search)

---

## Task 1: Initialize Astro Project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/` directory structure

**Step 1: Create package.json**

```bash
npm create astro@latest . -- --template blog --no-install --no-git --typescript strict
```

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Install additional dependencies**

```bash
npm install @astrojs/tailwind tailwindcss @astrojs/rss @sanity/astro fuse.js shiki
npm install -D @types/node
```

**Step 4: Configure Tailwind**

Run: `npx astro add tailwind`

**Step 5: Commit**

```bash
git add .
git commit -m "feat: initialize Astro project with Tailwind"
```

---

## Task 2: Set Up Sanity CMS

**Files:**
- Create: `sanity/schemas/schema.ts`
- Create: `sanity/config.ts`
- Create: `sanity/schemaTypes.ts`

**Step 1: Create Sanity project**

```bash
npx @sanity/cli init
# Choose: Create new project
# Use project name: tech-blog
# Use the default dataset configuration
```

**Step 2: Install Astro integration**

```bash
npm install @sanity/astro
```

**Step 3: Configure Astro integration**

Add to `astro.config.mjs`:

```typescript
import sanity from '@sanity/astro'

export default defineConfig({
  integrations: [
    sanity({
      projectId: 'your-project-id',
      dataset: 'production',
    }),
  ],
})
```

**Step 4: Create blog post schema**

Create `sanity/schemas/blogPost.ts`:

```typescript
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() },
    { name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 },
    { name: 'publishedAt', title: 'Published At', type: 'datetime', initialValue: () => new Date().toISOString() },
    { name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }], validation: Rule => Rule.required() },
    { name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'reference', to: { type: 'tag' } }] },
  ],
}
```

**Step 5: Create tag schema**

Create `sanity/schemas/tag.ts`:

```typescript
export default {
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'description', title: 'Description', type: 'text' },
  ],
}
```

**Step 6: Create main schema file**

Create `sanity/schemas/index.ts`:

```typescript
import blogPost from './blogPost'
import tag from './tag'

export const schema = {
  types: [blogPost, tag],
}
```

**Step 7: Commit**

```bash
git add sanity/ astro.config.mjs package.json
git commit -m "feat: add Sanity CMS configuration and schemas"
```

---

## Task 3: Create Base Layout and Components

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/BlogCard.astro`

**Step 1: Create BaseLayout.astro**

Create `src/layouts/BaseLayout.astro`:

```astro
---
interface Props {
  title?: string;
  description?: string;
}

const { title = 'Tech Blog', description = 'A technical blog' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Step 2: Create Header.astro**

Create `src/components/Header.astro`:

```astro
---
const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
];
---

<header class="border-b border-gray-200 dark:border-gray-800">
  <nav class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
    <a href="/" class="text-xl font-bold">Tech Blog</a>
    <ul class="flex gap-4">
      {navItems.map(item => (
        <li><a href={item.href} class="hover:text-blue-500">{item.name}</a></      li>
      ))}
    </ul>
  </nav>
</header>
```

**Step 3: Create Footer.astro**

Create `src/components/Footer.astro`:

```astro
---
const currentYear = new Date().getFullYear();
---

<footer class="border-t border-gray-200 dark:border-gray-800 mt-12">
  <div class="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600">
    <p>&copy; {currentYear} Tech Blog. Built with Astro and Sanity.</p>
  </div>
</footer>
```

**Step 4: Create BlogCard.astro**

Create `src/components/BlogCard.astro`:

```astro
---
interface Props {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  tags?: Array<{ name: string }>;
}

const { title, slug, excerpt, publishedAt, tags = [] } = Astro.props;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
---

<article class="border-b border-gray-200 dark:border-gray-800 py-8">
  <a href={`/blog/${slug}`}>
    <h2 class="text-2xl font-bold mb-2 hover:text-blue-500">{title}</h2>
  </a>
  <time class="text-gray-500 text-sm">{formatDate(publishedAt)}</time>
  {excerpt && <p class="mt-3 text-gray-700 dark:text-gray-300">{excerpt}</p>}
  {tags.length > 0 && (
    <div class="mt-3 flex gap-2 flex-wrap">
      {tags.map(tag => (
        <span class="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
          {tag.name}
        </span>
      ))}
    </div>
  )}
</article>
```

**Step 5: Commit**

```bash
git add src/
git commit -m "feat: add base layout and core components"
```

---

## Task 4: Create Home Page

**Files:**
- Create: `src/pages/index.astro`

**Step 1: Create index.astro**

Create `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BlogCard from '../components/BlogCard.astro';
import { getSanityClient } from '../lib/sanity';

const posts = await getSanityClient().fetch(`
  *[_type == 'blogPost'] | order(publishedAt desc) {
    title, slug, excerpt, publishedAt, tags[]->{name}
  }
`);
---

<BaseLayout title="Tech Blog - Home">
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">Latest Posts</h1>
    {posts.length === 0 ? (
      <p class="text-gray-500">No posts yet. Check back soon!</p>
    ) : (
      <div>
        {posts.map(post => <BlogCard {...post} />)}
      </div>
    )}
  </div>
</BaseLayout>
```

**Step 2: Create Sanity client helper**

Create `src/lib/sanity.ts`:

```typescript
import { createClient } from '@sanity/astro'

export const getSanityClient = () => createClient({
  projectId: 'your-project-id',
  dataset: 'production',
})
```

**Step 3: Commit**

```bash
git add src/pages/index.astro src/lib/sanity.ts
git commit -m "feat: add home page with blog listing"
```

---

## Task 5: Create Blog Post Page

**Files:**
- Create: `src/pages/blog/[slug].astro`
- Create: `src/components/CodeBlock.astro`

**Step 1: Create blog post page**

Create `src/pages/blog/[slug].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getSanityClient } from '../../lib/sanity';

const { slug } = Astro.params;

const post = await getSanityClient().fetch(`
  *[_type == 'blogPost' && slug.current == $slug][0]{
    title, publishedAt, content, tags[]->{name}
  }
`, { slug });

if (!post) {
  return Astro.redirect('/404');
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
---

<BaseLayout title={post.title}>
  <article class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">{post.title}</h1>
    <time class="text-gray-500">{formatDate(post.publishedAt)}</time>
    <div class="prose dark:prose-invert mt-8 max-w-none">
      {post.content}
    </div>
  </article>
</BaseLayout>
```

**Step 2: Install prose for typography**

```bash
npm install -D @tailwindcss/typography
```

**Step 3: Add typography plugin to Tailwind**

Update `tailwind.config.mjs`:

```javascript
export default {
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

**Step 4: Commit**

```bash
git add src/pages/blog/ tailwind.config.mjs package.json
git commit -m "feat: add blog post page with typography"
```

---

## Task 6: Add Dark Mode

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/components/ThemeToggle.astro`

**Step 1: Create ThemeToggle component**

Create `src/components/ThemeToggle.astro`:

```astro
---
---

<script>
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
</script>

<button onclick="toggleTheme" class="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
  <span class="dark:hidden">🌙</span>
  <span class="hidden dark:inline">☀️</span>
</button>
```

**Step 2: Add dark mode config to Tailwind**

Update `tailwind.config.mjs`:

```javascript
export default {
  darkMode: 'class',
  // ... rest of config
}
```

**Step 3: Update BaseLayout with dark class**

Add `class="dark"` support in `src/layouts/BaseLayout.astro`:

```astro
---
const theme = 'dark'; // Will be handled by JS
---

<html lang="en" class:list={[theme]}>
```

**Step 4: Add ThemeToggle to Header**

Update `src/components/Header.astro`:

```astro
---
import ThemeToggle from './ThemeToggle.astro';
---

<Header ...>
  <ThemeToggle />
</Header>
```

**Step 5: Commit**

```bash
git add src/
git commit -m "feat: add dark mode toggle"
```

---

## Task 7: Add Search Functionality

**Files:**
- Create: `src/pages/search.astro`
- Create: `src/components/Search.astro`

**Step 1: Create search page**

Create `src/pages/search.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getSanityClient } from '../lib/sanity';

const allPosts = await getSanityClient().fetch(`
  *[_type == 'blogPost']{
    title, slug, excerpt, publishedAt, tags[]->{name}
  }
`);
---

<BaseLayout title="Search">
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">Search</h1>
    <Search posts={allPosts} />
  </div>
</BaseLayout>
```

**Step 2: Create Search component**

Create `src/components/Search.astro`:

```astro
---
interface Props {
  posts: Array<any>;
}

const { posts } = Astro.props;
---

<div id="search-container">
  <input
    type="search"
    id="search-input"
    placeholder="Search posts..."
    class="w-full px-4 py-2 border rounded mb-4"
  />
  <div id="search-results">
    {posts.map(post => (
      <a href={`/blog/${post.slug}`} class="block py-2 hover:text-blue-500">
        {post.title}
      </a>
    ))}
  </div>
</div>

<script>
  import Fuse from 'fuse.js';

  const posts = /* @json */(Astro.props.posts);

  const fuse = new Fuse(posts, {
    keys: ['title', 'excerpt'],
    threshold: 0.3,
  });

  const input = document.getElementById('search-input') as HTMLInputElement;
  const results = document.getElementById('search-results');

  input?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    const matches = query ? fuse.search(query) : posts;

    results.innerHTML = matches.map(post => `
      <a href="/blog/${post.item.slug}" class="block py-2 hover:text-blue-500">
        ${post.item.title}
      </a>
    `).join('');
  });
</script>
```

**Step 3: Commit**

```bash
git add src/pages/search.astro src/components/Search.astro
git commit -m "feat: add client-side search with Fuse.js"
```

---

## Task 8: Create About Page

**Files:**
- Create: `src/pages/about.astro`

**Step 1: Create about page**

Create `src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="About">
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">About</h1>
    <div class="prose dark:prose-invert">
      <p>
        Hi! I'm a developer passionate about sharing knowledge through writing.
        This blog is where I document my learning journey and share tutorials on programming topics.
      </p>
      <h2>Skills</h2>
      <ul>
        <li>JavaScript / TypeScript</li>
        <li>React / Vue / Astro</li>
        <li>Node.js</li>
        <li>Python</li>
      </ul>
      <h2>Connect</h2>
      <p>
        Feel free to reach out via <a href="mailto:your@email.com">email</a> or find me on
        <a href="https://github.com/yourusername">GitHub</a>.
      </p>
    </div>
  </div>
</BaseLayout>
```

**Step 2: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add about page"
```

---

## Task 9: Add RSS Feed

**Files:**
- Create: `src/pages/rss.xml.js`

**Step 1: Create RSS feed**

Create `src/pages/rss.xml.js`:

```javascript
import rss from '@astrojs/rss';
import { getSanityClient } from '../lib/sanity';

export async function GET(context) {
  const posts = await getSanityClient().fetch(`
    *[_type == 'blogPost'] | order(publishedAt desc) {
      title, slug, excerpt, publishedAt
    }
  `);

  return rss({
    title: 'Tech Blog',
    description: 'A technical blog',
    site: context.site,
    items: posts.map(post => ({
      title: post.title,
      pubDate: new Date(post.publishedAt),
      description: post.excerpt,
      link: `/blog/${post.slug}`,
    })),
  });
}
```

**Step 2: Add site to Astro config**

Update `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://sunqizhen.github.io',
  // ... rest of config
});
```

**Step 3: Add RSS link to Footer**

Update `src/components/Footer.astro`:

```astro
<a href="/rss.xml" class="hover:text-blue-500">RSS Feed</a>
```

**Step 4: Commit**

```bash
git add src/pages/rss.xml.js astro.config.mjs src/components/Footer.astro
git commit -m "feat: add RSS feed"
```

---

## Task 10: Set Up GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Astro site
        run: npm run build
        env:
          SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
          SANITY_DATASET: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Update package.json build script**

Ensure `package.json` has:

```json
{
  "scripts": {
    "build": "astro build"
  }
}
```

**Step 3: Update Astro config for GitHub Pages**

Update `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  base: '/your-repo-name', // Remove if using custom domain or user/org pages
  // ... rest of config
});
```

**Step 4: Commit**

```bash
git add .github/workflows/deploy.yml package.json astro.config.mjs
git commit -m "feat: add GitHub Pages deployment workflow"
```

---

## Task 11: Configure GitHub Repository

**Files:**
- N/A (GitHub configuration)

**Step 1: Create GitHub repository**

```bash
gh repo create tech-blog --public --source=. --push
```

Or manually create at `github.com/new`

**Step 2: Configure GitHub Pages**

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Wait for first deployment

**Step 3: Add Sanity project ID to repository secrets**

1. Go to repository Settings → Secrets → Actions
2. Add secret: `SANITY_PROJECT_ID`
3. Value: Your Sanity project ID from `sanity.config.ts`

**Step 4: Configure repository settings**

1. Settings → Pages → Custom domain (optional)
2. Add domain and configure DNS if needed

**Step 5: Commit any remaining changes**

```bash
git add .
git commit -m "chore: final configuration updates"
git push origin main
```

---

## Task 12: Create First Blog Post

**Files:**
- N/A (Created in Sanity CMS)

**Step 1: Start Sanity studio locally**

```bash
npm run sanity
```

Or visit `https://your-project.sanity.studio`

**Step 2: Create a tag**

1. Click "New" → "Tag"
2. Name: "Getting Started"
3. Save

**Step 3: Create first blog post**

1. Click "New" → "Blog Post"
2. Title: "Welcome to My Tech Blog"
3. Excerpt: "This is my first post on my new technical blog built with Astro and Sanity."
4. Content:
   ```
   # Welcome!

   This is my first blog post. I'm excited to start sharing my technical journey here.

   ## What to expect

   - Programming tutorials
   - Code examples
   - Tech articles

   Stay tuned!
   ```
5. Tags: Select "Getting Started"
6. Publish

**Step 4: Trigger rebuild**

Either:
- Push any change to GitHub
- Or wait for scheduled rebuild (if configured)

**Step 5: Verify**

Visit `https://sunqizhen.github.io` and confirm the post appears.

**Step 6: Commit**

```bash
git commit --allow-empty -m "chore: first blog post created in Sanity"
```

---

## Summary

This implementation plan creates a fully functional technical blog with:

- ✅ Astro for static site generation
- ✅ Sanity CMS for content management
- ✅ GitHub Pages for hosting
- ✅ Dark mode support
- ✅ Client-side search
- ✅ RSS feed
- ✅ Responsive design
- ✅ Code syntax highlighting
- ✅ SEO optimization

**Total estimated tasks:** 12

**Follow TDD principles:** Write tests first, implement second, refactor third.

**Commit frequently:** Each task should result in at least one commit.

**YAGNI:** Only implement features needed now. Add features later when needed.
