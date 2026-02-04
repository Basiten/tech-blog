import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'tech-blog',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

export interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  content: any[]
  tags?: Tag[]
}

export interface Tag {
  _id: string
  name: string
  slug: { current: string }
  description?: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
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
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
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
}

export async function getTags(): Promise<Tag[]> {
  return await client.fetch(`
    *[_type == "tag"] | order(name asc) {
      _id,
      name,
      slug,
      description
    }
  `)
}

export async function getTag(slug: string): Promise<Tag> {
  return await client.fetch(`
    *[_type == "tag" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description
    }
  `, { slug })
}

export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
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
}
