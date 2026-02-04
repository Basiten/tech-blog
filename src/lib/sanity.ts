import { createClient } from '@sanity/client'
import type { PortableTextBlock } from '@sanity/types'
import { SANITY_CONFIG } from './sanityConfig'

export const client = createClient(SANITY_CONFIG)

export interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  content: PortableTextBlock[]
  tags?: Tag[]
}

export interface Tag {
  _id: string
  name: string
  slug: { current: string }
  description?: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    return await client.fetch(`
      *[_type == "blogPost"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        content,
        tags->
      }
    `)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await client.fetch(`
      *[_type == "blogPost" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        content,
        tags->
      }
    `, { slug })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    return await client.fetch(`
      *[_type == "tag"] | order(name asc) {
        _id,
        name,
        slug,
        description
      }
    `)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}

export async function getTag(slug: string): Promise<Tag | null> {
  try {
    return await client.fetch(`
      *[_type == "tag" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        description
      }
    `, { slug })
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}

export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  try {
    return await client.fetch(`
      *[_type == "blogPost" && references(*[_type == "tag" && slug.current == $tagSlug]._id)] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        content,
        tags->
      }
    `, { tagSlug })
  } catch (error) {
    console.error('Error fetching posts by tag:', error)
    return []
  }
}
