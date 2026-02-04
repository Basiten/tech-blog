# Creating Blog Posts Guide

This guide will walk you through creating and publishing blog posts using the Sanity CMS.

## Table of Contents

1. [Setting Up Sanity Studio](#setting-up-sanity-studio)
2. [Understanding the Blog Post Schema](#understanding-the-blog-post-schema)
3. [Creating Your First Blog Post](#creating-your-first-blog-post)
4. [Writing Content with Portable Text](#writing-content-with-portable-text)
5. [Adding Images and Media](#adding-images-and-media)
6. [Publishing Your Post](#publishing-your-post)
7. [Managing Categories and Tags](#managing-categories-and-tags)
7. [Best Practices](#best-practices)

## Setting Up Sanity Studio

### 1. Start the Sanity Studio locally

```bash
cd /home/sunqizhen/Website
npm run dev
```

### 2. Access Sanity Studio

1. Open your browser and go to: http://localhost:4323
2. If not logged in, you'll be redirected to authenticate
3. Use your Sanity account credentials

### 3. Verify your project

- Ensure you're in the correct project
- Verify the dataset is "production"
- Check that the "blog" schema is visible in the left sidebar

## Understanding the Blog Post Schema

Your blog post schema includes the following fields:

### Required Fields

- **Title**: The main title of your blog post
- **Slug**: URL-friendly version of the title (auto-generated)
- **Published Date**: When the post was published
- **Author**: The author's name

### Content Fields

- **Excerpt**: A brief summary (shown in blog listing)
- **Content**: The main content using Portable Text editor
- **Cover Image**: Featured image for the post

### Metadata

- **Categories**: Organize posts by category
- **Tags**: Add relevant tags for searchability
- **SEO Description**: Custom meta description for search engines

## Creating Your First Blog Post

### Step 1: Create a New Post

1. In Sanity Studio, click **"Blog"** in the left sidebar
2. Click the **"+ New blog"** button (top right)
3. You'll see the post editor interface

### Step 2: Add Basic Information

1. **Title**: Enter your post title
   - Example: "Getting Started with Astro and Sanity"
   - The slug will auto-generate as "getting-started-with-astro-and-sanity"

2. **Published Date**: Select today's date or schedule for future

3. **Author**: Enter your name
   - Example: "John Doe"

4. **Excerpt**: Write a compelling summary (1-2 sentences)
   - This appears in the blog listing and search results
   - Example: "Learn how to build a blazing-fast blog using Astro and Sanity CMS in this comprehensive tutorial."

### Step 3: Write Your Content

The **Content** field uses Portable Text, a rich text editor. Here's what you can do:

#### Text Formatting

- **Headings**: Use H1, H2, H3 for structure
- **Bold**: Select text and click **B** or use `Cmd/Ctrl + B`
- **Italic**: Select text and click **I** or use `Cmd/Ctrl + I`
- **Links**: Select text, click link icon, add URL

#### Code Blocks

1. Click the **+** button to insert blocks
2. Select **Code**
3. Choose language (JavaScript, Python, TypeScript, etc.)
4. Paste your code

Example:
```javascript
// This is a code block
const greeting = "Hello, World!";
console.log(greeting);
```

#### Lists

- **Bullet lists**: Click the bullet list icon
- **Numbered lists**: Click the numbered list icon
- **Nested lists**: Use Tab to indent

#### Blockquotes

1. Select the text
2. Click the quote icon
3. Or type `>` at the start of a line

#### Images in Content

1. Click the **+** button
2. Select **Image**
3. Upload or select from media library
4. Add alt text for accessibility

#### Custom Blocks

Your schema includes custom blocks for:
- **Code snippets** with syntax highlighting
- **Callout boxes**
- **Image galleries**

### Step 4: Add Cover Image

1. Scroll to **Cover Image** field
2. Click **Upload** or select from library
3. Recommended size: 1200x630px (16:9 ratio)
4. Add descriptive alt text

### Step 5: Add Categories and Tags

1. **Categories**: Add main category
   - Example: "Tutorial", "Tutorial", "News"
   - Click **+** to create new categories

2. **Tags**: Add multiple tags
   - Examples: "JavaScript", "Web Development", "Astro", "CMS"
   - Separate with Enter after each tag

### Step 6: SEO Optimization

1. **SEO Description**: Write a compelling meta description
   - Keep under 160 characters
   - Include relevant keywords
   - Make it click-worthy

## Writing Content with Portable Text

### Best Practices for Blog Posts

1. **Structure your content**
   - Start with a compelling introduction
   - Use H2 for main sections
   - Use H3 for subsections
   - End with a conclusion

2. **Write for the web**
   - Use short paragraphs (2-3 sentences)
   - Use bullet points for readability
   - Break up text with subheadings

3. **Add code examples**
   - Include practical code snippets
   - Always specify the programming language
   - Add comments to explain complex code

4. **Link to resources**
   - Link to official documentation
   - Reference related articles
   - Cite your sources

### Example Blog Post Structure

```
Title: "Building a Blog with Astro and Sanity"

Content:
[Introduction]
- Hook the reader
- Explain what they'll learn
- Mention prerequisites

[What You'll Learn] (H2)
- Bullet points of topics covered

[Prerequisites] (H2)
- List required knowledge/tools

[Step 1: Setup] (H2)
[Detailed instructions with code blocks]

[Step 2: Configuration] (H2)
[More instructions]

[Troubleshooting] (H2)
[Common issues and solutions]

[Conclusion] (H2)
- Summary
- Next steps
- Call to action
```

## Adding Images and Media

### Uploading Images

1. In any image field, click **Upload**
2. Select image from your computer
3. Supported formats: JPG, PNG, GIF, WebP
4. Maximum file size: 10MB

### Image Optimization Tips

- Use WebP format for better compression
- Compress images before uploading
- Use descriptive filenames (e.g., "astro-sanity-setup.png" not "IMG_1234.png")
- Add alt text for accessibility and SEO

### Using Unsplash (Optional)

You can integrate Unsplash for free stock images:

1. Install the Unsplash plugin in Sanity
2. Search and insert images directly
3. Always check license requirements

## Publishing Your Post

### Draft vs Published

1. **Draft**: Save as draft to work on later
   - Click **Save** (top right)
   - Post won't appear on your site

2. **Published**: Make post live
   - Click **Publish** (top right)
   - Post immediately appears on your site

### Publishing Workflow

1. Review your post for errors
2. Check preview if available
3. Click **Publish**
4. Post is now live on your blog

### Unpublishing/Editing

- **Edit**: Open published post, make changes, click **Publish** to update
- **Unpublish**: Click the three dots menu → **Unpublish**
- **Delete**: Click the three dots menu → **Delete** (permanently removes)

## Managing Categories and Tags

### Creating Categories

1. Go to **Category** in Sanity Studio
2. Click **+ New category**
3. Add title and description
4. Click **Publish**

### Using Categories Effectively

- Use broad, high-level categories
- Limit to 5-10 total categories
- Examples:
  - Tutorials
  - Best Practices
  - News & Updates
  - Case Studies
  - Quick Tips

### Using Tags Effectively

- Use specific, descriptive tags
- Create as many as needed
- Examples:
  - Specific technologies: "React", "TypeScript", "Docker"
  - Concepts: "Performance", "Security", "Testing"
  - Difficulty levels: "Beginner", "Intermediate", "Advanced"

## Best Practices

### SEO Tips

1. **Keywords in title**: Put main keywords at the start
2. **Compelling excerpts**: Write click-worthy summaries
3. **Internal linking**: Link to your other posts
4. **Image alt text**: Describe images for search engines
5. **Meta descriptions**: Write unique descriptions for each post

### Content Quality

1. **Original content**: Don't plagiarize
2. **Proofread**: Check for grammar and spelling
3. **Fact-check**: Verify technical information
4. **Update regularly**: Keep old posts current
5. **Add value**: Share unique insights

### Publishing Schedule

- Start with 1-2 posts per week
- Consistency beats frequency
- Use scheduling for future posts
- Build a content calendar

## Local Development Workflow

### View Your Posts Locally

1. Start your development server:
```bash
npm run dev
```

2. Visit http://localhost:4323 for Sanity Studio
3. Visit http://localhost:4323 to see your blog
4. Changes appear in real-time as you publish

### Testing Before Publishing

1. Create post as draft
2. Preview in Sanity Studio if available
3. Publish to see on local site
4. Check responsive design (mobile/tablet/desktop)
5. Test all links and code examples

## Advanced Features

### Scheduled Publishing

Set a future publish date to auto-publish:

1. Set **Published Date** to future date/time
2. Click **Publish**
3. Post goes live automatically at scheduled time

### Cross-posting

Share your published post:

1. Copy the URL from your live site
2. Share on social media
3. Post to developer communities
4. Add to your portfolio

## Troubleshooting

### Post Not Appearing

1. Check post status is "Published" not "Draft"
2. Verify you're looking at the correct environment
3. Clear browser cache
4. Check browser console for errors

### Images Not Loading

1. Verify images are uploaded in Sanity
2. Check image URLs are correct
3. Ensure CDN is configured properly
4. Check file size doesn't exceed limits

### Formatting Issues

1. Check Portable Text blocks are properly structured
2. Verify no invalid HTML in code blocks
3. Test in different browsers
4. Check custom CSS isn't conflicting

## Next Steps

After publishing your first post:

1. Share on social media
2. Add comments section (optional)
3. Add reading time indicator
4. Implement related posts feature
5. Add newsletter signup

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [Portable Text Guide](https://www.portabletext.io/)
- [Astro Documentation](https://docs.astro.build)
- [SEO Best Practices](https://developers.google.com/search/docs)

---

Happy blogging! If you need help, check the Sanity community forums or Astro Discord.
