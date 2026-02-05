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
  console.log('Content block types:\n');

  post.content.forEach((block, i) => {
    const type = block._type || 'unknown';
    console.log(`${i + 1}. Type: ${type}, Style: ${block.style || 'N/A'}`);

    if (type === 'table') {
      console.log(`   HTML length: ${block.html?.length || 0} chars`);
      if (block.html) {
        console.log(`   Preview: ${block.html.substring(0, 100)}...`);
      }
    } else if (block.children) {
      const text = block.children.map(c => c.text).join(' ');
      if (text.includes('|') || text.includes('Use Case') || text.includes('Real-World')) {
        console.log(`   Text: "${text.substring(0, 100)}"`);
      }
    }
  });

}).catch(err => console.error('Error:', err.message));
