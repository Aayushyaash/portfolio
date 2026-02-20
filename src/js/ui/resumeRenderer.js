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

    container.innerHTML = ''; // Clear loading state
    const template = document.getElementById('terminal-command-template');
    if (!template) return;

    t.commands.forEach((cmd, index) => {
        const clone = template.content.cloneNode(true);
        const hostEl = clone.querySelector('.terminal-prompt');
        const inputEl = clone.querySelector('.terminal-input');
        const outputEl = clone.querySelector('.terminal-output');
        const outputContainer = clone.querySelector('.terminal-output-container');
        const row = clone.querySelector('.command-row');

        if (hostEl) hostEl.textContent = `visitor@${t.host || 'guest'}:~`;
        if (inputEl) inputEl.textContent = cmd.input;

        // Output Handling (Sanitized HTML)
        if (outputEl) {
            outputEl.innerHTML = sanitize(cmd.output).replace(/\n/g, '<br/>');

            // Special styling for the first generic welcome message (index 0)
            if (index === 0) {
                // Reset the "code block" style to be more like a text paragraph
                outputEl.className = 'terminal-output text-muted leading-relaxed';
                // Remove the left border container styling if present
                if (outputEl.classList.contains('border-l-2')) {
                    outputEl.classList.remove('italic', 'border-l-2', 'border-accentBlue/30', 'pl-4', 'text-accentBlue');
                }
            }
        }

        if (index === 0 && row) {
            row.classList.remove('mt-4'); // Remove margin for the very first item
        }

        container.appendChild(clone);
    });

    // Add Active Cursor Line
    const cursorTemplate = document.getElementById('terminal-cursor-template');
    if (cursorTemplate) {
        const cursorClone = cursorTemplate.content.cloneNode(true);
        const cursorPrompt = cursorClone.querySelector('.terminal-prompt');
        if (cursorPrompt) cursorPrompt.textContent = `visitor@${t.host || 'guest'}:~`;
        container.appendChild(cursorClone);
    }
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
export function setupCourseInteraction(container) {
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
