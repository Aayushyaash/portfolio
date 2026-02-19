/**
 * UI Renderer Module
 * Handles DOM updates for profile, projects, and resume content.
 */

import { escapeHtml, renderTags, renderProjectLinks, sanitize, setText } from '../utils/htmlHelpers.js';

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

    setText('#nav-profile-firstname', firstName);
    setText('#nav-profile-lastname', lastName);
    setText('#nav-profile-subtitle', profile.subtitle);

    // Update Hero section
    const heroTitleNode = document.getElementById('hero-title');
    const heroTemplate = document.getElementById('hero-title-template');

    if (heroTitleNode && heroTemplate) {
        const highlightText = profile.hero.highlight || "Code & Design";
        const titleText = profile.hero.title || "Building the future with";

        const clone = heroTemplate.content.cloneNode(true);
        clone.querySelector('.hero-title-main').textContent = titleText;
        clone.querySelector('.hero-title-highlight').textContent = highlightText;

        heroTitleNode.innerHTML = '';
        heroTitleNode.appendChild(clone);
    }

    setText('#hero-bio', profile.bio);

    // Update Colors
    applyTheme(profile);

    // Update Stats
    setText('#stat-experience', profile.experience);


    // Update Image
    const heroImg = document.querySelector('#hero-profile-img');
    if (heroImg && profile.image) {
        heroImg.src = profile.image;
        heroImg.alt = profile.name;
    }

    // Update Footer
    setText('#footer-year', new Date().getFullYear());
    setText('#footer-profile-name', profile.name);
    const emailLink = document.querySelector('#contact-email-btn');
    if (emailLink && profile.social?.email) {
        emailLink.href = `mailto:${profile.social.email}`;
    }

    // Update Location Badge
    const locationBadge = document.getElementById('footer-location-badge');
    if (locationBadge && profile.location) {
        setText('#footer-location-text', profile.location.label);

        // Visibility
        if (profile.location.visible === false) {
            locationBadge.classList.add('hidden');
            locationBadge.classList.remove('inline-flex');
        } else {
            locationBadge.classList.remove('hidden');
            locationBadge.classList.add('inline-flex');
        }

        // Apply Styles
        applyBadgeStyles(locationBadge, profile.location.style, profile.location.color, 'location');
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
        updateLink('#nav-social-github', profile.social.github);
        setText('#nav-social-github-label', profile.social.githubLabel);

        updateLink('#nav-social-linkedin', profile.social.linkedin);
        setText('#nav-social-linkedin-label', profile.social.linkedinLabel);

        // Update Footer Social Links (Mobile)
        updateLink('#footer-social-github', profile.social.github);
        updateLink('#footer-social-linkedin', profile.social.linkedin);

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

    // Render featured projects
    if (featuredContainer) {
        featuredContainer.innerHTML = '';
        featured.forEach((project, index) => {
            const card = createProjectCard(project, index);
            if (card) featuredContainer.appendChild(card);
        });
    }

    // Render non-featured projects
    if (otherSection && otherContainer) {
        if (nonFeatured.length > 0) {
            otherSection.style.display = '';
            otherContainer.innerHTML = '';
            nonFeatured.forEach(p => {
                const card = createCompactProjectCard(p);
                if (card) otherContainer.appendChild(card);
            });
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
    const template = document.getElementById('project-card-template');
    if (!template) return null;

    const clone = template.content.cloneNode(true);
    const num = (index + 1).toString().padStart(2, '0');
    const isEven = index % 2 !== 0;

    // Layout Order
    if (isEven) {
        const imageCol = clone.querySelector('.project-image-col');
        const textCol = clone.querySelector('.project-text-col');
        if (imageCol) imageCol.classList.add('lg:order-2');
        if (textCol) textCol.classList.add('lg:order-1');
    }

    // Gradient Direction
    const gradient = clone.querySelector('.project-gradient');
    if (gradient) {
        gradient.classList.add(isEven ? 'from-accentBlue/10' : 'from-accent/10');
    }

    // Content
    clone.querySelector('.project-number').textContent = `${num}. PROJECT`;
    clone.querySelector('.project-title').textContent = project.title;
    clone.querySelector('.project-description').textContent = project.description;

    // HTML Helpers (safe)
    clone.querySelector('.project-tags').innerHTML = renderTags(project.tags, 'sm');
    clone.querySelector('.project-links').innerHTML = renderProjectLinks(project.githubLink, project.externalLink, 'text-2xl', 'fa');

    // Image
    const img = clone.querySelector('.project-image');
    const skeleton = clone.querySelector('.project-skeleton');

    if (project.image) {
        img.src = project.image;
        img.alt = project.title;
    } else {
        img.style.display = 'none';
        if (skeleton) skeleton.classList.remove('hidden');
    }

    return clone;
}

function createCompactProjectCard(project) {
    const template = document.getElementById('compact-project-card-template');
    if (!template) return null;

    const clone = template.content.cloneNode(true);

    clone.querySelector('.project-title').textContent = project.title;
    clone.querySelector('.project-description').textContent = project.description;
    clone.querySelector('.project-tags').innerHTML = renderTags(project.tags, 'xs');
    clone.querySelector('.project-links').innerHTML = renderProjectLinks(project.githubLink, project.externalLink, 'text-lg', 'fa');

    return clone;
}

// Helpers



/**
 * Updates the href attribute of an element.
 * @param {string} selector - CSS selector.
 * @param {string} url - URL to set.
 */
export function updateLink(selector, url) {
    const el = document.querySelector(selector);
    if (el && url && url !== '#') {
        el.href = url;
        el.style.display = '';

        // Fix: Open external links in new tab
        if (url.startsWith('http') || url.endsWith('.pdf')) {
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
        }
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
            document.documentElement.style.setProperty('--color-accent', profile.colors.accent);
        }
        if (profile.colors.accentBlue) {
            document.documentElement.style.setProperty('--color-accent-blue', profile.colors.accentBlue);
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

    // Apply Styles
    applyBadgeStyles(badge, availability.style, availability.color, 'availability');
}

/**
 * Helper to apply badge styles (background, border, text, dot)
 * @param {HTMLElement} badgeEl 
 * @param {object} styleConfig 
 * @param {string} baseColor 
 * @param {string} type - 'availability' or 'location' (used for ID selection)
 */
function applyBadgeStyles(badgeEl, styleConfig, baseColor, type) {
    if (!badgeEl) return;

    const dotEl = document.getElementById(`${type}-dot`);
    const pingEl = document.getElementById(`${type}-ping`);

    // 1. Expanded Style Object
    if (styleConfig) {
        if (styleConfig.background) badgeEl.style.backgroundColor = styleConfig.background;
        if (styleConfig.border) badgeEl.style.borderColor = styleConfig.border;
        if (styleConfig.text) badgeEl.style.color = styleConfig.text;

        if (styleConfig.dot) {
            if (dotEl) dotEl.style.backgroundColor = styleConfig.dot;
            if (pingEl) pingEl.style.backgroundColor = styleConfig.dot;
        }
        return;
    }

    // 2. Base Color (Backwards Compatibility / Simple Theme)
    if (baseColor) {
        let color = baseColor;
        if (color.startsWith('#') && color.length === 9) {
            color = color.substring(0, 7);
        }

        // Apply derived styles
        // Note: We use different opacities for availability vs location if we wanted strict separate defaults,
        // but for "color" prop, we assume the user wants the "tinted" look (Activity style).
        // If they want solid, they should use 'style' object or we can enforce solid for location here.

        // For consistency with previous logic, 'color' implies the transparent tint style.
        badgeEl.style.borderColor = `${color}4d`; // ~30%
        badgeEl.style.color = color;
        badgeEl.style.backgroundColor = `${color}1a`; // ~10%

        if (dotEl) dotEl.style.backgroundColor = color;
        if (pingEl) pingEl.style.backgroundColor = color;
    }
}
