/**
 * Error Handling Utilities
 * Provides user-friendly error messages.
 */

import { escapeHtml } from './htmlHelpers.js';

/**
 * Shows an error message to the user.
 * @param {string} message - Error message to display.
 */
export function showError(message) {
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
