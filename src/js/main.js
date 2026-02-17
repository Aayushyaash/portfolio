/**
 * Main application entry point
 */
import { renderProfile, renderProjects, applyTheme, updateLink } from './ui/renderer.js';
import { renderResumePage, renderResumeProjects, renderResumeExperience } from './ui/resumeRenderer.js';
import { renderSkillsFilter } from './ui/filtering.js';
import { setupNavigation } from './ui/navigation.js';
import { renderTimeline, setupMilestoneInteraction } from './ui/timelineRenderer.js';
import { showError } from './utils/errorHandler.js';

document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize application
 */
async function initApp() {
    try {
        const response = await fetch('./data/data.json');

        if (!response.ok) {
            throw new Error(`Failed to load portfolio data (HTTP ${response.status}). Please try again later.`);
        }

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            throw new Error('Portfolio data is corrupted. Please contact the site administrator.');
        }

        // Validate critical data
        if (!data.profile || !data.projects) {
            throw new Error('Portfolio data is incomplete. Missing required sections.');
        }

        // 1. Render Core Views
        // Always render to ensure data.json drives the content (CSR)
        renderProfile(data.profile);
        renderProjects(data.projects);

        // Set page title from profile name
        if (data.profile?.name) {
            const isResumePage = document.getElementById('terminal-content');
            document.title = isResumePage
                ? `${data.profile.name} | Resume`
                : `${data.profile.name} | Portfolio`;
        }

        // Render Timeline (if data exists)
        if (data.timeline) {
            renderTimeline(data.timeline);
            setupMilestoneInteraction();
        }

        // Ensure theme is applied
        applyTheme(data.profile);

        // 2. Render Resume/Filter specific views
        if (document.getElementById('skill-filters-container')) {
            renderResumePage(data.resume);

            // Initialize Filter with automatic updates to Resume sections
            renderSkillsFilter(
                data.projects,
                data.resume?.experience,
                (filteredProjects, filteredExperience) => {
                    // Update UI when filter changes
                    renderResumeProjects(filteredProjects);
                    renderResumeExperience(filteredExperience);
                }
            );

            // Initial render of filtered projects (featured only)
            const featuredProjects = data.projects.filter(p => p.featured === true);
            renderResumeProjects(featuredProjects);
        }

        // 3. Global Updates - Resume download link (single source: resume.md)
        // 3. Global Updates - Resume download link (single source: resume.md)
        if (data.resume?.resumeFile && data.resume.resumeFile !== '#') {
            updateLink('#nav-social-resume', data.resume.resumeFile);
            updateLink('#resume-download-btn', data.resume.resumeFile);
        } else {
            updateLink('#nav-social-resume', ''); // Hides if url is empty
            updateLink('#resume-download-btn', '');
        }

        // 4. Init Navigation interactions
        setupNavigation();

    } catch (error) {
        console.error('Error loading portfolio data:', error);
        showError(error.message || 'An unexpected error occurred while loading the portfolio.');
    }
}
