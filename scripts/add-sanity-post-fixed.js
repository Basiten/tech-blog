#!/usr/bin/env node

/**
 * Sanity Blog Post Creator - FIXED VERSION
 *
 * Fixed issues:
 * - Table parsing support
 * - Consecutive bold/italic handling
 * - Proper list item separation
 * - Better inline formatting parsing
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found')
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
    console.error('Error: SANITY_API_TOKEN not found')
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

const env = loadEnv()
const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  token: env.token,
  useCdn: false
})

/**
 * Convert markdown to Portable Text - FIXED VERSION
 */
function markdownToPortableText(markdown) {
  const blocks = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Skip empty lines
    if (!trimmedLine) {
      i++
      continue
    }

    // Code blocks
    if (trimmedLine.startsWith('```')) {
      const lang = trimmedLine.slice(3).trim() || 'text'
      let code = ''
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code += lines[i] + '\n'
        i++
      }
      blocks.push({
        _type: 'code',
        language: lang,
        code: code.trim()
      })
      i++
      continue
    }

    // Tables - parse and convert to HTML, store as custom block
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      let tableHtml = '<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-600 my-4">'
      let isFirstRow = true

      while (i < lines.length) {
        const tableLine = lines[i].trim()
        if (!tableLine.startsWith('|')) break

        // Skip separator lines
        if (tableLine.match(/^\|[\s\-:]+\|$/)) {
          i++
          continue
        }

        const cells = tableLine.slice(1, -1).split('|').map(c => c.trim())

        if (isFirstRow) {
          tableHtml += '<thead><tr>'
          cells.forEach(cell => {
            tableHtml += `<th class="px-4 py-2 text-left bg-gray-100 dark:bg-gray-800 font-semibold border-b border-gray-300 dark:border-gray-600">${parseInlineFormatting(cell)}</th>`
          })
          tableHtml += '</tr></thead><tbody>'
          isFirstRow = false
        } else {
          tableHtml += '<tr>'
          cells.forEach(cell => {
            tableHtml += `<td class="px-4 py-2 border-t border-gray-200 dark:border-gray-700">${parseInlineFormatting(cell)}</td>`
          })
          tableHtml += '</tr>'
        }
        i++
      }
      tableHtml += '</tbody></table>'

      // Store as custom table block
      blocks.push({
        _type: 'table',
        html: tableHtml
      })
      continue
    }

    // Headings
    if (trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^(#+)\s+(.*)/)
      if (match) {
        const level = Math.min(match[1].length, 6)
        const text = match[2]
        const { children, markDefs } = parseInlineFormattingToChildren(text)
        blocks.push({
          _type: 'block',
          style: `h${level}`,
          children: children,
          markDefs: markDefs.length > 0 ? markDefs : undefined
        })
        i++
        continue
      }
    }

    // Lists - parse inline formatting within items
    if (trimmedLine.startsWith('- ') || trimmedLine.match(/^\d+\.\s/)) {
      const listItems = []
      const listMarkDefs = []
      const isNumbered = trimmedLine.match(/^\d+\./)

      while (i < lines.length) {
        const listLine = lines[i].trim()
        if (!listLine.startsWith('- ') && !listLine.match(/^\d+\.\s/)) break

        const text = listLine.replace(/^[-\d.]\s+/, '')
        // Parse inline formatting for each list item
        const { children, markDefs } = parseInlineFormattingToChildren(text)
        listItems.push(...children)
        listMarkDefs.push(...markDefs)
        i++
      }

      blocks.push({
        _type: 'block',
        listItem: isNumbered ? 'number' : 'bullet',
        level: 1,
        children: listItems,
        markDefs: listMarkDefs.length > 0 ? listMarkDefs : undefined
      })
      continue
    }

    // Regular paragraph - collect all non-empty lines
    let paragraphText = ''
    while (i < lines.length) {
      const trimmed = lines[i].trim()
      // Stop at empty line or special patterns
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('|') || trimmed.startsWith('```') || trimmed.startsWith('- ') || trimmed.match(/^\d+\.\s/)) {
        break
      }
      paragraphText += (paragraphText ? ' ' : '') + trimmed
      i++
    }

    if (paragraphText) {
      const { children, markDefs } = parseInlineFormattingToChildren(paragraphText)
      blocks.push({
        _type: 'block',
        style: 'normal',
        children: children,
        markDefs: markDefs.length > 0 ? markDefs : undefined
      })
    }
  }

  return blocks
}

/**
 * Parse inline formatting and return {children, markDefs}
 * Handles: **bold**, *italic*, `code`, [links](url)
 */
function parseInlineFormattingToChildren(text) {
  const children = []
  const markDefs = []
  let remaining = text
  let markKeyCounter = 0

  while (remaining.length > 0) {
    let matched = false

    // Bold - **text** (handle consecutive bold)
    const boldMatch = remaining.match(/^\*\*([^*]+?)\*\*/)
    if (boldMatch) {
      children.push({
        text: boldMatch[1],
        marks: ['strong']
      })
      remaining = remaining.slice(boldMatch[0].length)
      matched = true
    }

    // Italic - *text*
    if (!matched) {
      const italicMatch = remaining.match(/^\*([^*]+?)\*/)
      if (italicMatch) {
        children.push({
          text: italicMatch[1],
          marks: ['em']
        })
        remaining = remaining.slice(italicMatch[0].length)
        matched = true
      }
    }

    // Code - `text`
    if (!matched) {
      const codeMatch = remaining.match(/^`([^`]+?)`/)
      if (codeMatch) {
        children.push({
          text: codeMatch[1],
          marks: ['code']
        })
        remaining = remaining.slice(codeMatch[0].length)
        matched = true
      }
    }

    // Links - [text](url) - create unique markDef for each link
    if (!matched) {
      const linkMatch = remaining.match(/^\[([^\]]+?)\]\(([^)]+?)\)/)
      if (linkMatch) {
        // Create truly unique key using random string
        const uniqueId = Math.random().toString(36).substring(2, 10)
        const markKey = `link_${uniqueId}`
        markDefs.push({
          _type: 'link',
          _key: markKey,
          href: linkMatch[2]
        })
        children.push({
          text: linkMatch[1],
          marks: [markKey]
        })
        remaining = remaining.slice(linkMatch[0].length)
        matched = true
      }
    }

    // Regular text - take everything up to next special character
    if (!matched) {
      const nextSpecial = remaining.search(/[\[*`]/)
      if (nextSpecial === 0) {
        remaining = remaining.slice(1)
        continue
      }

      const textEnd = nextSpecial === -1 ? remaining.length : nextSpecial
      if (textEnd > 0) {
        children.push({ text: remaining.slice(0, textEnd) })
        remaining = remaining.slice(textEnd)
      }
    }
  }

  return { children, markDefs }
}

/**
 * Parse inline formatting for HTML output
 */
function parseInlineFormatting(text) {
  return text
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
}

/**
 * Find or create tags
 */
async function getOrCreateTags(tagNames) {
  const tags = []

  for (const tagName of tagNames) {
    const existing = await client.fetch(
      `*[_type == "tag" && name == $name][0]._id`,
      { name: tagName }
    )

    if (existing) {
      tags.push({ _type: 'reference', _ref: existing })
    } else {
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

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Create or update blog post
 */
async function createBlogPost(postData) {
  console.log('Creating/updating blog post:', postData.title)

  const content = markdownToPortableText(postData.content)

  let tagRefs = []
  if (postData.tags && postData.tags.length > 0) {
    console.log('Processing tags...')
    tagRefs = await getOrCreateTags(postData.tags)
  }

  const slug = postData.slug || generateSlug(postData.title)

  // Check for existing post
  const existing = await client.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0]`,
    { slug }
  )

  const doc = {
    _type: 'blogPost',
    title: postData.title,
    slug: { current: slug },
    excerpt: postData.excerpt || '',
    publishedAt: postData.publishedAt || new Date().toISOString(),
    content: content,
    tags: tagRefs
  }

  let result
  if (existing) {
    console.log('Updating existing post...')
    result = await client.patch(existing._id).set(doc).commit()
  } else {
    console.log('Creating new post...')
    result = await client.create(doc)
  }

  console.log(`\n✓ Post ${existing ? 'updated' : 'created'} successfully!`)
  console.log(`  Title: ${result.title}`)
  console.log(`  Slug: ${slug}`)
  console.log(`  ID: ${result._id}`)

  return result
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: node scripts/add-sanity-post-fixed.js <post-json-file>')
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

    if (!postData.title || !postData.content) {
      console.error('Error: Post must have title and content')
      process.exit(1)
    }

    await createBlogPost(postData)

  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
