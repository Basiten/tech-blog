import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'fukvvqkf',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

const testPosts = [
  {
    _type: 'blogPost',
    title: 'Test Post One',
    slug: { _type: 'slug', current: 'test-post-one' },
    excerpt: 'This is a test post for E2E testing',
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'This is test content for E2E testing.' }],
      },
    ],
    publishedAt: new Date().toISOString(),
    tags: [],
  },
  {
    _type: 'blogPost',
    title: 'Getting Started with Astro',
    slug: { _type: 'slug', current: 'getting-started-with-astro' },
    excerpt: 'Learn how to build fast websites with Astro',
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Astro is a modern static site builder that helps you build faster websites.' }],
      },
    ],
    publishedAt: new Date().toISOString(),
    tags: [],
  },
  {
    _type: 'blogPost',
    title: 'Sanity CMS Guide',
    slug: { _type: 'slug', current: 'sanity-cms-guide' },
    excerpt: 'Using Sanity for content management',
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Sanity provides a flexible API for content management.' }],
      },
    ],
    publishedAt: new Date().toISOString(),
    tags: [],
  },
]

console.log('Creating test blog posts...')

for (const post of testPosts) {
  try {
    const result = await client.create(post)
    console.log(`✓ Created: ${result.title}`)
  } catch (error) {
    console.error(`✗ Failed to create ${post.title}:`, error.message)
  }
}

console.log('\nDone! Check your Sanity dashboard.')
