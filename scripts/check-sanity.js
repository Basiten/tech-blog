#!/usr/bin/env node

import { createClient } from '@sanity/client';
import fs from 'fs';

const client = createClient({
  projectId: 'fukvvqkf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skdr47zkY2glFy2dBOyGCwutZJRxD7syNkYCeutv7osopaF2TIomB70y05Y4vi2NDY7ETr5w6vbkW5bXIXVzda29NvxDUqeyxrhg2pcXYwPlgEYpWQFnRrZI3C8J0ebzID4WsvloJnlI9covlVRZeGZ1UfavHCUnH6v5qG2HkhVgjuYMU30n',
  useCdn: false
});

console.log('Checking Sanity CMS...\n');

// Check all blog posts
client.fetch('*[_type == "blogPost"] | order(publishedAt desc) {_id, title, slug, publishedAt}').then(posts => {
  console.log('Total blog posts:', posts.length);
  console.log('\nAll posts:');
  posts.forEach(post => {
    console.log(`  - ${post.title}`);
    console.log(`    Slug: ${post.slug.current}`);
    console.log(`    ID: ${post._id}`);
    console.log(`    Published: ${post.publishedAt}`);
  });

  // Check for BufferQueue post
  const bufferPost = posts.find(p => p.slug.current === 'understanding-android-bufferqueue');
  console.log('\n---\n');
  if (bufferPost) {
    console.log('✓ BufferQueue post FOUND in Sanity!');
  } else {
    console.log('✗ BufferQueue post NOT found in Sanity!');
    console.log('Need to create it...');
  }

}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
