const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

const SRC_DIR = path.join(__dirname, '../src');
const ASSETS_DIR = path.join(__dirname, '../assets');
const DIST_DIR = path.join(__dirname, '../dist');

/**
 * Parses a markdown file with YAML frontmatter.
 * @param {string} filePath - Path to the markdown file.
 * @returns {object} - The parsed frontmatter and content.
 */
function parseMarkdown(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const match = fileContent.match(/^---\s*[\r\n]+([\s\S]+?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);

    if (match) {
        try {
            const frontmatter = yaml.load(match[1]);
            // Note: 'content' is the Markdown body below the frontmatter.
            // Currently unused by renderers but preserved for future use (e.g., project detail pages/modals).
            const content = match[2].trim();
            return { ...frontmatter, content };
        } catch (e) {
            console.error(`Error parsing YAML in ${filePath}:`, e);
            return null;
        }
    }
    return { content: fileContent.trim() };
}

/**
 * Main build function.
 */
async function build() {
    console.log('Starting build...');

    // 1. Clean dist
    await fs.remove(DIST_DIR);
    await fs.ensureDir(DIST_DIR);
    console.log('Cleaned dist directory.');

    // 2. Copy static HTML files
    await fs.copy(path.join(SRC_DIR, 'index.html'), path.join(DIST_DIR, 'index.html'));
    await fs.copy(path.join(SRC_DIR, 'resume.html'), path.join(DIST_DIR, 'resume.html'));
    console.log('Copied HTML files.');

    // 2b. Inject shared nav partial
    const navPartialPath = path.join(SRC_DIR, 'partials', 'nav.html');
    if (await fs.pathExists(navPartialPath)) {
        const navTemplate = await fs.readFile(navPartialPath, 'utf8');
        const NAV_PLACEHOLDER = '<!-- NAV_PARTIAL -->';

        const ACTIVE_CLASSES = 'bg-surfaceHighlight/50 text-white border-l-4 border-accent';
        const INACTIVE_CLASSES = 'text-muted hover:bg-surfaceHighlight hover:text-white transition-all group';
        const ACTIVE_ICON = 'text-accent';
        const INACTIVE_ICON = 'group-hover:text-accentBlue transition-colors';

        const pageConfigs = {
            'index.html': {
                LOGO_HREF: '#',
                LINK_PREFIX: '',
                OVERVIEW_ACTIVE: ACTIVE_CLASSES,
                OVERVIEW_ICON_CLASS: ACTIVE_ICON,
                RESUME_ACTIVE: INACTIVE_CLASSES,
                RESUME_ICON_CLASS: INACTIVE_ICON,
                RESUME_HREF: 'resume.html',
            },
            'resume.html': {
                LOGO_HREF: 'index.html',
                LINK_PREFIX: 'index.html',
                OVERVIEW_ACTIVE: INACTIVE_CLASSES,
                OVERVIEW_ICON_CLASS: INACTIVE_ICON,
                RESUME_ACTIVE: ACTIVE_CLASSES,
                RESUME_ICON_CLASS: ACTIVE_ICON,
                RESUME_HREF: '#',
            },
        };

        for (const [page, config] of Object.entries(pageConfigs)) {
            const htmlPath = path.join(DIST_DIR, page);
            let html = await fs.readFile(htmlPath, 'utf8');
            if (html.includes(NAV_PLACEHOLDER)) {
                let nav = navTemplate;
                for (const [key, value] of Object.entries(config)) {
                    nav = nav.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
                }
                html = html.replace(NAV_PLACEHOLDER, nav);
                await fs.writeFile(htmlPath, html);
            }
        }
        console.log('Injected nav partial into HTML files.');
    }

    // 3. Copy CSS (exclude tailwind-input.css — only needed at build time) and JS
    await fs.ensureDir(path.join(DIST_DIR, 'css'));
    await fs.copy(path.join(SRC_DIR, 'css', 'style.css'), path.join(DIST_DIR, 'css', 'style.css'));
    await fs.copy(path.join(SRC_DIR, 'js'), path.join(DIST_DIR, 'js'));
    console.log('Copied CSS and JS.');

    // 4. Copy Images
    const imagesDir = path.join(DIST_DIR, 'images');
    await fs.ensureDir(imagesDir);
    const assetFiles = glob.sync('**/*.{jpg,jpeg,png,gif,svg}', { cwd: ASSETS_DIR });
    for (const file of assetFiles) {
        const srcPath = path.join(ASSETS_DIR, file);
        // Strip 'images/' prefix to avoid dist/images/images/ nesting
        const destFile = file.startsWith('images/') || file.startsWith('images\\') ? file.substring('images/'.length) : file;
        const destPath = path.join(imagesDir, destFile);
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath);
    }
    console.log(`Copied ${assetFiles.length} asset images.`);

    // 4b. Copy files (PDFs, documents)
    const filesSourceDir = path.join(ASSETS_DIR, 'files');
    if (await fs.pathExists(filesSourceDir)) {
        const filesDir = path.join(DIST_DIR, 'files');
        await fs.ensureDir(filesDir);
        const docFiles = glob.sync('**/*.{pdf,doc,docx}', { cwd: filesSourceDir });
        for (const file of docFiles) {
            await fs.copy(path.join(filesSourceDir, file), path.join(filesDir, file));
        }
        console.log(`Copied ${docFiles.length} document files.`);
    }

    // 5. Generate Data JSON
    const data = {
        profile: {},
        projects: [],
        resume: {},
        timeline: {}
    };

    // Parse Profile
    const profilePath = path.join(ASSETS_DIR, 'profile.md');
    if (await fs.pathExists(profilePath)) {
        data.profile = parseMarkdown(profilePath);
    }

    // Parse Resume
    const resumePath = path.join(ASSETS_DIR, 'resume.md');
    if (await fs.pathExists(resumePath)) {
        data.resume = parseMarkdown(resumePath);
    }

    // Parse Timeline
    const timelinePath = path.join(ASSETS_DIR, 'timeline.md');
    if (await fs.pathExists(timelinePath)) {
        data.timeline = parseMarkdown(timelinePath);
    }

    // Parse Projects
    console.log(`Searching for projects in: ${path.join(ASSETS_DIR, 'projects')}`);
    const projectsDir = path.join(ASSETS_DIR, 'projects');
    if (await fs.pathExists(projectsDir)) {
        const projectFiles = await fs.readdir(projectsDir);
        console.log(`Found ${projectFiles.length} files in projects dir.`);
        for (const file of projectFiles) {
            if (file.endsWith('.md')) {
                const projectData = parseMarkdown(path.join(projectsDir, file));
                if (projectData) {
                    data.projects.push(projectData);
                }
            }
        }
    } else {
        console.warn('Projects directory not found.');
    }

    // Sort projects
    data.projects.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 9999;
        const orderB = b.order !== undefined ? b.order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.title || '').localeCompare(b.title || '');
    });

    // Write Data JSON
    const dataDir = path.join(DIST_DIR, 'data');
    await fs.ensureDir(dataDir);
    await fs.writeJson(path.join(dataDir, 'data.json'), data, { spaces: 2 });
    console.log('Generated data.json.');

    // 6. Generate .nojekyll for GitHub Pages
    await fs.writeFile(path.join(DIST_DIR, '.nojekyll'), '');
    console.log('Generated .nojekyll.');

    // 7. Generate robots.txt
    await fs.writeFile(path.join(DIST_DIR, 'robots.txt'),
        'User-agent: *\nAllow: /\nSitemap: https://aayushyaash.github.io/portfolio/sitemap.xml\n');
    console.log('Generated robots.txt.');

    // 8. Generate sitemap.xml
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://aayushyaash.github.io/portfolio/</loc></url>
  <url><loc>https://aayushyaash.github.io/portfolio/resume.html</loc></url>
</urlset>`;
    await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
    console.log('Generated sitemap.xml.');

    console.log('Build complete - CSR-ready.');
}

build().catch(console.error);
