# Portfolio

A static portfolio website. Content is managed via Markdown/YAML, built with a custom Node.js script, and styled with Tailwind CSS.

## Features

-   **Data-Driven Content**: Profile and Project information are stored in `assets/` as Markdown files with YAML frontmatter.
-   **Static Site Generation**: A custom build script (`scripts/build.js`) compiles assets into a static JSON structure, ensuring fast load times and no backend dependencies.
-   **Responsive Design**: Mobile-first layout using Tailwind CSS, optimized for all devices.
-   **Automated Deployment**: Configured with GitHub Actions to build and deploy to GitHub Pages on every push to `prod`.

## Project Structure

```
/
├── assets/                  # Content Source (Edit this!)
│   ├── projects/           # Project Markdown files
│   └── profile.md          # User profile information
├── src/                     # Source Code
│   ├── css/                # Custom Styles
│   ├── js/                 # Frontend Logic
│   └── index.html          # Main Template
├── scripts/                 # Build Tools
│   └── build.js            # Site Generator Script
├── dist/                    # Build Artifacts (Generated)
└── README.md                # Project Documentation
```

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   npm

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Aayushyaash/portfolio.git
    cd portfolio
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

### Development

1.  **Build the Project**:
    Run the build script to generate the static site in the `dist/` directory.
    ```bash
    npm run build
    ```

2.  **Preview Locally**:
    Use a local static server to view the built site.
    ```bash
    npx serve dist
    ```
    Open `http://localhost:3000` in your browser.

## Customization

### Updating Profile
Edit `assets/profile.md` to update your name, bio, social links, and other personal details. The frontmatter keys map directly to the frontend display.

### Adding Projects
Create a new Markdown file in `assets/projects/` (e.g., `my-new-project.md`). Use the following frontmatter template:

```yaml
---
title: "Project Name"
description: "Short description."
tags: ["Tech1", "Tech2"]
githubLink: "https://github.com/..."
externalLink: "https://..."
image: "./images/project_image.jpg"
featured: true
order: 1
---

(Optional detailed content goes here)
```

**Note**: Place project images in `assets/images/` or alongside the markdown, and reference them relatively. The build script will copy them to `dist/images/`.

## Deployment

The project is pre-configured for GitHub Pages.

1.  Push your changes to the `prod` branch.
2.  The **GitHub Action** (`.github/workflows/static.yml`) will automatically:
    -   Install dependencies.
    -   Run `npm run build`.
    -   Deploy the `dist/` folder to GitHub Pages.

## Tech Stack

-   **Generator**: Node.js, `fs-extra`, `gray-matter`, `glob`, `jsdom`, `dompurify`
-   **Styling**: Tailwind CSS (PostCSS build pipeline with Autoprefixer)
-   **Frontend**: Vanilla JavaScript (ES6+)