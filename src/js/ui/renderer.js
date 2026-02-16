/**
 * UI Renderer Module
 * Handles DOM updates for profile, projects, and resume content.
 */

import { escapeHtml, renderTags, renderProjectLinks } from '../utils/htmlHelpers.js';

/**
 * Renders user profile information.
 * @param {object} profile - Profile data.
 */
export function renderProfile(profile) {
    if (!profile) return;

    // Validates/Parsed Name
    const nameParts = (profile.name || "User Name").split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || "";

    // Update Header info
    setText('.profile-name', firstName);
    setText('.profile-full-name-last', lastName);
    setText('.profile-subtitle', profile.subtitle);

    // Update Hero section
    if (profile.hero) {
        const heroTitleNode = document.getElementById('hero-title') || document.querySelector('h1.text-4xl');
        if (heroTitleNode) {
            const highlightText = profile.hero.highlight || "Code & Design";
            const titleText = profile.hero.title || "Building the future with";

            heroTitleNode.innerHTML = `
                ${escapeHtml(titleText)} <br/>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-200 hero-title-highlight">${escapeHtml(highlightText)}</span>
             `;
        }
    }
    setText('.hero-bio', profile.bio);

    // Update Colors
    applyTheme(profile);

    // Update Stats
    setText('.stat-experience', profile.experience);
    setText('.stat-projects', profile.projectsCount);

    // Update Image
    const heroImg = document.querySelector('.hero-image');
    if (heroImg && profile.image) {
        heroImg.src = profile.image;
        heroImg.alt = profile.name;
    }

    // Update Footer
    setText('.footer-year', new Date().getFullYear());
    const emailLink = document.querySelector('.contact-email');
    if (emailLink && profile.social?.email) {
        emailLink.href = `mailto:${profile.social.email}`;
    }

    // Update Skills
    if (profile.skills) {
        setText('#skill-frontend', profile.skills.frontend);
        setText('#skill-backend', profile.skills.backend);
        setText('#skill-database', profile.skills.database);
        setText('#skill-devops', profile.skills.devops);
    }

    // Update Availability
    renderAvailability(profile.availability);

    // Update Social Sidebar
    if (profile.social) {
        updateLink('.social-github', profile.social.github);
        setText('.social-github-label', profile.social.githubLabel);

        updateLink('.social-linkedin', profile.social.linkedin);
        setText('.social-linkedin-label', profile.social.linkedinLabel);

        updateLink('.project-view-github', profile.social.github);
    }
}

/**
 * Renders the project list, split into featured (large cards) and non-featured (compact grid).
 * @param {Array} projects - List of project objects.
 */
export function renderProjects(projects) {
    const featuredContainer = document.getElementById('projects-container');
    const otherSection = document.getElementById('other-projects-section');
    const otherContainer = document.getElementById('other-projects-container');

    if (!projects || !projects.length) return;

    const featured = projects.filter(p => p.featured === true);
    const nonFeatured = projects.filter(p => p.featured !== true);

    // Render featured projects as large cards
    if (featuredContainer) {
        featuredContainer.innerHTML = featured.length > 0
            ? featured.map((project, index) => createProjectCard(project, index)).join('')
            : '';
    }

    // Render non-featured projects as compact grid
    if (otherSection && otherContainer) {
        if (nonFeatured.length > 0) {
            otherSection.style.display = '';
            otherContainer.innerHTML = nonFeatured.map(p => createCompactProjectCard(p)).join('');
        } else {
            otherSection.style.display = 'none';
        }
    }
}

/**
 * Creates HTML for a single project card.
 * @param {object} project - Project data.
 * @param {number} index - Index for numbering.
 * @returns {string} HTML string.
 */
function createProjectCard(project, index) {
    const num = (index + 1).toString().padStart(2, '0');
    const isEven = index % 2 !== 0;
    const textColClass = "lg:col-span-5 p-6 lg:p-8";

    // Logic for swapping order
    const imageOrder = isEven ? "order-1 lg:order-2" : "";
    const textOrder = isEven ? "order-2 lg:order-1" : "";

    const tagsHtml = renderTags(project.tags, 'sm');
    const linksHtml = renderProjectLinks(project.githubLink, project.externalLink, 'text-2xl', 'fa');

    // Escape user content
    const safeTitle = escapeHtml(project.title);
    const safeDescription = escapeHtml(project.description);
    const safeImage = escapeHtml(project.image);

    // Gradient direction alternates with layout
    const gradientDir = isEven ? 'from-accentBlue/10' : 'from-accent/10';

    // Skeleton placeholder HTML (used for no-image and as onerror fallback)
    const skeletonHtml = `<div class="grid grid-cols-3 gap-4 flex-1">
                <div class="col-span-2 space-y-3">
                    <div class="h-4 bg-border/50 rounded w-3/4"></div>
                    <div class="h-20 bg-border/30 rounded w-full"></div>
                    <div class="h-12 bg-border/20 rounded w-5/6"></div>
                </div>
                <div class="bg-accentBlue/20 rounded-lg"></div>
            </div>`;

    // Browser window inner content: image (with onerror fallback) or skeleton
    const windowContent = project.image
        ? `<img src="${safeImage}" alt="${safeTitle}" loading="lazy" class="w-full flex-1 object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='';">
           <div class="hidden">${skeletonHtml}</div>`
        : skeletonHtml;

    return `
    <div class="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-border bg-surface p-1 rounded-2xl hover:border-yellow-400/50 transition-all duration-300">
        <!-- Image Section with Browser Window Effect -->
        <div class="lg:col-span-7 ${imageOrder}">
            <div class="project-window-container">
                <!-- Yellow glow overlay -->
                <div class="absolute inset-0 bg-gradient-to-br ${gradientDir} to-transparent pointer-events-none"></div>
                <!-- Browser Window (slides up on hover) -->
                <div class="project-browser-window">
                    <div class="flex items-center gap-2 mb-4 shrink-0">
                        <div class="w-3 h-3 rounded-full bg-red-500"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    ${windowContent}
                </div>
            </div>
        </div>

        <!-- Text Section -->
        <div class="${textColClass} ${textOrder}">
            <div class="text-accentBlue font-mono text-sm mb-2">${num}. PROJECT</div>
            <h3 class="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors">${safeTitle}</h3>
            <p class="text-gray-400 mb-6 leading-relaxed">${safeDescription}</p>
            <div class="flex flex-wrap gap-2 mb-8 font-mono text-xs text-gray-300">
                ${tagsHtml}
            </div>
            <div class="flex items-center gap-4">
                ${linksHtml}
            </div>
        </div>
    </div>
    `;
}

/**
 * Creates HTML for a compact project card (non-featured).
 * @param {object} project - Project data.
 * @returns {string} HTML string.
 */
function createCompactProjectCard(project) {
    const tagsHtml = renderTags(project.tags, 'xs');
    const linksHtml = renderProjectLinks(project.githubLink, project.externalLink, 'text-lg', 'fa');

    const safeTitle = escapeHtml(project.title);
    const safeDescription = escapeHtml(project.description);

    return `
    <div class="bg-surface border border-border p-6 rounded-xl hover:border-yellow-400/50 transition-all group flex flex-col">
        <div class="flex justify-between items-start mb-3">
            <span class="material-symbols-outlined text-muted text-2xl">folder_open</span>
            <div class="flex gap-3">${linksHtml}</div>
        </div>
        <h4 class="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">${safeTitle}</h4>
        <p class="text-sm text-muted mb-4 line-clamp-3 flex-1">${safeDescription}</p>
        <div class="flex flex-wrap gap-2 mt-auto">${tagsHtml}</div>
    </div>`;
}

// Helpers

/**
 * Sets text content of an element.
 * @param {string} selector - CSS selector.
 * @param {string} value - Text value to set.
 */
function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value) el.textContent = value;
}

/**
 * Updates the href attribute of an element.
 * @param {string} selector - CSS selector.
 * @param {string} url - URL to set.
 */
function updateLink(selector, url) {
    const el = document.querySelector(selector);
    if (el && url && url !== '#') {
        el.href = url;
        el.style.display = '';
    } else if (el) {
        el.style.display = 'none';
    }
}

/**
 * Applies theme colors from profile config.
 * @param {object} profile - Profile data.
 */
export function applyTheme(profile) {
    if (profile && profile.colors) {
        if (profile.colors.accent) {
            document.documentElement.style.setProperty('--accent-color', profile.colors.accent);
        }
        if (profile.colors.accentBlue) {
            document.documentElement.style.setProperty('--accent-blue-color', profile.colors.accentBlue);
        }
    }
}

/**
 * Renders availability badge.
 * @param {object} availability - Availability settings.
 */
function renderAvailability(availability) {
    const badge = document.getElementById('availability-badge');
    const textEl = document.getElementById('availability-text');
    const dotEl = document.getElementById('availability-dot');
    const pingEl = document.getElementById('availability-ping');

    if (!badge || !availability) {
        if (badge && availability === null) badge.style.display = 'none';
        return;
    }

    // Visibility
    badge.style.display = availability.visible === false ? 'none' : 'inline-flex';

    // Status Text
    if (textEl && availability.status) {
        textEl.textContent = availability.status;
    }

    // Colors
    if (availability.color) {
        let color = availability.color;

        // Normalize color: if 8-digit hex (#RRGGBBAA), strip alpha to apply custom opacities
        if (color.startsWith('#') && color.length === 9) {
            color = color.substring(0, 7);
        }

        // Apply styles
        badge.style.borderColor = `${color}4d`; // ~30% opacity
        badge.style.color = color;
        badge.style.backgroundColor = `${color}1a`; // ~10% opacity

        // Dot and ping colors
        if (dotEl) dotEl.style.backgroundColor = color;
        if (pingEl) pingEl.style.backgroundColor = color;
    }
}
