/**
 * Resume Renderer Module
 * Handles rendering of resume-specific sections (Projects list, Experience, Education, Terminal).
 */

import { escapeHtml, renderTags, renderProjectLinks, sanitize } from '../utils/htmlHelpers.js';

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
    const safeOutput0 = sanitize(t.commands[0].output);

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
        const safeOutput = sanitize(cmd.output).replace(/\n/g, '<br/>');

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
    container.innerHTML = '';

    if (!projects || projects.length === 0) {
        container.innerHTML = '<div class="text-muted italic">No featured projects selected.</div>';
        return;
    }

    const template = document.getElementById('resume-project-template');
    if (!template) return;

    projects.forEach((project) => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.project-title').textContent = project.title;
        clone.querySelector('.project-description').textContent = project.description;
        clone.querySelector('.project-tags').innerHTML = renderTags(project.tags, 'xs');
        clone.querySelector('.project-links').innerHTML = renderProjectLinks(project.githubLink, project.externalLink, 'text-[18px]', 'material');

        container.appendChild(clone);
    });
}

/**
 * Renders the experience section for the resume.
 * @param {Array} roles - List of experience roles.
 */
export function renderResumeExperience(roles) {
    const container = document.getElementById('relevant-experience-container');
    if (!container || !roles) return;
    container.innerHTML = '';

    if (roles.length === 0) {
        container.innerHTML = '<div class="text-muted italic">No matching experience found.</div>';
        return;
    }

    const template = document.getElementById('experience-item-template');
    roles.forEach((role, index) => {
        const clone = template.content.cloneNode(true);

        const dot = clone.querySelector('.experience-dot');
        if (index === 0) {
            dot.className = 'experience-dot absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-accentBlue ring-4 ring-accentBlue/20';
        } else {
            dot.className = 'experience-dot absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-border';
        }

        clone.querySelector('.experience-title').textContent = role.title;
        clone.querySelector('.experience-company').textContent = role.company;
        clone.querySelector('.experience-date').textContent = role.date;
        clone.querySelector('.experience-description').textContent = role.description;
        clone.querySelector('.experience-tags').innerHTML = renderTags(role.tags, 'xs');

        container.appendChild(clone);
    });
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
    container.innerHTML = '';

    const template = document.getElementById('education-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('.edu-degree').textContent = edu.degree;
    clone.querySelector('.edu-school-date').textContent = `${edu.school} • ${edu.date}`;

    // Courses
    const coursesContainer = clone.querySelector('.edu-courses-container');
    const courseTemplate = document.getElementById('course-item-template');
    (edu.courses || []).forEach(course => {
        const courseClone = courseTemplate.content.cloneNode(true);
        courseClone.querySelector('.course-title').textContent = `${course.code}${course.title}`;

        const detailsList = courseClone.querySelector('.course-details');
        (course.details || []).forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            detailsList.appendChild(li);
        });

        coursesContainer.appendChild(courseClone);
    });

    // Achievements
    const achContainer = clone.querySelector('.edu-achievements-container');
    const achTemplate = document.getElementById('achievement-item-template');
    (edu.achievements || []).forEach(ach => {
        const achClone = achTemplate.content.cloneNode(true);
        achClone.querySelector('.achievement-icon').textContent = ach.icon;
        achClone.querySelector('.achievement-text').textContent = ach.text;
        achContainer.appendChild(achClone);
    });

    container.appendChild(clone);

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
