import fs from 'fs';

const content = JSON.parse(fs.readFileSync('scripts/posts/bufferqueue-guide.json', 'utf-8')).content;
const lines = content.split('\n');

// Find conclusion section
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Conclusion') || (i >= 318 && i <= 330)) {
    console.log(`Line ${i}: "${lines[i]}" (len=${lines[i].length})`);
  }
}
