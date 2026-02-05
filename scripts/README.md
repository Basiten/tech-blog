# Sanity Blog Post Creator

Automatically creates blog posts in Sanity CMS via API.

## Setup

### 1. Get Sanity API Token

1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to **API** → **Tokens**
4. Click **+ Add new token**
5. Give it a name (e.g., "Blog Post Creator")
6. Select these permissions:
   - ✅ **Create** - Create new documents
   - ✅ **Update** - Update existing documents
   - ✅ **Delete** - Delete documents
7. Click **Add token**
8. **Copy the token** (you won't see it again!)

### 2. Add Token to .env File

Add the token to your `.env` file:

```bash
SANITY_API_TOKEN=your_copied_token_here
```

The `.env.example` file shows the required format.

## Usage

### Create a Blog Post

1. Create a JSON file with your post content (see `posts/bufferqueue-guide.json` as example)

2. Run the script:

```bash
node scripts/add-sanity-post.js scripts/posts/your-post.json
```

### JSON Post Format

```json
{
  "title": "Your Post Title",
  "slug": "your-post-slug",  // optional, auto-generated from title
  "excerpt": "Brief description",
  "content": "# Heading\n\nYour markdown content...",
  "tags": ["Tag1", "Tag2"],
  "publishedAt": "2024-02-05T12:00:00Z"  // optional, defaults to now
}
```

### Supported Markdown

The script converts markdown to Sanity's Portable Text format:

- **Headings:** `# H1`, `## H2`, `### H3`, etc.
- **Bold:** `**bold text**`
- **Italic:** `*italic text*`
- **Code:** `` `inline code` ``
- **Code blocks:** ```javascript\ncode here\n```
- **Lists:** `- item` or `1. item`
- **Links:** `[text](url)`

### Updating Existing Posts

If a post with the same slug exists, the script will ask if you want to update it.

## Examples

### BufferQueue Guide

```bash
node scripts/add-sanity-post.js scripts/posts/bufferqueue-guide.json
```

### Create Your Own Post

1. Copy the example:
```bash
cp scripts/posts/bufferqueue-guide.json scripts/posts/my-post.json
```

2. Edit `my-post.json` with your content

3. Run the script:
```bash
node scripts/add-sanity-post.js scripts/posts/my-post.json
```

## Troubleshooting

### Error: SANITY_API_TOKEN not found

Make sure you've added the token to your `.env` file (not `.env.example`).

### Error: Post with slug already exists

The script will ask if you want to update the existing post. Type `y` to update or `n` to cancel.

### Markdown not rendering correctly

Check that your markdown follows the supported format. Complex markdown may need manual adjustment in Sanity Studio.

## Notes

- Tags are automatically created if they don't exist
- Slugs are auto-generated from titles if not provided
- Content is converted from markdown to Portable Text automatically
- Published date defaults to current time if not specified
