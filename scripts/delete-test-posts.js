#!/usr/bin/env node

import { createClient } from '@sanity/client';
import readline from 'readline';

const client = createClient({
  projectId: 'fukvvqkf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skdr47zkY2glFy2dBOyGCwutZJRxD7syNkYCeutv7osopaF2TIomB70y05Y4vi2NDY7ETr5w6vbkW5bXIXVzda29NvxDUqeyxrhg2pcXYwPlgEYpWQFnRrZI3C8J0ebzID4WsvloJnlI9covlVRZeGZ1UfavHCUnH6v5qG2HkhVgjuYMU30n',
  useCdn: false
});

// Test post IDs to delete
const testPostIds = [
  '9n5QvMzjikCUJenvBAsh1a', // Getting Started with Astro
  '9n5QvMzjikCUJenvBAsh4Z', // Sanity CMS Guide
  'fKBBs2IvyO8SqVTIYrIhzL'  // Test Post One
];

async function question(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function deleteTestPosts() {
  console.log('Fetching current blog posts from Sanity...\n');

  const posts = await client.fetch('*[_type == "blogPost"] | order(publishedAt desc) {_id, title, slug}');

  console.log('Current posts:');
  posts.forEach(post => {
    const isTest = testPostIds.includes(post._id);
    console.log(`  ${isTest ? '[TEST]' : '     '} ${post.title} (${post.slug.current})`);
  });

  console.log('\n---');
  console.log(`Will delete ${testPostIds.length} test posts.`);

  const answer = await question('\nConfirm deletion? (y/n): ');

  if (answer.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    process.exit(0);
  }

  console.log('\nDeleting test posts...\n');

  for (const id of testPostIds) {
    try {
      const post = await client.fetch('*[_type == "blogPost" && _id == $id]{_id, title}', { id });
      if (post) {
        await client.delete(id);
        console.log(`  ✓ Deleted: ${post.title}`);
      } else {
        console.log(`  ⚠ Not found: ${id}`);
      }
    } catch (err) {
      console.error(`  ✗ Error deleting ${id}:`, err.message);
    }
  }

  console.log('\n---');
  console.log('Verifying remaining posts...\n');

  const remaining = await client.fetch('*[_type == "blogPost"] | order(publishedAt desc) {_id, title, slug}');
  console.log(`Remaining posts: ${remaining.length}`);
  remaining.forEach(post => {
    console.log(`  - ${post.title}`);
  });
}

deleteTestPosts().catch(console.error);
