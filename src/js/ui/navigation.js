/**
 * Navigation Module
 * Handles scroll spy, active link highlighting, and mobile nav toggle.
 */

// Use injected theme or fallback
const theme = window.PORTFOLIO_THEME?.nav || {};
const NAV_ACTIVE_CLASSES = theme.activeClasses || ['bg-surfaceHighlight/50', 'text-white', 'border-l-4', 'border-accent'];
const NAV_INACTIVE_CLASSES = theme.inactiveClasses || ['text-muted', 'hover:bg-surfaceHighlight', 'hover:text-white'];

let rafId = null;

/**
 * Sets up scroll spy navigation and mobile nav.
 */
export function setupNavigation() {
    // Only set up scroll spy on the main page (which has hash-based section nav)
    const isMainPage = !!document.getElementById('about');

    if (isMainPage) {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]:not([href="#"])');

        const onScroll = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const activeId = getActiveSection(sections);
                updateActiveLink(activeId, navLinks);
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    setupMobileNav();
}

/**
 * Determines which section is currently active based on scroll position.
 * "contact" only activates when the user has scrolled to the very bottom.
 * @param {NodeList} sections - All section[id] elements.
 * @returns {string|null} The ID of the active section, or 'contact' at page bottom.
 */
function getActiveSection(sections) {
    const BOTTOM_THRESHOLD = 20;
    const scrollBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    const isScrollable = document.documentElement.scrollHeight > window.innerHeight;

    if (isScrollable && scrollBottom < BOTTOM_THRESHOLD) {
        return 'contact';
    }

    const activationLine = window.innerHeight * 0.4;
    let activeId = null;

    sections.forEach(section => {
        if (section.offsetHeight === 0) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= activationLine) {
            activeId = section.id;
        }
    });

    if (!activeId) {
        for (const section of sections) {
            if (section.offsetHeight > 0) {
                activeId = section.id;
                break;
            }
        }
    }

    return activeId;
}

/**
 * Updates the active class for navigation links.
 * @param {string} activeId - The ID of the section currently in view.
 * @param {NodeList} navLinks - List of navigation link elements.
 */
function updateActiveLink(activeId, navLinks) {
    navLinks.forEach(link => {
        const fullHref = link.getAttribute('href');
        const hrefParts = fullHref.split('#');
        const href = hrefParts.length > 1 ? hrefParts[1] : ''; // Get ID part
        const icon = link.querySelector('.material-symbols-outlined');

        if (href === activeId) {
            // Is Active
            link.classList.remove(...NAV_INACTIVE_CLASSES);
            link.classList.add(...NAV_ACTIVE_CLASSES);

            // Icon handling
            if (icon) {
                icon.classList.add('text-accent');
                icon.classList.remove('group-hover:text-accentBlue');
            }
        } else {
            // Is Inactive
            link.classList.remove(...NAV_ACTIVE_CLASSES);
            link.classList.add(...NAV_INACTIVE_CLASSES);

            // Icon handling
            if (icon) {
                icon.classList.remove('text-accent');
                icon.classList.add('group-hover:text-accentBlue');
            }
        }
    });
}

/**
 * Sets up hamburger menu toggle for mobile screens.
 */
function setupMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const drawer = document.getElementById('mobile-nav-menu');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const closeBtn = drawer?.querySelector('.mobile-drawer-close');

    if (!toggle || !drawer) return;

    toggle.addEventListener('click', () => {
        const isOpen = drawer.classList.contains('open');
        setDrawerState(!isOpen, drawer, backdrop);
    });

    // Close via close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            setDrawerState(false, drawer, backdrop);
        });
    }

    // Close via backdrop click
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            setDrawerState(false, drawer, backdrop);
        });
    }

    // Close when a nav link is clicked
    drawer.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            setDrawerState(false, drawer, backdrop);
        }
    });

    // Close via Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            setDrawerState(false, drawer, backdrop);
        }
    });
}

/**
 * Opens or closes the mobile drawer.
 * @param {boolean} open - Whether to open or close.
 * @param {HTMLElement} drawer - The drawer element.
 * @param {HTMLElement|null} backdrop - The backdrop overlay element.
 */
function setDrawerState(open, drawer, backdrop) {
    const toggle = document.getElementById('mobile-nav-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(open));

    if (open) {
        drawer.classList.add('open');
        if (backdrop) backdrop.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('open');
        if (backdrop) backdrop.classList.add('hidden');
        document.body.style.overflow = '';
    }
}
