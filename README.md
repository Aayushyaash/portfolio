# Portfolio Generator

> A modern Static Site Generator (SSG) for personal portfolio websites with pre-rendering at build time and client-side hydration for interactivity.

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Deploy](https://github.com/Aayushyaash/portfolio/actions/workflows/static.yml/badge.svg)](https://github.com/Aayushyaash/portfolio/actions/workflows/static.yml)

**Live Demo:** [https://aayushyaash.github.io/portfolio/](https://aayushyaash.github.io/portfolio/)

---

## ✨ Features

- **📝 Data-Driven Content**: Profile, projects, resume, and timeline managed via Markdown/YAML files
- **⚡ Static Site Generation**: Custom Node.js build script with JSDOM for pre-rendering at build time
- **🎨 Responsive Design**: Mobile-first layout using Tailwind CSS with customizable theme
- **🔍 Skills Filtering**: Interactive project and experience filtering by technology
- **📱 Mobile Navigation**: Hamburger menu with smooth drawer animation
- **📊 Timeline Component**: Interactive career timeline with milestone details
- **🚀 Automated Deployment**: GitHub Actions CI/CD pipeline for GitHub Pages
- **🔒 XSS Protection**: DOMPurify integration for content sanitization

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Aayushyaash/portfolio.git
cd portfolio

# Install dependencies
npm install

# Build the project
npm run build

# Preview locally
npx serve dist
```

Open `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
portfolio/
├── assets/                    # Content source (edit these!)
│   ├── files/                 # Downloadable files (resume.pdf)
│   ├── images/                # Images and screenshots
│   ├── projects/              # Project markdown files
│   ├── profile.md             # User profile information
│   ├── resume.md              # Resume content
│   ├── timeline.md            # Career timeline data
│   └── theme.json             # Theme configuration
├── src/                       # Source code
│   ├── css/                   # Stylesheets
│   │   ├── style.css          # Custom styles
│   │   └── tailwind-input.css # Tailwind entry point
│   ├── js/                    # JavaScript modules
│   │   ├── ui/                # UI renderers
│   │   │   ├── filtering.js   # Skills filter
│   │   │   ├── navigation.js  # Scroll spy & mobile nav
│   │   │   ├── renderer.js    # Main UI renderer
│   │   │   ├── resumeRenderer.js
│   │   │   └── timelineRenderer.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── errorHandler.js
│   │   │   └── htmlHelpers.js
│   │   └── main.js            # Application entry point
│   ├── partials/              # HTML partials
│   │   ├── footer.html
│   │   └── nav.html
│   ├── index.html             # Main page template
│   └── resume.html            # Resume page template
├── scripts/                   # Build tools
│   ├── build.js               # SSG build script
│   └── validation.js          # Content validation schemas
├── dist/                      # Build output (generated)
├── tests/                     # Unit tests
├── .github/workflows/         # CI/CD configuration
├── package.json               # NPM configuration
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.js          # PostCSS config
├── biome.json                 # Biome linter/formatter config
└── .editorconfig              # Editor formatting settings
```

---

## 🛠️ Development

### Build Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Full build (HTML + CSS) |
| `npm run build:css` | Build CSS only |
| `npm run dev` | Development mode (build + serve) |
| `npm run clean` | Clean dist directory |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Biome |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run tests in watch mode |

### Adding Content

#### Update Profile

Edit `assets/profile.md`:

```yaml
---
name: "Your Name"
title: "Software Developer"
bio: "Your biography..."
social:
  github: "https://github.com/yourusername"
  linkedin: "https://linkedin.com/in/yourprofile"
  email: "your@email.com"
skills:
  frontend: "React, Vue, JavaScript"
  backend: "Node.js, Python, Go"
---
```

#### Add a Project

Create `assets/projects/my-project.md`:

```yaml
---
title: "My Project"
description: "A brief description."
tags: ["React", "Node.js", "PostgreSQL"]
githubLink: "https://github.com/username/project"
externalLink: "https://project.example.com"
image: "./images/project.jpg"
featured: true
order: 1
---

Optional detailed content...
```

#### Customize Theme

Edit `assets/theme.json`:

```json
{
  "colors": {
    "accent": "#FACC15",
    "accent-blue": "#60A5FA",
    "bg": "#09090b",
    "surface": "#18181b"
  }
}
```

---

## 🏗️ Architecture

### Build-Time (SSG)

```
Content Files → build.js → JSDOM → Pre-rendered HTML → dist/
```

1. Parse Markdown files with YAML frontmatter using gray-matter
2. Load and transform renderer scripts (strip ES module syntax)
3. Inject partials (nav.html, footer.html) into HTML templates
4. Execute scripts in JSDOM with `runScripts: "dangerously"`
5. Serialize DOM to static HTML and copy assets

### Runtime (Client-Side Hydration)

```
Browser → main.js → Setup Interactive Handlers → DOM Updates
```

1. Initialize on `DOMContentLoaded` event
2. Setup interactive handlers (timeline, courses, filters)
3. Fetch `data/data.json` for filter functionality (resume page)
4. Enable skills filtering with closure-based state management
5. Setup scroll spy navigation with RAF throttling
6. Add touch support for mobile project cards

## 🚢 Deployment

The project uses GitHub Actions for automated deployment to GitHub Pages.

### Automatic Deployment

1. Push to the `prod` branch
2. GitHub Actions builds the project (Node.js 20)
3. Artifacts deployed to GitHub Pages

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy dist/ to your hosting
# (GitHub Pages, Netlify, Vercel, etc.)
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_URL` | `https://aayushyaash.github.io/portfolio/` | Base URL for sitemap and canonical links |

---

## 📦 Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `dompurify` | ^3.3.1 | HTML sanitization |
| `fs-extra` | ^11.3.3 | File system operations |
| `glob` | ^10.5.0 | File pattern matching |
| `gray-matter` | ^4.0.3 | YAML frontmatter parsing |
| `js-yaml` | ^4.1.1 | YAML parsing |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `@biomejs/biome` | ^2.4.4 | Linting and formatting |
| `autoprefixer` | ^10.4.0 | CSS autoprefixing |
| `jsdom` | ^28.1.0 | DOM simulation for SSG |
| `postcss` | ^8.4.0 | CSS transformation |
| `postcss-cli` | ^11.0.0 | PostCSS CLI |
| `tailwindcss` | ^3.4.0 | Utility-first CSS framework |
| `vitest` | ^4.0.18 | Unit testing framework |

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

**Aayush Yash** - [aayushyaash@outlook.com](mailto:aayushyaash@outlook.com)

Project Link: [https://github.com/Aayushyaash/portfolio](https://github.com/Aayushyaash/portfolio)

---

*Built with Node.js, Tailwind CSS, and Vanilla JavaScript*
