---
# Main Profile Configuration
name: "Your Name" # Appears in the navigation and page title
title: "Your Title" # Appears in the hero section
subtitle: "Your Subtitle" # Appears below the name in the header
tagline: "Your Tagline" # A short, catchy phrase
bio: "Your Bio" # The main bio text displayed in the hero section

# Social Links
# These appear in the sidebar/footer. Remove valid links to hide them.
social:
  github: "https://github.com/yourusername"
  githubLabel: "/yourusername" # Text displayed next to the icon
  linkedin: "https://www.linkedin.com/in/yourusername"
  linkedinLabel: "/in/yourusername"
  email: "youremail@example.com" # Creates a mailto: link

# Stats
experience: "Exp Years" # e.g., "Fresher" or "2+ Years"
projectsCount: "Count" # e.g., "5+"

# Hero Image
image: "./images/profile-placeholder.jpg" # Path to your profile picture (relative to assets/)

# Theme Colors
# These override the global CSS variables.
# MUST use Hex Codes (e.g., #FACC15) because they are set as CSS variables.
colors:
  accent: "#FACC15" # Primary accent color (Yellow by default)
  accentBlue: "#3B82F6" # Secondary accent color (Blue by default)

# Hero Section Text
hero:
  title: "Building the future with" # The static text above the highlight
  highlight: "Code & Design" # The gradient-colored, highlighted text

# Skills Section
# Displays as a list of skills in the timeline/profile view.
skills:
  frontend: "Skill, Skill, Skill."
  backend: "Skill, Skill, Skill."
  database: "Skill, Skill, Skill."
  devops: "Skill, Skill, Skill."

# Location (Footer Badge)
location:
  label: "City, Country"
  visible: true # Set to false to hide the badge
  # style:
  #   background: "#27272a"
  #   border: "#3F3F46"
  #   text: "#D1D5DB"
  #   dot: "#22C55E"

# Availability Status Badge
availability:
  status: "OPEN TO WORK"
  visible: true # Set to false to hide the badge globally
  # MUST use Hex Code (e.g., #4bf63bff) because opacity is manipulated via JS.
  color: "#4bf63bff" # Hex color for the badge status dot and border
  # style:
  #   background: "rgba(59, 130, 246, 0.1)"
  #   border: "rgba(59, 130, 246, 0.3)"
  #   text: "#3B82F6"
  #   dot: "#3B82F6"
---
