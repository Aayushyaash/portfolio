const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const { JSDOM, VirtualConsole } = require('jsdom');
const createDOMPurify = require('dompurify');

const SRC_DIR = path.join(__dirname, '../src');
const ASSETS_DIR = path.join(__dirname, '../assets');
const DIST_DIR = path.join(__dirname, '../dist');

// Site Configuration
const SITE_URL = process.env.SITE_URL || 'https://aayushyaash.github.io/portfolio/';

/**
 * Parses a markdown file with YAML frontmatter.
 */
function parseMarkdown(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    try {
        const { data, content } = matter(fileContent);
        return { ...data, content: content.trim() };
    } catch (e) {
        console.error(`Error parsing frontmatter in ${filePath}:`, e);
        return null;
    }
}

/**
 * Validates required fields in content data.
 * @param {object} data - Parsed frontmatter data.
 * @param {string} filePath - Path to the source file.
 * @param {string[]} required - Array of required field names.
 */
function validateContent(data, filePath, required = ['title', 'description']) {
    if (!data) return;
    const missing = required.filter(f => !data[f]);
    if (missing.length > 0) {
        console.warn(`[WARN] ${filePath} missing required fields: ${missing.join(', ')}`);
    }
}


/**
 * Loads a JS file and strips ES Module syntax for execution in Node/JSDOM.
 */
async function loadRendererScript(filePath) {
    if (!await fs.pathExists(filePath)) return '';
    let content = await fs.readFile(filePath, 'utf8');
    // Remove imports
    content = content.replace(/^\s*import\s[\s\S]*?from\s+['"].*?['"]\s*;?\s*$/gm, '');

    // Convert "export function name(..." to "window.name = function name(..."
    content = content.replace(/export function (\w+)/g, 'window.$1 = function $1');

    // Convert "export const name =" to "window.name ="
    content = content.replace(/export const (\w+)/g, 'window.$1');

    return content;
}

/**
 * Main build function.
 */
async function build() {
    console.log('Starting build...');

    // 1. Prepare Data & Config
    console.log('Step 1: Preparing Data & Config...');
    const data = { profile: {}, projects: [], resume: {}, timeline: {} };

    const profilePath = path.join(ASSETS_DIR, 'profile.md');
    if (await fs.pathExists(profilePath)) data.profile = parseMarkdown(profilePath);

    const resumePath = path.join(ASSETS_DIR, 'resume.md');
    if (await fs.pathExists(resumePath)) data.resume = parseMarkdown(resumePath);

    const timelinePath = path.join(ASSETS_DIR, 'timeline.md');
    if (await fs.pathExists(timelinePath)) data.timeline = parseMarkdown(timelinePath);

    const projectsDir = path.join(ASSETS_DIR, 'projects');
    if (await fs.pathExists(projectsDir)) {
        const projectFiles = await fs.readdir(projectsDir);
        for (const file of projectFiles) {
            if (file.endsWith('.md')) {
                const projectData = parseMarkdown(path.join(projectsDir, file));
                if (projectData) {
                validateContent(projectData, file);
                data.projects.push(projectData);
            }
            }
        }
    }
    data.projects.sort((a, b) => (a.order || 9999) - (b.order || 9999));

    // Load Theme
    const themePath = path.join(ASSETS_DIR, 'theme.json');
    let theme = {};
    if (await fs.pathExists(themePath)) theme = await fs.readJson(themePath);

    // Theme Constants for partial injection
    const navConfig = theme.nav || {};
    const NAV_THEME = {
        activeClasses: (navConfig.activeClasses || []).join(' '),
        inactiveClasses: (navConfig.inactiveClasses || []).join(' '),
        activeIcon: (navConfig.activeIcon || []).join(' '),
        inactiveIcon: (navConfig.inactiveIcon || []).join(' ')
    };

    // 2. Clean Dist
    console.log('Step 2: Cleaning dist...');
    await fs.remove(DIST_DIR);
    await fs.ensureDir(DIST_DIR);

    // 3. Process HTML (Inject & SSG)
    console.log('Step 3: Processing HTML & SSG...');

    // Load Scripts Content for SSG
    const scriptFiles = [
        'utils/htmlHelpers.js',
        'ui/renderer.js',
        'ui/resumeRenderer.js',
        'ui/timelineRenderer.js'
    ];
    let appScripts = '';
    for (const file of scriptFiles) {
        appScripts += await loadRendererScript(path.join(SRC_DIR, 'js', file)) + '\n';
    }

    const navPartialPath = path.join(SRC_DIR, 'partials', 'nav.html');
    let navTemplate = await fs.pathExists(navPartialPath) ? await fs.readFile(navPartialPath, 'utf8') : '';
    const footerPartialPath = path.join(SRC_DIR, 'partials', 'footer.html');
    let footerTemplate = await fs.pathExists(footerPartialPath) ? await fs.readFile(footerPartialPath, 'utf8') : '';

    const pageConfigs = {
        'index.html': {
            config: {
                LOGO_HREF: '#', LINK_PREFIX: '',
                OVERVIEW_ACTIVE: NAV_THEME.activeClasses, OVERVIEW_ICON_CLASS: NAV_THEME.activeIcon,
                RESUME_ACTIVE: NAV_THEME.inactiveClasses, RESUME_ICON_CLASS: NAV_THEME.inactiveIcon, RESUME_HREF: 'resume.html',
                TIMELINE_ACTIVE: NAV_THEME.inactiveClasses, TIMELINE_ICON_CLASS: NAV_THEME.inactiveIcon, TIMELINE_HREF: '#timeline'
            },
            render: (domWindow) => {
                if (domWindow.renderProfile) domWindow.renderProfile(data.profile);
                if (domWindow.renderProjects) domWindow.renderProjects(data.projects);
                if (domWindow.renderTimeline && data.timeline) domWindow.renderTimeline(data.timeline);
                if (domWindow.applyTheme) domWindow.applyTheme(data.profile);

                // Setup Resume Links
                if (data.resume && data.resume.resumeFile && data.resume.resumeFile !== '#') {
                    if (domWindow.updateLink) {
                        domWindow.updateLink('#nav-social-resume', data.resume.resumeFile);
                        domWindow.updateLink('#resume-download-btn', data.resume.resumeFile);
                    }
                } else {
                    if (domWindow.updateLink) {
                        domWindow.updateLink('#nav-social-resume', '');
                        domWindow.updateLink('#resume-download-btn', '');
                    }
                }

                // Set Title
                if (data.profile.name) domWindow.document.title = `${data.profile.name} | Portfolio`;
            }
        },
        'resume.html': {
            config: {
                LOGO_HREF: 'index.html', LINK_PREFIX: 'index.html',
                OVERVIEW_ACTIVE: NAV_THEME.inactiveClasses, OVERVIEW_ICON_CLASS: NAV_THEME.inactiveIcon,
                RESUME_ACTIVE: NAV_THEME.activeClasses, RESUME_ICON_CLASS: NAV_THEME.activeIcon, RESUME_HREF: '#',
                TIMELINE_ACTIVE: NAV_THEME.inactiveClasses, TIMELINE_ICON_CLASS: NAV_THEME.inactiveIcon, TIMELINE_HREF: 'index.html#timeline'
            },
            render: (domWindow) => {
                if (domWindow.renderProfile) domWindow.renderProfile(data.profile);
                if (domWindow.renderResumePage) domWindow.renderResumePage(data.resume);
                if (domWindow.applyTheme) domWindow.applyTheme(data.profile);
                // Fix: Call renderTimeline even if section is missing, to unhide the nav link
                if (domWindow.renderTimeline && data.timeline) domWindow.renderTimeline(data.timeline);
                if (domWindow.renderResumeProjects) {
                    const featured = data.projects.filter(p => p.featured === true);
                    domWindow.renderResumeProjects(featured);
                }

                // Setup Resume Links
                if (data.resume && data.resume.resumeFile && data.resume.resumeFile !== '#') {
                    if (domWindow.updateLink) {
                        domWindow.updateLink('#nav-social-resume', data.resume.resumeFile);
                        domWindow.updateLink('#resume-download-btn', data.resume.resumeFile);
                    }
                } else {
                    if (domWindow.updateLink) {
                        domWindow.updateLink('#nav-social-resume', '');
                        domWindow.updateLink('#resume-download-btn', '');
                    }
                }

                if (data.profile.name) domWindow.document.title = `${data.profile.name} | Resume`;
            }
        },
    };

    for (const [page, options] of Object.entries(pageConfigs)) {
        const srcPath = path.join(SRC_DIR, page);
        if (!await fs.pathExists(srcPath)) continue;

        let html = await fs.readFile(srcPath, 'utf8');

        // Partials Injection
        if (html.includes('<!-- NAV_PARTIAL -->') && navTemplate) {
            let nav = navTemplate;
            for (const [key, value] of Object.entries(options.config)) {
                nav = nav.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
            }
            html = html.replace('<!-- NAV_PARTIAL -->', nav);
        }
        if (html.includes('<!-- FOOTER_PARTIAL -->') && footerTemplate) {
            html = html.replace('<!-- FOOTER_PARTIAL -->', footerTemplate);
        }

        // --- SSG Pre-rendering with JSDOM ---
        const virtualConsole = new VirtualConsole();
        virtualConsole.on("jsdomError", (e) => {
            // Only suppress CSS parsing errors (benign in JSDOM)
            if (e.message && e.message.includes("Could not parse CSS")) return;
            console.warn(`[JSDOM Warning] ${e.message || e}`);
        });

        // ENABLE SCRIPT EXECUTION
        const dom = new JSDOM(html, {
            virtualConsole,
            runScripts: "dangerously",
            resources: "usable"
        });
        const win = dom.window;
        const doc = win.document;

        // Setup environment
        global.window = win;
        global.document = doc;
        global.DOMPurify = createDOMPurify(win);

        try {
            console.log(`[SSG] Injecting scripts for ${page}...`);
            // JSDOM Script Injection to handle scope correctly
            win.console = console; // Shim console

            const scriptEl = doc.createElement('script');
            scriptEl.id = 'ssg-injection-script';
            scriptEl.textContent = appScripts;
            doc.body.appendChild(scriptEl);

            // Trigger specific page render logic
            options.render(win);
            console.log(`[SSG] Rendered ${page}.`);

            // Cleanup injected script to keep HTML clean
            const injectedEl = doc.getElementById('ssg-injection-script');
            if (injectedEl) injectedEl.remove();

        } catch (err) {
            console.error(`Error during SSG for ${page}:`, err);
        }

        // Serialize back to HTML
        html = dom.serialize();

        // Cleanup Globals
        global.window = undefined;
        global.document = undefined;
        global.DOMPurify = undefined;
        // ------------------------------------

        // Inject Theme (Post-rendering, so it exists for client-side hydration)
        const themeScript = `<script>window.PORTFOLIO_THEME = ${JSON.stringify(theme)};</script>`;
        html = html.replace('</head>', `${themeScript}\n</head>`);

        // Inject CSS Variables from theme.json (Priority over style.css defaults)
        if (theme.colors) {
            let cssVars = ':root {';
            for (const [key, val] of Object.entries(theme.colors)) {
                // Determine variable name (map keys like "bg" to "--color-bg")
                const varName = key.startsWith('--') ? key : `--color-${key}`;
                cssVars += `${varName}: ${val};`;
            }
            cssVars += '}';
            const styleTag = `<style id="theme-vars">${cssVars}</style>`;
            html = html.replace('</head>', `${styleTag}\n</head>`);
        }

        // Replace hardcoded URLs with SITE_URL
        html = html.replace(/https:\/\/aayushyaash\.github\.io\/portfolio\//g, SITE_URL);

        await fs.writeFile(path.join(DIST_DIR, page), html);
        console.log(`Generated ${page} (SSG Complete)`);
    }

    // 4. Copy Assets
    console.log('Step 4: Copying assets...');
    await fs.ensureDir(path.join(DIST_DIR, 'css'));
    await fs.copy(path.join(SRC_DIR, 'css', 'style.css'), path.join(DIST_DIR, 'css', 'style.css'));

    // JS
    const jsFiles = glob.sync('**/*.js', { cwd: path.join(SRC_DIR, 'js') });
    await fs.ensureDir(path.join(DIST_DIR, 'js'));
    for (const file of jsFiles) {
        await fs.copy(path.join(SRC_DIR, 'js', file), path.join(DIST_DIR, 'js', file));
    }

    // Vendor JS
    const vendorDir = path.join(DIST_DIR, 'js', 'vendor');
    await fs.ensureDir(vendorDir);
    const purifyPath = path.join(__dirname, '../node_modules/dompurify/dist/purify.min.js');
    if (await fs.pathExists(purifyPath)) await fs.copy(purifyPath, path.join(vendorDir, 'purify.min.js'));

    // Images
    const imagesDir = path.join(DIST_DIR, 'images');
    await fs.ensureDir(imagesDir);
    const assetFiles = glob.sync('**/*.{jpg,jpeg,png,gif,svg}', { cwd: ASSETS_DIR });
    for (const file of assetFiles) {
        const srcPath = path.join(ASSETS_DIR, file);
        const destFile = file.startsWith('images/') || file.startsWith('images\\') ? file.substring('images/'.length) : file;
        const destPath = path.join(imagesDir, destFile);
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath);
    }

    // Files
    const filesSourceDir = path.join(ASSETS_DIR, 'files');
    if (await fs.pathExists(filesSourceDir)) {
        const filesDir = path.join(DIST_DIR, 'files');
        await fs.ensureDir(filesDir);
        const docFiles = glob.sync('**/*.{pdf,doc,docx}', { cwd: filesSourceDir });
        for (const file of docFiles) {
            await fs.copy(path.join(filesSourceDir, file), path.join(filesDir, file));
        }
    }

    // 5. Meta
    console.log('Step 5: Meta files...');
    const dataDir = path.join(DIST_DIR, 'data');
    await fs.ensureDir(dataDir);
    await fs.writeJson(path.join(dataDir, 'data.json'), data, { spaces: 2 });
    await fs.writeFile(path.join(DIST_DIR, '.nojekyll'), '');
    await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), `User-agent: *
Allow: /
Sitemap: ${SITE_URL}sitemap.xml
`);
    await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}</loc></url>
  <url><loc>${SITE_URL}resume.html</loc></url>
</urlset>`);

    console.log('Build complete - SSG Active.');
}

build().catch(console.error);
