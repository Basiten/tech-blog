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
  console.log('Searching for Conclusion section:\n');

  let foundConclusion = false;
  post.content.forEach((block, i) => {
    if (block.children) {
      const text = block.children.map(c => c.text).join('');
      if (text.includes('Conclusion') || text.includes('conclusion') || (foundConclusion && i < 100)) {
        foundConclusion = true;
        console.log(`Block ${i + 1} (Style: ${block.style || 'normal'}):`);

        // Show children with marks
        block.children.forEach((child, j) => {
          console.log(`  Child ${j + 1}: "${child.text?.substring(0, 80)}"`);
          if (child.marks && child.marks.length > 0) {
            console.log(`    Marks: [${child.marks.join(', ')}]`);
          }
        });
        console.log('');
      }
    }
  });

}).catch(err => console.error('Error:', err.message));
