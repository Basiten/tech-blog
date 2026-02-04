# GitHub Repository Setup Guide

This guide will walk you through setting up the GitHub repository and deploying your blog to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- Your Sanity Project ID (from your Sanity dashboard)

## Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

If you have `gh` CLI installed:

```bash
# Install GitHub CLI (if not already installed)
# On Ubuntu/Debian:
sudo apt install gh

# On macOS:
brew install gh

# Authenticate with GitHub
gh auth login

# Create a new repository
gh repo create technical-blog --public --source=. --remote=origin --push

# Or if the repository already exists remotely:
git remote add origin https://github.com/YOUR_USERNAME/technical-blog.git
git branch -M main
git push -u origin main
```

### Option B: Manual Setup

1. Go to https://github.com/new
2. Repository name: `technical-blog`
3. Set as Public (required for GitHub Pages free tier)
4. Don't initialize with README (we already have code)
5. Click "Create repository"
6. Follow the commands shown:

```bash
git remote add origin https://github.com/YOUR_USERNAME/technical-blog.git
git branch -M main
git push -u origin main
```

## Step 2: Configure GitHub Secrets

You need to add your Sanity Project ID as a repository secret for the deployment workflow to work properly.

### Adding SANITY_PROJECT_ID Secret

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `SANITY_PROJECT_ID`
6. Value: Your Sanity Project ID (from your Sanity dashboard)
7. Click **Add secret**

### Finding Your Sanity Project ID

1. Go to https://www.sanity.io/manage
2. Select your project
3. Copy the Project ID from the project URL or settings
4. Example: If URL is `https://www.sanity.io/manage/project/abc123`, your ID is `abc123`

## Step 3: Enable GitHub Pages

1. Go to your repository **Settings**
2. In the left sidebar, click **Pages**
3. Under **Build and deployment**:
   - Source: **GitHub Actions**
4. GitHub Pages is now configured to use the workflow file

## Step 4: Configure Repository Settings (Optional)

### Update Repository Details

1. Go to repository **Settings** → **General**
2. Add repository description: "A technical blog built with Astro and Sanity"
3. Add website URL: `https://YOUR_USERNAME.github.io/technical-blog`
4. Add topics: `astro`, `sanity`, `blog`, `technical-blog`

## Step 5: Update Base URL (If Needed)

If your repository name is different from `technical-blog`, update the base path in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://YOUR_USERNAME.github.io',
  base: '/YOUR_REPO_NAME',  // Update this
  // ... rest of config
});
```

Then commit and push the changes:

```bash
git add astro.config.mjs
git commit -m "chore: update base path for GitHub Pages"
git push
```

## Step 6: Verify Deployment

1. Go to **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for the workflow to complete (may take 2-3 minutes)
4. Once complete, visit: `https://YOUR_USERNAME.github.io/technical-blog`

## Troubleshooting

### Build Failures

If the build fails:

1. Check the **Actions** tab for error logs
2. Ensure `SANITY_PROJECT_ID` secret is correctly set
3. Verify your Sanity dataset is named "production"
4. Check that all dependencies are in package.json

### Pages Not Showing Content

If pages load but no content appears:

1. Verify your Sanity project has published content
2. Check the browser console for errors
3. Ensure the Sanity API is accessible from your project

### 404 Errors

If you get 404 errors:

1. Ensure GitHub Pages is enabled with "GitHub Actions" as source
2. Check that the workflow completed successfully
3. Verify the base path in astro.config.mjs matches your repo name
4. Wait a few minutes for DNS propagation

## Next Steps

Once your site is deployed:

1. Create your first blog post (see BLOG_POST_GUIDE.md)
2. Customize the about page with your information
3. Update social media links in the about page
4. Add your actual project ID to the local .env file
5. Customize the theme colors and styling

## Useful Commands

```bash
# Check git status
git status

# View recent commits
git log --oneline -10

# View remote URLs
git remote -v

# Pull latest changes
git pull origin main

# Push changes
git push origin main
```

## Environment Variables

For local development, create a `.env` file in the project root:

```env
VITE_SANITY_PROJECT_ID=your_project_id_here
VITE_SANITY_DATASET=production
```

Note: The `.env` file should NOT be committed to Git (it's already in .gitignore).
