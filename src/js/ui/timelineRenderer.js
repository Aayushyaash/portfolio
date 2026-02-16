/**
 * Timeline Renderer Module
 * Renders the interactive timeline section from timeline.md data.
 */

import { escapeHtml, isEmptyLink } from '../utils/htmlHelpers.js';

/**
 * Color mapping for milestone type badges, box items, and icons.
 * All Tailwind classes MUST appear as literal strings here for PostCSS tree-shaking.
 * Dynamic class construction (e.g., `text-${var}`) will NOT be included in the built CSS.
 */
const COLOR_MAP = {
    accent: {
        badge: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
        tag: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: 'text-accent'
    },
    purple: {
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        tag: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: 'text-purple-400'
    },
    orange: {
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        tag: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        icon: 'text-orange-400'
    },
    pink: {
        badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        tag: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        icon: 'text-pink-400'
    }
};

/**
 * Renders the timeline section. Checks activate flag to toggle visibility.
 * @param {object} timelineData - Parsed timeline.md data.
 */
export function renderTimeline(timelineData) {
    const section = document.getElementById('timeline');
    const navLink = document.getElementById('nav-timeline');

    if (!timelineData) return;

    const isActive = timelineData.activate !== false && timelineData.activate !== "false";

    // Toggle nav link visibility (works on both index.html and resume.html)
    if (navLink) {
        navLink.style.display = isActive ? '' : 'none';
    }

    // Only render timeline content if section exists (index.html only)
    if (!section) return;

    if (!isActive) {
        section.style.display = 'none';
        return;
    }

    section.style.display = '';

    const milestones = timelineData.milestones;
    if (!milestones || !Array.isArray(milestones) || milestones.length === 0) return;

    renderMilestoneMenu(milestones);
    renderMilestoneContent(milestones);
}

/**
 * Attaches click handlers for milestone selection via event delegation.
 */
export function setupMilestoneInteraction() {
    const menu = document.getElementById('timeline-menu');
    if (!menu) return;

    menu.addEventListener('click', (e) => {
        const item = e.target.closest('.milestone-item');
        if (!item) return;
        const id = item.dataset.id;
        selectMilestone(id);
    });

    // Keyboard support for milestone items
    menu.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const item = e.target.closest('.milestone-item');
        if (!item) return;
        e.preventDefault();
        selectMilestone(item.dataset.id);
    });
}

/**
 * Renders the left panel milestone menu items.
 * @param {Array} milestones - Array of milestone objects.
 */
function renderMilestoneMenu(milestones) {
    const menu = document.getElementById('timeline-menu');
    if (!menu) return;

    menu.innerHTML = milestones.map((m, i) => {
        const id = i + 1;
        const isActive = i === 0;
        const safeTitle = escapeHtml(m.title);
        const safeOrg = escapeHtml(m.organization);
        const safeSummary = escapeHtml(m.summary);
        const safeDate = escapeHtml(m.date);
        const colors = COLOR_MAP[m.typeColor] || COLOR_MAP.accent;

        return `
            <div class="milestone-item ${isActive ? 'active' : ''} p-4 cursor-pointer hover:bg-surfaceHighlight transition-colors rounded-r-lg border-l-4 ${isActive ? 'border-accent bg-surfaceHighlight' : 'border-transparent'} group"
                 id="menu-${id}" data-id="${id}" tabindex="0" role="button" aria-label="${safeTitle} — ${safeOrg}">
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold ${isActive ? 'text-white' : 'text-muted'} group-hover:text-accent transition-colors">${safeTitle}</h4>
                    <span class="text-[10px] font-mono text-muted bg-bg px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">${safeDate}</span>
                </div>
                <p class="text-sm ${isActive ? 'text-accentBlue' : 'text-muted'} group-hover:text-accentBlue font-medium milestone-org">${safeOrg}</p>
                <p class="text-xs text-muted mt-2 line-clamp-2">${safeSummary}</p>
            </div>
            <div class="inline-content-pane ${isActive ? 'active' : ''} bg-bg px-6" id="inline-pane-${id}">
                ${renderMilestonePaneContent(m, colors)}
            </div>
        `;
    }).join('');
}

/**
 * Renders the right panel content panes for all milestones.
 * @param {Array} milestones - Array of milestone objects.
 */
function renderMilestoneContent(milestones) {
    const content = document.getElementById('timeline-content');
    if (!content) return;

    content.innerHTML = milestones.map((m, i) => renderMilestonePane(m, i)).join('');
}

/**
 * Renders the inner content of a milestone pane (without wrapper).
 * @param {object} milestone - Milestone data object.
 * @param {object} colors - Color mapping for this milestone.
 * @returns {string} HTML string.
 */
function renderMilestonePaneContent(milestone, colors) {
    const safeType = escapeHtml(milestone.type);
    const safeDateRange = escapeHtml(milestone.dateRange);
    const safeTitle = escapeHtml(milestone.title);
    const safeOrg = escapeHtml(milestone.organization);
    const safeOrgIcon = escapeHtml(milestone.organizationIcon);
    const safeDescription = escapeHtml(milestone.description);

    const leftBoxHtml = renderBox(milestone.leftBox, colors);
    const rightBoxHtml = renderBox(milestone.rightBox, colors);
    const linksHtml = renderLinks(milestone.links);

    return `
        <div class="flex items-center gap-3 mb-6">
            <span class="px-3 py-1 ${colors.badge} text-xs font-bold rounded-full border">${safeType}</span>
            <span class="h-px w-12 bg-border"></span>
            <span class="text-xs font-mono text-muted">${safeDateRange}</span>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">${safeTitle}</h2>
        <div class="text-accentBlue flex items-center gap-1 mb-8">
            <span class="material-symbols-outlined text-lg">${safeOrgIcon}</span> ${safeOrg}
        </div>
        <div class="prose prose-invert max-w-none mb-10">
            <p class="text-gray-300 leading-relaxed">${safeDescription}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            ${leftBoxHtml}
            ${rightBoxHtml}
        </div>
        ${linksHtml}
    `;
}

/**
 * Renders a single milestone content pane.
 * @param {object} milestone - Milestone data object.
 * @param {number} index - Zero-based index.
 * @returns {string} HTML string.
 */
function renderMilestonePane(milestone, index) {
    const id = index + 1;
    const isActive = index === 0;
    const colors = COLOR_MAP[milestone.typeColor] || COLOR_MAP.accent;

    return `
        <div class="content-pane ${isActive ? 'active' : ''}" id="pane-${id}">
            ${renderMilestonePaneContent(milestone, colors)}
        </div>
    `;
}

/**
 * Renders a detail box (left or right) within a content pane.
 * @param {object} box - Box data with title, icon, iconColor, items, isList.
 * @param {object} colors - Color mapping for tags.
 * @returns {string} HTML string.
 */
function renderBox(box, colors) {
    if (!box) return '';

    const safeTitle = escapeHtml(box.title);
    const safeIcon = escapeHtml(box.icon);
    // Resolve icon color via COLOR_MAP to avoid dynamic Tailwind class construction
    const iconColorKey = box.iconColor || 'accent';
    const iconClass = (COLOR_MAP[iconColorKey] || colors).icon || colors.icon;

    let itemsHtml = '';
    if (box.items && Array.isArray(box.items)) {
        if (box.isList) {
            // Render as bullet list
            itemsHtml = `
                <ul class="text-xs text-gray-400 space-y-2 list-disc pl-4">
                    ${box.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            `;
        } else {
            // Render as tag badges
            itemsHtml = `
                <div class="flex flex-wrap gap-2">
                    ${box.items.map(item => `<span class="px-2 py-1 ${colors.tag} text-xs rounded border">${escapeHtml(item)}</span>`).join('')}
                </div>
            `;
        }
    }

    return `
        <div class="bg-surface border border-border p-5 rounded-xl">
            <h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined ${iconClass} text-lg">${safeIcon}</span> ${safeTitle}
            </h4>
            ${itemsHtml}
        </div>
    `;
}

/**
 * Renders the links section at the bottom of a content pane.
 * @param {Array} links - Array of link objects with label, icon, iconType, url.
 * @returns {string} HTML string.
 */
function renderLinks(links) {
    if (!links || !Array.isArray(links) || links.length === 0) return '';

    const validLinks = links.filter(link => !isEmptyLink(link.url));
    if (validLinks.length === 0) return '';

    const linksHtml = validLinks.map(link => {
        const safeLabel = escapeHtml(link.label);
        const safeUrl = escapeHtml(link.url);
        const safeIcon = escapeHtml(link.icon);

        let iconHtml = '';
        if (link.iconType === 'fa') {
            iconHtml = `<i class="fab ${safeIcon}"></i>`;
        } else {
            iconHtml = `<span class="material-symbols-outlined text-sm">${safeIcon}</span>`;
        }

        return `
            <a class="flex items-center gap-2 text-sm text-white bg-surfaceHighlight hover:bg-surface border border-border px-4 py-2 rounded-lg transition-all"
               href="${safeUrl}" target="_blank" rel="noopener noreferrer">
                ${iconHtml} ${safeLabel}
            </a>
        `;
    }).join('');

    return `
        <div class="border-t border-border pt-8">
            <h4 class="text-xs font-mono font-bold text-muted uppercase tracking-widest mb-4">Related Project Links</h4>
            <div class="flex gap-4">
                ${linksHtml}
            </div>
        </div>
    `;
}

/**
 * Switches active milestone in menu and content pane.
 * @param {string|number} id - Milestone ID (1-based).
 */
function selectMilestone(id) {
    // Reset all menu items
    document.querySelectorAll('.milestone-item').forEach(el => {
        el.classList.remove('active', 'border-accent', 'bg-surfaceHighlight');
        el.classList.add('border-transparent');
        const h4 = el.querySelector('h4');
        if (h4) {
            h4.classList.remove('text-white');
            h4.classList.add('text-muted');
        }
        const org = el.querySelector('.milestone-org');
        if (org) {
            org.classList.remove('text-accentBlue');
            org.classList.add('text-muted');
        }
    });

    // Activate clicked item
    const activeItem = document.getElementById('menu-' + id);
    if (activeItem) {
        activeItem.classList.add('active', 'border-accent', 'bg-surfaceHighlight');
        activeItem.classList.remove('border-transparent');
        const h4 = activeItem.querySelector('h4');
        if (h4) {
            h4.classList.remove('text-muted');
            h4.classList.add('text-white');
        }
        const org = activeItem.querySelector('.milestone-org');
        if (org) {
            org.classList.remove('text-muted');
            org.classList.add('text-accentBlue');
        }
    }

    // Hide all desktop panes
    document.querySelectorAll('.content-pane').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected desktop pane
    const activePane = document.getElementById('pane-' + id);
    if (activePane) {
        activePane.classList.add('active');
    }

    // Toggle inline panes (mobile accordion)
    const currentActive = document.querySelector('.inline-content-pane.active');
    const inlinePane = document.getElementById('inline-pane-' + id);

    // If collapsing a pane above the new selection on mobile,
    // smoothly collapse while adjusting scroll to keep selected element in place
    if (currentActive && inlinePane && currentActive !== inlinePane
        && window.innerWidth < 1024
        && currentActive.compareDocumentPosition(inlinePane) & Node.DOCUMENT_POSITION_FOLLOWING) {
        const menuItem = document.getElementById('menu-' + id);
        const anchorTop = menuItem ? menuItem.getBoundingClientRect().top : null;

        currentActive.classList.remove('active');

        // Continuously compensate scroll during the CSS transition
        if (anchorTop !== null && menuItem) {
            const startTime = performance.now();
            const loop = (timestamp) => {
                const currentTop = menuItem.getBoundingClientRect().top;
                const drift = currentTop - anchorTop;
                if (Math.abs(drift) > 0.5) {
                    window.scrollBy(0, drift);
                }
                if (timestamp - startTime < 420) {
                    requestAnimationFrame(loop);
                }
            };
            requestAnimationFrame(loop);
        }
    } else {
        document.querySelectorAll('.inline-content-pane').forEach(el => {
            el.classList.remove('active');
        });
    }

    if (inlinePane) {
        inlinePane.classList.add('active');
    }
}
