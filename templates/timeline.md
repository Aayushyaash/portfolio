---
# Timeline Configuration
activate: true # Set to false to hide the entire Timeline section/tab
title: "Timeline"

# Milestones displayed in the timeline
milestones:
  - title: "Milestone Title"
    type: "TYPE" # Used for badge label (e.g., WORK, EDUCATION, ACHIVEMENT)
    # CONFIG: Use Mapped Keys (defined in timelineRenderer.js) for typeColor.
    # Options: 'accent', 'purple', 'orange', 'pink'.
    # These map to complex styles (bg + border + text).
    typeColor: "accent" 
    date: "Date" # Short date for the menu
    dateRange: "Date Range" # Full date range for the content view
    organization: "Organization"
    organizationIcon: "work" # Material Symbols icon name
    summary: "Short summary for the menu item."
    description: "Full description for the content pane. Supports markdown-like text."
    
    # Left Content Box (Optional)
    leftBox:
      title: "Box Title"
      icon: "code"
      # CONFIG: Use COLOR_MAP keys for iconColor: 'accent', 'purple', 'orange', 'pink'.
      # These map to literal Tailwind classes via COLOR_MAP in timelineRenderer.js.
      iconColor: "accent" 
      isList: false # If true, renders items as bullet points. If false/missing, renders as tags.
      items:
        - "Item 1"
        - "Item 2"

    # Right Content Box (Optional)
    rightBox:
      title: "Highlights"
      icon: "emoji_events"
      # CONFIG: Use COLOR_MAP keys: 'accent', 'purple', 'orange', 'pink'
      iconColor: "accent"
      isList: true # Renders as a bulleted list
      items:
        - "Highlight 1"
        - "Highlight 2"

    # Links Section (Optional)
    links:
      - label: "View Certificate"
        url: "https://example.com"
        icon: "open_in_new" # Material symbol name
        iconType: "material" # 'material' or 'fa' (FontAwesome)
---
