#!/usr/bin/env node

/**
 * Sanity Blog Post Creator
 *
 * Automatically creates blog posts in Sanity CMS via API.
 * Converts markdown content to Portable Text format.
 *
 * Usage:
 *   node scripts/add-sanity-post.js <post-json-file>
 *
 * Example post JSON:
 * {
 *   "title": "My Blog Post",
 *   "excerpt": "A brief description",
 *   "content": "# Heading\n\nParagraph text...",
 *   "tags": ["Android", "Graphics"],
 *   "publishedAt": "2024-02-05T12:00:00Z" // optional, defaults to now
 * }
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Load environment variables
function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found at', envPath)
    console.error('Please create a .env file with SANITY_API_TOKEN')
    process.exit(1)
  }

  const env = {}
  const content = fs.readFileSync(envPath, 'utf-8')
  content.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim()
    }
  })

  if (!env.SANITY_API_TOKEN) {
    console.error('Error: SANITY_API_TOKEN not found in .env file')
    console.error('Get your token from: https://www.sanity.io/manage')
    process.exit(1)
  }

  return {
    projectId: env.SANITY_PROJECT_ID || 'fukvvqkf',
    dataset: env.SANITY_DATASET || 'production',
    apiVersion: env.SANITY_API_VERSION || '2024-01-01',
    token: env.SANITY_API_TOKEN,
    useCdn: false
  }
}

// Initialize Sanity client
const env = loadEnv()
const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  token: env.token,
  useCdn: false
})

/**
 * Convert markdown to Portable Text blocks
 * Handles: headings, paragraphs, bold, italic, code blocks, lists, links
 */
function markdownToPortableText(markdown) {
  const blocks = []
  const lines = markdown.split('\n')
  let currentParagraph = []
  let inCodeBlock = false
  let codeContent = []
  let codeLanguage = ''
  let listItems = []
  let inList = false

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        _type: 'block',
        children: currentParagraph,
        markDefs: []
      })
      currentParagraph = []
    }
  }

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({
        _type: 'block',
        listItem: 'bullet',
        level: 1,
        children: listItems
      })
      listItems = []
    }
  }

  const parseInlineFormatting = (text) => {
    const children = []

    // Simple parsing for **bold**, *italic*, `code`, and [links](url)
    let remaining = text

    while (remaining.length > 0) {
      // Code
      const codeMatch = remaining.match(/^`([^`]+)`/)
      if (codeMatch) {
        if (children.length > 0 && children[children.length - 1].text === '') {
          children.pop()
        }
        children.push({ _type: 'code', text: codeMatch[1] })
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }

      // Bold
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
      if (boldMatch) {
        if (children.length > 0 && children[children.length - 1].text === '') {
          children.pop()
        }
        children.push({
          text: boldMatch[1],
          marks: ['strong']
        })
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }

      // Italic
      const italicMatch = remaining.match(/^\*([^*]+)\*/)
      if (italicMatch) {
        if (children.length > 0 && children[children.length - 1].text === '') {
          children.pop()
        }
        children.push({
          text: italicMatch[1],
          marks: ['em']
        })
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }

      // Links
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        if (children.length > 0 && children[children.length - 1].text === '') {
          children.pop()
        }
        const markKey = `link${children.filter(c => c._type === 'code' || c.marks).length}`
        children.push({
          text: linkMatch[1],
          marks: [markKey]
        })
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }

      // Regular text
      const nextSpecial = remaining.indexOf(/[`*\[]/.exec(remaining)?.index ?? -1)
      if (nextSpecial === 0) {
        remaining = remaining.slice(1)
        continue
      }

      const textEnd = nextSpecial === -1 ? remaining.length : nextSpecial
      if (textEnd > 0) {
        children.push({ text: remaining.slice(0, textEnd) })
        remaining = remaining.slice(textEnd)
      } else {
        break
      }
    }

    return children
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block detection
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          _type: 'code',
          language: codeLanguage || 'text',
          code: codeContent.join('\n')
        })
        codeContent = []
        codeLanguage = ''
        inCodeBlock = false
      } else {
        // Start code block
        flushParagraph()
        flushList()
        codeLanguage = line.slice(3).trim() || 'text'
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    // Headings
    if (line.startsWith('#')) {
      flushParagraph()
      flushList()
      const level = line.match(/^#+/)[0].length
      const text = line.replace(/^#+\s*/, '')
      blocks.push({
        _type: 'block',
        style: `h${Math.min(level, 6)}`,
        children: [{ text }]
      })
      continue
    }

    // List items
    if (line.trim().startsWith('- ') || line.trim().match(/^\d+\.\s/)) {
      flushParagraph()
      const text = line.trim().replace(/^[-\d.]+\s*/, '')
      listItems.push({ text })
      inList = true
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushParagraph()
      flushList()
      inList = false
      continue
    }

    // Regular text
    if (inList) {
      flushList()
      inList = false
    }

    // Parse inline formatting
    const children = parseInlineFormatting(line)
    currentParagraph.push(...children)

    // If line ends with space, continue same paragraph
    if (line.endsWith('  ') || i < lines.length - 1 && lines[i + 1].trim() !== '' && !lines[i + 1].startsWith('#')) {
      // Continue paragraph
      if (children.length > 0) {
        const lastChild = children[children.length - 1]
        if (lastChild.text) {
          lastChild.text += ' '
        }
      }
    }
  }

  flushParagraph()
  flushList()

  return blocks
}

/**
 * Find or create tags by name
 */
async function getOrCreateTags(tagNames) {
  const tags = []

  for (const tagName of tagNames) {
    // Try to find existing tag
    const existing = await client.fetch(
      `*[_type == "tag" && name == $name][0]._id`,
      { name: tagName }
    )

    if (existing) {
      tags.push({ _type: 'reference', _ref: existing })
    } else {
      // Create new tag
      const slug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const newTag = await client.create({
        _type: 'tag',
        name: tagName,
        slug: { current: slug }
      })
      tags.push({ _type: 'reference', _ref: newTag._id })
      console.log(`  Created tag: ${tagName}`)
    }
  }

  return tags
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Create a blog post in Sanity
 */
async function createBlogPost(postData) {
  console.log('Creating blog post:', postData.title)

  // Convert markdown content to Portable Text
  console.log('Converting markdown to Portable Text...')
  const content = markdownToPortableText(postData.content)

  // Get or create tags
  let tagRefs = []
  if (postData.tags && postData.tags.length > 0) {
    console.log('Processing tags...')
    tagRefs = await getOrCreateTags(postData.tags)
  }

  // Generate slug
  const slug = postData.slug || generateSlug(postData.title)

  // Check for existing post with same slug
  const existing = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0]`,
    { slug }
  )

  if (existing) {
    console.log(`\nWarning: Post with slug "${slug}" already exists (ID: ${existing._id})`)
    const response = await readline('\nUpdate existing post? (y/n): ')
    if (response.toLowerCase() === 'y') {
      console.log('Updating existing post...')
      const updated = await client.patch(existing._id).set({
        title: postData.title,
        slug: { current: slug },
        excerpt: postData.excerpt || '',
        publishedAt: postData.publishedAt || new Date().toISOString(),
        content: content,
        tags: tagRefs
      }).commit()
      console.log(`\n✓ Post updated: ${updated.title}`)
      console.log(`  Slug: ${slug}`)
      console.log(`  ID: ${updated._id}`)
      return updated
    } else {
      console.log('Cancelled.')
      return null
    }
  }

  // Create new post
  console.log('Creating new post...')
  const doc = {
    _type: 'blogPost',
    title: postData.title,
    slug: { current: slug },
    excerpt: postData.excerpt || '',
    publishedAt: postData.publishedAt || new Date().toISOString(),
    content: content,
    tags: tagRefs
  }

  const result = await client.create(doc)

  console.log(`\n✓ Post created successfully!`)
  console.log(`  Title: ${result.title}`)
  console.log(`  Slug: ${slug}`)
  console.log(`  ID: ${result._id}`)
  console.log(`  Published: ${result.publishedAt}`)

  return result
}

/**
 * Main function
 */
async function main() {
  // Get post data file from command line
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: node scripts/add-sanity-post.js <post-json-file>')
    console.log('\nExample:')
    console.log('  node scripts/add-sanity-post.js my-post.json')
    console.log('\nPost JSON format:')
    console.log(JSON.stringify({
      title: 'My Blog Post',
      excerpt: 'A brief description',
      content: '# Heading\n\nParagraph with **bold** and *italic* text.',
      tags: ['Android', 'Graphics'],
      publishedAt: new Date().toISOString()
    }, null, 2))
    process.exit(0)
  }

  const jsonFile = args[0]
  const filePath = path.resolve(rootDir, jsonFile)

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`)
    process.exit(1)
  }

  try {
    const postData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    // Validate required fields
    if (!postData.title) {
      console.error('Error: Post must have a "title" field')
      process.exit(1)
    }

    if (!postData.content) {
      console.error('Error: Post must have a "content" field')
      process.exit(1)
    }

    await createBlogPost(postData)

  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

function readline(question) {
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

main().catch(console.error)
