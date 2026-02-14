---
# Resume Page Configuration

# Terminal Section (Top of Resume Page)
terminal:
  user: "username" # The 'user' part of user@host
  host: "portfolio" # The 'host' part of user@host
  path: "~" # Current working directory displayed
  commands:
    - input: "whoami" # The command 'typed' by the user
      output: "Your generic info string." # The response labeled in the terminal
    - input: "python analyze_skills.py"
      output: "Another output string."

# Experience Section
experience:
  activate: false # Set to true to show this section
  title: "Relevant Experience"
  roles:
    - title: "Role Title"
      company: "Company Name"
      date: "Date Range" # e.g., "Jan 2023 - Present"
      description: "Brief description of the role."
      tags: ["Tag1", "Tag2"] # Technologies used

# Education Section
education:
  title: "Education"
  degree: "Degree Name"
  school: "School Name"
  date: "Date Range"
  courses:
    - code: "CS101"
      title: "Course Title"
      details:
        - "Key learning point 1"
        - "Key learning point 2"
  achievements:
    - icon: "emoji_events" # Material Symbols icon name
      text: "Achievement description"

# Resume Download Link
# Linked in the navigation bar and footer.
resumeFile: "files/resume.pdf" # Path to PDF in assets/files/
---
