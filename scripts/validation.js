/**
 * Content Validation Module
 * Validates frontmatter data against schema definitions.
 */

const schemas = {
    profile: {
        required: ['name', 'title', 'bio'],
        optional: ['subtitle', 'tagline', 'social', 'image', 'colors', 'hero', 'skills', 'availability', 'location', 'experience']
    },
    project: {
        required: ['title', 'description'],
        optional: ['tags', 'githubLink', 'externalLink', 'image', 'featured', 'order']
    },
    resume: {
        required: [],
        optional: ['experience', 'education', 'terminal', 'activate']
    },
    timeline: {
        required: [],
        optional: ['milestones', 'activate']
    }
};

/**
 * Validates data against a schema.
 * @param {object} data - Parsed frontmatter data.
 * @param {string} schemaName - Name of the schema to use.
 * @param {string} filePath - Path to the source file (for error reporting).
 * @returns {string[]} Array of validation error messages.
 */
function validate(data, schemaName, filePath) {
    const errors = [];
    const schema = schemas[schemaName];

    if (!schema) {
        errors.push(`Unknown schema: ${schemaName}`);
        return errors;
    }

    if (!data) {
        errors.push(`Empty or null data`);
        return errors;
    }

    for (const field of schema.required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            errors.push(`Missing required field: ${field}`);
        }
    }

    if (errors.length > 0) {
        console.warn(`[VALIDATION] ${filePath || schemaName}:`);
        errors.forEach(err => console.warn(`  - ${err}`));
    }

    return errors;
}

/**
 * Validates a project specifically.
 * @param {object} project - Project data.
 * @param {string} filePath - Path to source file.
 * @returns {boolean} True if valid.
 */
function validateProject(project, filePath) {
    const errors = validate(project, 'project', filePath);
    
    if (project.tags && !Array.isArray(project.tags)) {
        console.warn(`[VALIDATION] ${filePath}: tags should be an array`);
        return false;
    }

    return errors.length === 0;
}

/**
 * Validates profile data.
 * @param {object} profile - Profile data.
 * @param {string} filePath - Path to source file.
 * @returns {boolean} True if valid.
 */
function validateProfile(profile, filePath) {
    const errors = validate(profile, 'profile', filePath);
    return errors.length === 0;
}

module.exports = {
    validate,
    validateProject,
    validateProfile,
    schemas
};
