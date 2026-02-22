/**
 * Error Handling Utilities
 * Provides user-friendly error messages.
 */

import { escapeHtml } from './htmlHelpers.js';

/**
 * Shows an error message to the user as an inline banner.
 * Preserves pre-rendered SSG content instead of replacing the entire page.
 * @param {string} message - Error message to display.
 */
export function showError(message) {
    const container = document.querySelector('main') || document.body;
    
    // Remove existing error banner if present
    const existingBanner = container.querySelector('.error-banner');
    if (existingBanner) existingBanner.remove();
    
    // Create inline error banner
    const banner = document.createElement('div');
    banner.className = 'error-banner bg-red-500/10 border-b border-red-500/30 text-red-400 px-6 py-4 flex items-center justify-between gap-4';
    banner.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-red-500">error</span>
            <p class="text-sm">${escapeHtml(message)}</p>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="window.location.reload()" class="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded transition-colors">
                Reload
            </button>
            <button onclick="this.closest('.error-banner').remove()" class="text-red-400 hover:text-white transition-colors p-1">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>
        </div>
    `;
    
    // Prepend banner to main content (preserves SSG-rendered content)
    container.prepend(banner);
    
    // Scroll to top to show banner
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Shows a fatal error that replaces page content (for unrecoverable errors).
 * Use sparingly - prefer showError() for most cases.
 * @param {string} message - Error message to display.
 */
export function showFatalError(message) {
    const container = document.querySelector('main') || document.body;

    const errorHtml = `
        <div class="min-h-screen bg-bg flex items-center justify-center p-8">
            <div class="max-w-md w-full bg-surface border border-red-500/50 rounded-xl p-8 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-red-500 text-4xl">error</span>
                </div>
                <h2 class="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
                <p class="text-muted mb-6">${escapeHtml(message)}</p>
                <button onclick="window.location.reload()" class="px-6 py-2 bg-accent text-bg rounded-lg hover:bg-yellow-400/80 transition-colors font-medium">
                    Reload Page
                </button>
            </div>
        </div>
    `;

    container.innerHTML = errorHtml;
}
