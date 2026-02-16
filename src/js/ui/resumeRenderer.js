/**
 * Resume Renderer Module
 * Handles rendering of resume-specific sections (Projects list, Experience, Education, Terminal).
 */

import { escapeHtml, renderTags, renderProjectLinks } from '../utils/htmlHelpers.js';

/**
 * Renders the full resume page content.
 */
export function renderResumePage(resumeData) {
    if (!resumeData) return;

    renderTerminal(resumeData.terminal);

    // Toggle Sections visibility based on data
    const experienceSection = document.getElementById('experience-section');
    const projectsSection = document.getElementById('projects-section');
    const leftCol = document.getElementById('content-left-col');

    if (resumeData.experience && resumeData.experience.activate !== false && resumeData.experience.activate !== "false") {
        if (experienceSection) experienceSection.style.display = 'block';
        if (projectsSection) projectsSection.classList.add('pt-10');
        if (leftCol) leftCol.classList.add('space-y-10');
        renderResumeExperience(resumeData.experience.roles);
    } else {
        if (experienceSection) experienceSection.style.display = 'none';
        if (projectsSection) projectsSection.classList.remove('pt-10');
        if (leftCol) leftCol.classList.remove('space-y-10');
    }

    renderEducation(resumeData.education);
}

// Renderers for specific sections

/**
 * Renders the terminal section.
 * @param {object} t - Terminal data.
 */
function renderTerminal(t) {
    const container = document.getElementById('terminal-content');
    if (!container || !t || !t.commands || t.commands.length === 0) return;

    const safeHost = escapeHtml(t.host);
    const safeInput0 = escapeHtml(t.commands[0].input);
    const safeOutput0 = escapeHtml(t.commands[0].output);

    let html = `
    <div class="flex gap-3">
        <span class="text-accent">visitor@${safeHost}:~</span>
        <span class="text-white">${safeInput0}</span>
    </div>
    <div class="text-muted leading-relaxed">
        <p>${safeOutput0}</p>
    </div>
    `;

    for (let i = 1; i < t.commands.length; i++) {
        const cmd = t.commands[i];
        const safeInput = escapeHtml(cmd.input);
        const safeOutput = escapeHtml(cmd.output).replace(/\n/g, '<br/>');

        html += `
        <div class="flex gap-3 mt-4">
            <span class="text-accent">visitor@${safeHost}:~</span>
            <span class="text-white">${safeInput}</span>
        </div>
        <div class="text-muted">
            <p class="mb-2 italic border-l-2 border-accentBlue/30 pl-4 text-accentBlue">${safeOutput}</p>
        </div>
        `;
    }

    html += `
    <div class="flex gap-3 mt-4">
        <span class="text-accent">visitor@${safeHost}:~</span>
        <span class="text-white animate-pulse">_</span>
    </div>
    `;

    container.innerHTML = html;
}

/**
 * Renders the projects list for the resume.
 * @param {Array} projects - List of project objects.
 */
export function renderResumeProjects(projects) {
    const container = document.getElementById('resume-projects-container');
    if (!container) return;

    if (!projects || projects.length === 0) {
        container.innerHTML = '<div class="text-muted italic">No featured projects selected.</div>';
        return;
    }

    container.innerHTML = projects.map((project) => {
        const tagsHtml = renderTags(project.tags, 'xs');
        const linksHtml = renderProjectLinks(project.githubLink, project.externalLink, 'text-[18px]', 'material');

        const safeTitle = escapeHtml(project.title);
        const safeDescription = escapeHtml(project.description);

        return `
        <div class="bg-surface border border-border p-5 rounded-lg group hover:border-yellow-400/50 transition-all">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-white group-hover:text-accent transition-colors">${safeTitle}</h4>
                <div class="flex gap-3 items-center">
                    ${linksHtml}
                </div>
            </div>
            <p class="text-sm text-muted mb-4">${safeDescription}</p>
            <div class="flex flex-wrap gap-2">
                ${tagsHtml}
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Renders the experience section for the resume.
 * @param {Array} roles - List of experience roles.
 */
export function renderResumeExperience(roles) {
    const container = document.getElementById('relevant-experience-container');
    if (!container || !roles) return;

    if (roles.length === 0) {
        container.innerHTML = '<div class="text-muted italic">No matching experience found.</div>';
        return;
    }

    container.innerHTML = roles.map((role, index) => {
        const dotClass = index === 0
            ? 'absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-accentBlue ring-4 ring-accentBlue/20'
            : 'absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-border';

        const tagsHtml = renderTags(role.tags, 'xs');

        const safeTitle = escapeHtml(role.title);
        const safeCompany = escapeHtml(role.company);
        const safeDate = escapeHtml(role.date);
        const safeDescription = escapeHtml(role.description);

        return `
        <div class="relative pl-8 border-l border-border">
            <div class="${dotClass}"></div>
            <div class="mb-1 flex justify-between items-start">
                <div>
                    <h4 class="text-lg font-bold text-white">${safeTitle}</h4>
                    <p class="text-sm text-accentBlue font-medium">${safeCompany}</p>
                </div>
                <span class="text-xs font-mono text-muted px-2 py-1 bg-surfaceHighlight rounded">${safeDate}</span>
            </div>
            <p class="text-sm text-muted mt-3 mb-4">${safeDescription}</p>
            <div class="flex gap-2">
                ${tagsHtml}
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Renders the education section.
 * NOTE: Education currently supports a single degree object.
 * To support multiple degrees, convert resume.md education to an array
 * and iterate here, rendering each degree block with its own courses/achievements.
 * @param {object} edu - Education data.
 */
function renderEducation(edu) {
    const container = document.getElementById('education-container');
    if (!container || !edu) return;

    const safeDegree = escapeHtml(edu.degree);
    const safeSchool = escapeHtml(edu.school);
    const safeDate = escapeHtml(edu.date);

    const coursesHtml = (edu.courses || []).map(course => `
        <div class="course-module group cursor-pointer" tabindex="0" role="button" aria-expanded="false">
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-white group-hover:text-accent">${escapeHtml(course.code)}${escapeHtml(course.title)}</span>
                <span class="material-symbols-outlined text-xs text-muted course-expand-icon">expand_more</span>
            </div>
            <ul class="mt-2 space-y-1 text-xs text-muted list-disc pl-4 hidden course-details">
                ${(course.details || []).map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}
            </ul>
        </div>
    `).join('');

    const achievementsHtml = (edu.achievements || []).map(ach => `
        <div class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                <span class="material-symbols-outlined text-accent text-sm">${escapeHtml(ach.icon)}</span>
            </div>
            <span class="text-xs text-gray-300">${escapeHtml(ach.text)}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="mb-6">
            <h4 class="text-lg font-bold text-white">${safeDegree}</h4>
            <p class="text-sm text-muted">${safeSchool} • ${safeDate}</p>
        </div>
        <div class="space-y-6">
            <p class="text-xs font-mono text-accent uppercase tracking-widest font-bold">Relevant Coursework</p>
            ${coursesHtml}
        </div>
        <div class="mt-8 pt-6 border-t border-border">
            <p class="text-xs font-mono text-muted mb-4 uppercase">Achievements</p>
            ${achievementsHtml}
        </div>
    `;

    setupCourseInteraction(container);
}

/**
 * Enables click/keyboard toggling for course module details.
 * Replaces hover-only expand with accessible click-to-expand.
 * @param {HTMLElement} container - The education container element.
 */
function setupCourseInteraction(container) {
    container.addEventListener('click', (e) => {
        const module = e.target.closest('.course-module');
        if (!module) return;
        toggleCourseModule(module);
    });

    container.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const module = e.target.closest('.course-module');
        if (!module) return;
        e.preventDefault();
        toggleCourseModule(module);
    });
}

/**
 * Toggles a single course module's expanded/collapsed state.
 * @param {HTMLElement} module - The course module element.
 */
function toggleCourseModule(module) {
    const details = module.querySelector('.course-details');
    const icon = module.querySelector('.course-expand-icon');
    if (!details) return;

    const isExpanded = module.getAttribute('aria-expanded') === 'true';
    module.setAttribute('aria-expanded', String(!isExpanded));
    details.classList.toggle('hidden');
    if (icon) icon.textContent = isExpanded ? 'expand_more' : 'expand_less';
}
