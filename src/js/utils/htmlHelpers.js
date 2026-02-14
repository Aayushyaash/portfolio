/**
 * HTML Helper Utilities
 * Centralized HTML generation with sanitization.
 */

/**
 * Checks if a URL is empty/placeholder.
 * @param {string} url - URL to check.
 * @returns {boolean} True if the URL is empty or "#".
 */
export function isEmptyLink(url) {
    return !url || url === '#';
}

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} unsafe - Potentially unsafe string.
 * @returns {string} HTML-safe string.
 */
export function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Renders tags as HTML badges.
 * @param {Array<string>} tags - Array of tag strings.
 * @param {string} size - Size variant: 'sm' (text-xs) or 'xs' (text-[10px]).
 * @returns {string} HTML string of tag badges.
 */
export function renderTags(tags, size = 'sm') {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return '';
    }

    const sizeClass = size === 'xs' ? 'text-[10px]' : 'text-xs';

    return tags
        .map(tag => {
            const escapedTag = escapeHtml(tag);
            return `<span class="${sizeClass} font-mono px-2 py-0.5 bg-blue-500/10 text-accentBlue rounded">${escapedTag}</span>`;
        })
        .join('');
}

/**
 * Renders project/external links safely.
 * @param {string} githubLink - GitHub repository URL.
 * @param {string} externalLink - External project URL.
 * @param {string} iconSize - Icon size (e.g., 'text-2xl' or 'text-[18px]').
 * @param {string} iconType - 'fa' for Font Awesome or 'material' for Material Icons.
 * @returns {string} HTML string of links.
 */
export function renderProjectLinks(githubLink, externalLink, iconSize = 'text-2xl', iconType = 'fa') {
    let html = '';

    if (!isEmptyLink(githubLink)) {
        const escapedLink = escapeHtml(githubLink);
        if (iconType === 'fa') {
            html += `<a href="${escapedLink}" target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub" class="text-white hover:text-accent transition-colors ${iconSize}"><i class="fab fa-github"></i></a>`;
        } else {
            html += `<a href="${escapedLink}" target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub" class="text-muted hover:text-accent transition-colors flex items-center"><i class="fab fa-github ${iconSize}"></i></a>`;
        }
    }

    if (!isEmptyLink(externalLink)) {
        const escapedLink = escapeHtml(externalLink);
        if (iconType === 'fa') {
            html += `<a href="${escapedLink}" target="_blank" rel="noopener noreferrer" aria-label="Visit live site" class="text-white hover:text-accent transition-colors ${iconSize}"><i class="fas fa-external-link-alt"></i></a>`;
        } else {
            html += `<a href="${escapedLink}" target="_blank" rel="noopener noreferrer" aria-label="Visit live site" class="text-muted hover:text-accent transition-colors flex items-center"><span class="material-symbols-outlined ${iconSize}">open_in_new</span></a>`;
        }
    }

    return html;
}
