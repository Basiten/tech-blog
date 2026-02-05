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
  // Show full text for blocks 89 and 91
  [88, 89, 90, 91].forEach(i => {
    if (post.content[i]) {
      const block = post.content[i];
      console.log(`\nBlock ${i + 1} (Style: ${block.style || 'N/A'}):`);

      if (block.children) {
        block.children.forEach((child, j) => {
          if (child.text) {
            console.log(`  Child ${j + 1}: [${child.text.length} chars] "${child.text}"`);
          }
        });
      }
    }
  });

}).catch(err => console.error('Error:', err.message));
