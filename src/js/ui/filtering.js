/**
 * Filtering Module
 * Handles skill tag filtering for projects and experience.
 * State is encapsulated within the renderSkillsFilter closure.
 */

/**
 * Renders the interactive skills filter.
 * @param {Array} projects - List of project objects.
 * @param {Object} experience - Experience data object.
 * @param {Function} onFilterChange - Callback function when filter changes (receives filtered data).
 */
export function renderSkillsFilter(projects, experience, onFilterChange) {
    const container = document.getElementById('skill-filters-container');
    if (!container) return;

    // State is local to this invocation — no module-level variables
    const selectedTags = new Set();
    const allProjectsData = projects;
    const experienceRoles = experience?.roles || [];
    const allExperienceData = experienceRoles;

    // 1. Extract Tags
    const featuredProjects = projects.filter(p => p.featured === true);
    const projectTags = featuredProjects.flatMap(p => p.tags || []);

    let experienceTags = [];
    if (experience && experience.activate !== false && experience.activate !== "false") {
        experienceTags = experienceRoles.flatMap(r => r.tags || []);
    }

    const allTags = [...projectTags, ...experienceTags];

    // 2. Normalize
    const uniqueTagsMap = new Map();
    allTags.forEach(tag => {
        const lower = tag.toLowerCase();
        if (!uniqueTagsMap.has(lower)) {
            const titleCase = tag.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
            uniqueTagsMap.set(lower, titleCase);
        }
    });

    const uniqueTags = Array.from(uniqueTagsMap.values()).sort();

    // 3. Render Tags
    let html = `<div class="skill-tag active" data-tag="all">All Stack</div>`;
    html += uniqueTags.map(tag =>
        `<div class="skill-tag" data-tag="${tag}">${tag}</div>`
    ).join('');
    container.innerHTML = html;

    // 4. Listeners
    container.querySelectorAll('.skill-tag').forEach(tagEl => {
        tagEl.addEventListener('click', () => {
            const tag = tagEl.dataset.tag;
            if (tag === 'all') {
                selectedTags.clear();
            } else {
                if (selectedTags.has(tag)) {
                    selectedTags.delete(tag);
                } else {
                    selectedTags.add(tag);
                }
            }

            updateFilterVisuals();
            const filtered = filterContent();
            if (onFilterChange) onFilterChange(filtered.projects, filtered.experience);
        });
    });

    // --- Inner functions (closure-captured state) ---

    function updateFilterVisuals() {
        const allTag = container.querySelector('[data-tag="all"]');
        if (selectedTags.size === 0) {
            allTag.classList.add('active');
            container.querySelectorAll('.skill-tag:not([data-tag="all"])').forEach(el => el.classList.remove('active'));
        } else {
            allTag.classList.remove('active');
            container.querySelectorAll('.skill-tag:not([data-tag="all"])').forEach(el => {
                if (selectedTags.has(el.dataset.tag)) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
        }
    }

    function filterContent() {
        const featured = allProjectsData.filter(p => p.featured === true);
        let filteredProjects = featured;
        let filteredExperience = allExperienceData;

        if (selectedTags.size > 0) {
            const isMatch = (itemTags) => {
                if (!itemTags) return false;
                const itemTagsLower = itemTags.map(t => t.toLowerCase());
                for (const selected of selectedTags) {
                    if (itemTagsLower.includes(selected.toLowerCase())) return true;
                }
                return false;
            };

            filteredProjects = featured.filter(p => isMatch(p.tags));
            filteredExperience = allExperienceData.filter(r => isMatch(r.tags));
        }

        return { projects: filteredProjects, experience: filteredExperience };
    }
}
