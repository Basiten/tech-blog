import Fuse from 'fuse.js';

export function initSearch(posts, baseUrl, currentLang) {
  const currentLanguage = currentLang || 'en';

  const fuse = new Fuse(posts, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'excerpt', weight: 1.5 },
      { name: 'tags', weight: 1.5 }
    ],
    threshold: 0.3,
    includeScore: true
  });

  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const noResults = document.getElementById('no-results');

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function renderResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<p class="text-gray-600 dark:text-gray-400 text-center py-8">Start typing to search...</p>';
      noResults.classList.add('hidden');
      return;
    }

    const html = results.map(post => {
      const blogPath = currentLanguage === 'en' ? '/blog/' : `/${currentLanguage}/blog/`;
      return `
      <article class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
        <a href="${baseUrl}${blogPath}${post.slug}" class="block group">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            ${post.title}
          </h2>
          <time datetime="${post.publishedAt}" class="text-sm text-gray-500 dark:text-gray-400 mb-3 block">
            ${formatDate(post.publishedAt)}
          </time>
          <p class="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
            ${post.excerpt || 'No excerpt available.'}
          </p>
          ${post.tags.length > 0 ? `
            <div class="flex flex-wrap gap-2">
              ${post.tags.map(tag => `
                <span class="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                  #${tag}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </a>
      </article>
    `}).join('');

    searchResults.innerHTML = html;
    noResults.classList.add('hidden');
  }

  let debounceTimer;

  searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if (!query) {
        renderResults([]);
        return;
      }

      const results = fuse.search(query).map(result => result.item);

      if (results.length === 0) {
        searchResults.innerHTML = '';
        noResults.classList.remove('hidden');
      } else {
        renderResults(results);
      }
    }, 300);
  });
}
