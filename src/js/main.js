/**
 * Main application entry point
 */
import { renderResumeProjects, renderResumeExperience, setupCourseInteraction } from './ui/resumeRenderer.js';
import { renderSkillsFilter } from './ui/filtering.js';
import { setupNavigation } from './ui/navigation.js';
import { setupMilestoneInteraction } from './ui/timelineRenderer.js';
import { showError } from './utils/errorHandler.js';

document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize application
 */
async function initApp() {
    try {
        // 1. Setup Interactive Handlers (DOM already rendered by SSG)
        if (document.getElementById('timeline')) {
            setupMilestoneInteraction();
        }

        const eduContainer = document.getElementById('education-container');
        if (eduContainer) {
            setupCourseInteraction(eduContainer);
        }

        // 2. Setup Resume/Filter specific views
        if (document.getElementById('skill-filters-container')) {
            try {
                // Fetch filter data statically
                const response = await fetch('./data/data.json');
                if (!response.ok) {
                    throw new Error(`Failed to load portfolio filter data (HTTP ${response.status}).`);
                }
                const data = await response.json();

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

            } catch (filterError) {
                console.error('Error loading filter data:', filterError);
                showError('Failed to load filter options. Some interactive features may be unavailable.');
            }
        }

        // 3. Global Updates - Links are now natively embedded by build.js during SSG phase

        // 4. Init Navigation interactions
        setupNavigation();

    } catch (error) {
        console.error('Error initializing portfolio app:', error);
        showError(error.message || 'An unexpected error occurred while loading the portfolio.');
    }
}
