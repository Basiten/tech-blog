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
  // Find block 89 and 91
  [88, 89, 90, 91].forEach(i => {
    if (post.content[i]) {
      const block = post.content[i];
      console.log(`Block ${i + 1} (Type: ${block._type}, Style: ${block.style || 'N/A'}):`);

      if (block.children) {
        block.children.forEach((child, j) => {
          const textPreview = child.text?.substring(0, 100);
          console.log(`  Child ${j + 1}: length=${child.text?.length || 0}, text="${textPreview}"`);

          // Check for truncation
          if (child.text && child.text.length > 0 && !child.text.endsWith('.') && !child.text.endsWith(':') && !child.text.endsWith('!') && j === 0) {
            console.log(`    ^ This looks truncated - doesn't end with sentence-ending punctuation`);
          }
        });
      }
      console.log('');
    }
  });

}).catch(err => console.error('Error:', err.message));
