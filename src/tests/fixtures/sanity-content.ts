export interface TestPost {
  title: string;
  slug: { current: string };
  excerpt: string;
  publishedAt: string;
  tags: Array<{ name: string }>;
  content: any;
}

export const testPosts: TestPost[] = [
  {
    title: 'Test Post - English',
    slug: { current: 'test-post-en' },
    excerpt: 'A test post in English',
    publishedAt: new Date('2025-01-15T10:00:00.000Z').toISOString(),
    tags: [{ name: 'test' }, { name: 'en' }],
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'This is a test post content.' }],
        markDefs: [],
      }
    ],
  },
  {
    title: '测试文章 - 中文',
    slug: { current: 'test-post-zh' },
    excerpt: '这是一篇测试文章',
    publishedAt: new Date('2025-01-15T10:00:00.000Z').toISOString(),
    tags: [{ name: 'test' }, { name: 'zh' }],
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: '这是测试内容。' }],
        markDefs: [],
      }
    ],
  },
  {
    title: 'Article de Test - Français',
    slug: { current: 'test-post-fr' },
    excerpt: 'Un article de test en français',
    publishedAt: new Date('2025-01-15T10:00:00.000Z').toISOString(),
    tags: [{ name: 'test' }, { name: 'fr' }],
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Ceci est un contenu de test.' }],
        markDefs: [],
      }
    ],
  },
];
