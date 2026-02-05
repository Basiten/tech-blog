#!/usr/bin/env node

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'fukvvqkf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skdr47zkY2glFy2dBOyGCwutZJRxD7syNkYCeutv7osopaF2TIomB70y05Y4vi2NDY7ETr5w6vbkW5bXIXVzda29NvxDUqeyxrhg2pcXYwPlgEYpWQFnRrZI3C8J0ebzID4WsvloJnlI9covlVRZeGZ1UfavHCUnH6v5qG2HkhVgjuYMU30n',
  useCdn: false
});

client.fetch(`*[_type == "blogPost" && slug.current == "understanding-android-bufferqueue"][0]{content}`).then(post => {
  console.log('Searching for content with | or table markers:\n');

  post.content.forEach((block, i) => {
    if (block.children) {
      const text = block.children.map(c => c.text).join('');
      if (text.includes('|') || text.includes('Use Case') || text.includes('Transition') || text.includes('— Available')) {
        console.log(`Block ${i + 1} (Style: ${block.style || 'normal'}):`);
        console.log(`  Text: "${text.substring(0, 150)}"`);
        console.log(`  Has marks: ${block.children.some(c => c.marks?.length > 0)}`);
        console.log('');
      }
    }
  });

  // Also show blocks around "Real-World Examples"
  console.log('\n=== Blocks around "Real-World Examples" ===\n');
  let found = false;
  post.content.forEach((block, i) => {
    if (block.children) {
      const text = block.children.map(c => c.text).join('');
      if (text.includes('Real-World') || (found && i < 50)) {
        found = true;
        console.log(`Block ${i + 1}: "${text.substring(0, 100)}"`);
      }
    }
  });

}).catch(err => console.error('Error:', err.message));
