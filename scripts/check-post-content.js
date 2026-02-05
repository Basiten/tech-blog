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
  console.log('Sample content blocks (first 15):\n');
  post.content.slice(0, 15).forEach((block, i) => {
    console.log(`${i + 1}. Style: ${block.style || 'normal'}`);
    if (block.children) {
      block.children.forEach(child => {
        console.log(`   Text: "${child.text?.substring(0, 80)}${child.text?.length > 80 ? '...' : ''}"`);
        if (child.marks && child.marks.length > 0) {
          console.log(`   Marks: ${child.marks.join(', ')}`);
        }
      });
    }
    console.log('');
  });
}).catch(err => console.error('Error:', err.message));
