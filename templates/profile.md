---
# Main Profile Configuration
# This file controls the hero section, navigation header, and personal information.

# Basic Info
name: "Your Name"                    # Appears in navigation and page title
subtitle: "Your Subtitle"            # Appears below name in header
tagline: "Your Tagline"              # Short catchy phrase (currently unused)
bio: "Your bio text here. This appears in the hero section below the headline."

# Social Links (remove or set to "#" to hide)
social:
  github: "https://github.com/yourusername"
  githubLabel: "/yourusername"       # Text displayed next to icon
  linkedin: "https://www.linkedin.com/in/yourusername"
  linkedinLabel: "/in/yourusername"
  email: "youremail@example.com"     # Creates mailto: link

# Stats Bar
experience: "5+"                     # e.g., "5+ Years" or "Fresher"

# Profile Image (path relative to assets/)
image: "./images/profile-pic.jpeg"

# Hero Section
hero:
  title: "Building the future with"  # Static text before highlight
  highlight: "Code & Design"         # Gradient-colored highlighted text

# Theme Colors (override defaults, must be hex codes)
# These are set as CSS variables. Also see theme.json for more color options.
colors:
  accent: "#FACC15"                  # Primary accent (yellow by default)
  accentBlue: "#60A5FA"              # Secondary accent (blue by default)

# Skills Section (displayed as tech stack cards)
skills:
  frontend: "React, Tailwind CSS, JavaScript, HTML5."
  backend: "FastAPI, Django, Flask, Node.js."
  database: "PostgreSQL, SQLite, Redis."
  devops: "Git/GitHub, Google Cloud."

# Location Badge (footer)
location:
  label: "City, Country"             # Text displayed in badge
  visible: true                      # Set to false to hide badge
  style:                             # Granular styling control
    background: "#27272a"
    border: "#3F3F46"
    text: "#D1D5DB"
    dot: "#22C55E"                   # Color of the animated dot

# Availability Status Badge
availability:
  status: "OPEN TO WORK"             # Text displayed in badge
  visible: true                      # Set to false to hide badge globally
  style:                             # Granular styling control
    background: "rgba(31, 41, 55, 0.5)"
    border: "rgba(55, 65, 81, 0.7)"
    text: "#9ca3af"
    dot: "#22c55e"                   # Color of the animated dot
---
