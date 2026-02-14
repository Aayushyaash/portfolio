# Build Scripts

This directory contains scripts used to build and deploy the portfolio website.

## build.js

The `build.js` script is responsible for generating the static content for the portfolio.

### Usage

```bash
npm run build
```

### Functionality

1.  **Clean**: Removes the existing `dist/` directory.
2.  **Assets**: Copies static assets (images, etc.) from `assets/` to `dist/images/`.
3.  **Data Generation**:
    *   Parses `assets/profile.md` to get user information.
    *   Parses all `.md` files in `assets/projects/` to get project data.
    *   Generates a `dist/data/data.json` file containing this structured data.
4.  **HTML**: Copies `src/index.html` to `dist/index.html`.
5.  **Styles & Scripts**: Copies `src/css` and `src/js` to `dist/css` and `dist/js`.

### Data Format

The generated `data.json` will have the following structure:

```json
{
  "profile": { ... },
  "projects": [ ... ]
}
```
