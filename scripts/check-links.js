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
  // Find Further Reading section
  post.content.forEach((block, i) => {
    if (block.children) {
      const text = block.children.map(c => c.text).join('');
      if (text.includes('Further Reading')) {
        console.log(`Found Further Reading at block ${i + 1}`);

        // Show this block and next few
        for (let j = i; j < Math.min(i + 3, post.content.length); j++) {
          const b = post.content[j];
          console.log(`\nBlock ${j + 1} (Style: ${b.style || 'N/A'}):`);

          if (b.markDefs && b.markDefs.length > 0) {
            console.log(`  MarkDefs (${b.markDefs.length}):`);
            b.markDefs.forEach((md, k) => {
              console.log(`    ${k + 1}. Type: ${md._type}, Key: ${md._key}, Href: ${md.href}`);
            });
          }

          if (b.children) {
            b.children.forEach((child, k) => {
              const marksStr = child.marks && child.marks.length > 0 ? ` Marks: [${child.marks.join(', ')}]` : '';
              console.log(`  Child ${k + 1}: "${child.text?.substring(0, 60)}"${marksStr}`);
            });
          }
        }
      }
    }
  });

}).catch(err => console.error('Error:', err.message));
