# Templates

These are **example/template** files for users who fork this repository.

To use them, copy the files you need into the `assets/` directory and customize them.

> **Important:** Do NOT edit these files directly — the build script only reads from `assets/`.

## File Structure

```
assets/
├── theme.json          # Theme configuration (colors, navigation styles)
├── profile.md          # Profile info, social links, skills, availability
├── resume.md           # Resume page (terminal, experience, education)
├── timeline.md         # Timeline milestones
├── projects/           # Project cards (one .md file per project)
│   ├── project-one.md
│   └── ...
├── images/             # Image assets
│   ├── profile-pic.jpeg
│   └── ...
└── files/              # Documents (PDFs, etc.)
    └── resume.pdf
```

## Theme Configuration (`theme.json`)

Controls global theming and navigation styling:

| Field | Description |
|-------|-------------|
| `nav.activeClasses` | Tailwind classes for active nav item |
| `nav.inactiveClasses` | Tailwind classes for inactive nav items |
| `nav.activeIcon` | Classes for active nav icon |
| `nav.inactiveIcon` | Classes for inactive nav icon |
| `colors.accent` | Primary accent color (yellow) |
| `colors.accent-blue` | Secondary accent color |
| `colors.bg` | Background color |
| `colors.surface` | Card backgrounds |
| `colors.surface-highlight` | Highlighted surfaces |
| `colors.border` | Border colors |
| `colors.muted` | Muted/subdued text |
| `colors.text-main` | Primary text color |

**Note:** `theme.json` colors override `profile.md` colors and are injected as CSS variables during build.

## Visibility Controls

Several components can be shown/hidden:

| Component | File | Field |
|-----------|------|-------|
| Timeline section | `timeline.md` | `activate: true/false` |
| Experience section | `resume.md` | `experience.activate: true/false` |
| Availability badge | `profile.md` | `availability.visible: true/false` |
| Location badge | `profile.md` | `location.visible: true/false` |
| Project card style | `projects/*.md` | `featured: true/false` |

## Styling Controls

Badges support granular styling:

```yaml
availability:
  style:
    background: "rgba(31, 41, 55, 0.5)"
    border: "rgba(55, 65, 81, 0.7)"
    text: "#9ca3af"
    dot: "#22c55e"
```

Same pattern applies to `location.style`.
