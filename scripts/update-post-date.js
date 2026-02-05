#!/usr/bin/env node

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'fukvvqkf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skdr47zkY2glFy2dBOyGCwutZJRxD7syNkYCeutv7osopaF2TIomB70y05Y4vi2NDY7ETr5w6vbkW5bXIXVzda29NvxDUqeyxrhg2pcXYwPlgEYpWQFnRrZI3C8J0ebzID4WsvloJnlI9covlVRZeGZ1UfavHCUnH6v5qG2HkhVgjuYMU30n',
  useCdn: false
});

// Update BufferQueue post to today's date
const today = new Date().toISOString();

client.patch('0UDb96hQ7Pymyq9fV6O4oO')
  .set({ publishedAt: today })
  .commit()
  .then(updated => {
    console.log('✓ Updated BufferQueue post date to today');
    console.log(`  New date: ${updated.publishedAt}`);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
