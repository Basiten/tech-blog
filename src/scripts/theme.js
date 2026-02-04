function toggleTheme() {
	const html = document.documentElement;
	const isDark = html.classList.toggle('dark');
	localStorage.setItem('theme', isDark ? 'dark' : 'light');
	updateIcon(isDark);
}

function updateIcon(isDark) {
	const button = document.getElementById('theme-toggle');
	if (!button) return;

	const sunIcon = button.querySelector('.sun-icon');
	const moonIcon = button.querySelector('.moon-icon');

	if (sunIcon && moonIcon) {
		if (isDark) {
			sunIcon.classList.remove('hidden');
			moonIcon.classList.add('hidden');
		} else {
			sunIcon.classList.add('hidden');
			moonIcon.classList.remove('hidden');
		}
	}
}

function initializeTheme() {
	const html = document.documentElement;
	const storedTheme = localStorage.getItem('theme');
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

	const isDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

	if (isDark) {
		html.classList.add('dark');
	}

	updateIcon(isDark);
}

// Initialize on load
initializeTheme();

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
	if (!localStorage.getItem('theme')) {
		const isDark = e.matches;
		document.documentElement.classList.toggle('dark', isDark);
		updateIcon(isDark);
	}
});

// Attach click handler
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
