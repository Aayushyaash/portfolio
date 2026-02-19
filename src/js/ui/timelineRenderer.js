/**
 * Timeline Renderer Module
 * Renders the interactive timeline section from timeline.md data.
 */

import { escapeHtml, isEmptyLink, sanitize } from '../utils/htmlHelpers.js';

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
/**
 * Renders the left panel milestone menu items.
 * @param {Array} milestones - Array of milestone objects.
 */
function renderMilestoneMenu(milestones) {
    const menu = document.getElementById('timeline-menu');
    if (!menu) return;

    menu.innerHTML = '';
    const template = document.getElementById('timeline-menu-item-template');
    if (!template) return;

    milestones.forEach((m, i) => {
        const id = i + 1;
        const isActive = i === 0;
        const colors = COLOR_MAP[m.typeColor] || COLOR_MAP.accent;

        const clone = template.content.cloneNode(true);
        const group = clone.querySelector('.timeline-menu-group');
        const item = clone.querySelector('.milestone-item');
        const inlinePane = clone.querySelector('.inline-content-pane');

        // Set IDs and Data Attributes
        item.id = `menu-${id}`;
        item.dataset.id = id;
        item.setAttribute('aria-label', `${m.title} — ${m.organization}`);
        inlinePane.id = `inline-pane-${id}`;

        // Content
        clone.querySelector('.milestone-title').textContent = m.title;
        clone.querySelector('.milestone-date').textContent = m.date;
        clone.querySelector('.milestone-org').textContent = m.organization;
        clone.querySelector('.milestone-summary').textContent = m.summary;

        // Active State Styling (Initial)
        if (isActive) {
            item.classList.add('active', 'border-accent', 'bg-surfaceHighlight');
            item.classList.remove('border-transparent');
            clone.querySelector('.milestone-title').classList.replace('text-muted', 'text-white');
            clone.querySelector('.milestone-org').classList.replace('text-muted', 'text-accentBlue');
            inlinePane.classList.add('active'); // Open first item on mobile by default? Logic says yes.
        } else {
            // Ensure defaults
        }

        // Render Inline Content (for mobile accordion)
        // We reuse the same content generation logic but append to inline pane
        renderMilestonePaneContent(inlinePane, m, colors);

        menu.appendChild(clone);
    });
}

/**
 * Renders the right panel content panes for all milestones.
 * @param {Array} milestones - Array of milestone objects.
 */
/**
 * Renders the right panel content panes for all milestones.
 * @param {Array} milestones - Array of milestone objects.
 */
function renderMilestoneContent(milestones) {
    const content = document.getElementById('timeline-content');
    if (!content) return;
    content.innerHTML = '';

    const template = document.getElementById('timeline-pane-template');
    if (!template) return;

    milestones.forEach((m, i) => {
        const id = i + 1;
        const isActive = i === 0;
        const colors = COLOR_MAP[m.typeColor] || COLOR_MAP.accent;

        const clone = template.content.cloneNode(true);
        const pane = clone.querySelector('.content-pane');

        pane.id = `pane-${id}`;
        if (isActive) pane.classList.remove('hidden'); // Logic differs slightly from CSS class 'active', ensure compatibility

        // We need to render the INNER content into this pane
        renderMilestonePaneContent(pane, m, colors);

        content.appendChild(clone);
    });
}

/**
 * Renders the inner content of a milestone pane (without wrapper).
 * @param {object} milestone - Milestone data object.
 * @param {object} colors - Color mapping for this milestone.
 * @returns {string} HTML string.
 */
/**
 * Renders the inner content of a milestone pane (without wrapper).
 * Appends to presentation container.
 * @param {HTMLElement} container - Container to append to.
 * @param {object} milestone - Milestone data object.
 * @param {object} colors - Color mapping for this milestone.
 */
function renderMilestonePaneContent(container, milestone, colors) {
    const template = document.getElementById('timeline-inner-content-template');
    if (!template) return;

    const clone = template.content.cloneNode(true);

    // Header
    const typeEl = clone.querySelector('.milestone-type');
    typeEl.className = `milestone-type px-3 py-1 text-xs font-bold rounded-full border ${colors.badge}`;
    typeEl.textContent = milestone.type;

    clone.querySelector('.milestone-date-range').textContent = milestone.dateRange;
    clone.querySelector('.milestone-full-title').textContent = milestone.title;

    clone.querySelector('.milestone-org-icon').textContent = milestone.organizationIcon;
    clone.querySelector('.milestone-org-name').textContent = milestone.organization;

    // Description (Safe HTML)
    clone.querySelector('.milestone-description').innerHTML = sanitize(milestone.description);

    // Boxes
    const boxesContainer = clone.querySelector('.milestone-boxes');
    renderBox(boxesContainer, milestone.leftBox, colors);
    renderBox(boxesContainer, milestone.rightBox, colors);

    // Links
    const linksSection = clone.querySelector('.milestone-links');
    const linksContainer = clone.querySelector('.links-container');
    renderLinks(linksContainer, milestone.links);

    if (milestone.links && milestone.links.length > 0 && linksContainer.hasChildNodes()) {
        linksSection.classList.remove('hidden');
    }

    container.appendChild(clone);
}

/**
 * Renders a detail box (left or right) within a content pane.
 * @param {HTMLElement} container
 * @param {object} box
 * @param {object} colors
 */
function renderBox(container, box, colors) {
    if (!box) return;

    const template = document.getElementById('timeline-box-template');
    if (!template) return;

    const clone = template.content.cloneNode(true);

    // Icon Color Logic
    const iconColorKey = box.iconColor || 'accent';
    const iconClass = (COLOR_MAP[iconColorKey] || colors).icon || colors.icon;

    const iconEl = clone.querySelector('.box-icon');
    iconEl.className = `material-symbols-outlined box-icon text-lg ${iconClass}`;
    iconEl.textContent = box.icon;

    clone.querySelector('.box-title-text').textContent = box.title;

    // Items
    const contentDiv = clone.querySelector('.box-content');
    if (box.items && Array.isArray(box.items)) {
        if (box.isList) {
            const ul = document.createElement('ul');
            ul.className = 'text-xs text-gray-400 space-y-2 list-disc pl-4';
            box.items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            contentDiv.appendChild(ul);
        } else {
            const div = document.createElement('div');
            div.className = 'flex flex-wrap gap-2';
            box.items.forEach(item => {
                const span = document.createElement('span');
                span.className = `px-2 py-1 ${colors.tag} text-xs rounded border`;
                span.textContent = item;
                div.appendChild(span);
            });
            contentDiv.appendChild(div);
        }
    }

    container.appendChild(clone);
}

/**
 * Renders the links section at the bottom of a content pane.
 * @param {Array} links - Array of link objects with label, icon, iconType, url.
 * @returns {string} HTML string.
 */
/**
 * Renders the links section at the bottom of a content pane.
 * @param {HTMLElement} container
 * @param {Array} links
 */
function renderLinks(container, links) {
    if (!links || !Array.isArray(links) || links.length === 0) return;

    const validLinks = links.filter(link => !isEmptyLink(link.url));
    if (validLinks.length === 0) return;

    validLinks.forEach(link => {
        const a = document.createElement('a');
        a.className = 'flex items-center gap-2 text-sm text-white bg-surfaceHighlight hover:bg-surface border border-border px-4 py-2 rounded-lg transition-all';
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        if (link.iconType === 'fa') {
            const i = document.createElement('i');
            i.className = `fab ${link.icon}`;
            a.appendChild(i);
        } else {
            const span = document.createElement('span');
            span.className = 'material-symbols-outlined text-sm';
            span.textContent = link.icon;
            a.appendChild(span);
        }

        a.appendChild(document.createTextNode(' ' + link.label));
        container.appendChild(a);
    });
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
