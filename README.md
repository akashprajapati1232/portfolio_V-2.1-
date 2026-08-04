# 🖥️ Akash Prajapati — Personal Portfolio (v2.1)

> A VS Code-themed interactive developer portfolio built with vanilla HTML, CSS, and JavaScript.
> Features a full IDE simulation — File Explorer, Tabbed Editor, Terminal, and a J.A.R.V.I.S AI assistant.

[![Version](https://img.shields.io/badge/version-2.1.0-blue?style=flat-square)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE.txt)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Customization Guide](#customization-guide)
- [AI Assistant (J.A.R.V.I.S)](#ai-assistant-jarvis)
- [Terminal Commands](#terminal-commands)
- [Responsive Design](#responsive-design)
- [Asset Organization](#asset-organization)
- [Development Notes](#development-notes)
- [Future Improvements](#future-improvements)
- [Credits](#credits)
- [License](#license)

---

## Overview

This portfolio is designed to look and feel exactly like **Visual Studio Code**. Visitors can:

- Browse sections through a **File Explorer** sidebar
- View content in a **syntax-highlighted tabbed editor**
- Chat with **J.A.R.V.I.S**, an AI assistant that knows my entire profile
- Interact with a **terminal** supporting custom portfolio commands
- **Resize** sidebars and terminal panels just like a real IDE
- Use **hash-based URL routing** (e.g., `index.html#projects`)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ File Explorer | Collapsible folder tree with keyboard navigation |
| 🗄️ Tabbed Editor | Open multiple files, switch between tabs, close with middle-click |
| 💬 J.A.R.V.I.S AI | Context-aware AI assistant with suggestion chips |
| 🖥️ Terminal | Custom terminal with 15+ portfolio commands and tab-completion |
| 🔗 Hash Routing | Direct URL links to any section (e.g., `#projects`) |
| 📱 Responsive | Mobile-first off-canvas sidebar with hamburger menu |
| ⚡ Offline-ready | All fonts and icons downloaded locally — no CDN dependencies |
| 🎨 VS Code Theme | Authentic VS Code dark theme with accurate colors and layout |
| 🔍 Breadcrumbs | VS Code-style breadcrumb navigation |
| 📏 Resizable Panels | Drag to resize sidebar and terminal panel |

---

## 📁 Folder Structure

```
portfolio-akash/
│
├── assets/                    # All static media assets
│   ├── images/                # Project screenshots
│   │   ├── ImgNinja/
│   │   ├── snake-game/
│   │   ├── portfolio/
│   │   ├── advocateatulpal/
│   │   ├── gptforbca/
│   │   ├── clgchatbot/
│   │   ├── brandifycreator/
│   │   ├── hackthone/
│   │   └── certificate/
│   ├── icons/                 # (Reserved for future SVG icons)
│   ├── logos/                 # Profile photos and brand logos
│   │   ├── akash-prajapati.jpg
│   │   └── profile.png
│   └── fonts/                 # Self-hosted fonts (no CDN)
│       ├── fonts.css          # @font-face declarations
│       ├── fira-code/         # Fira Code woff2 files
│       ├── inter/             # Inter woff2 files
│       └── fontawesome/       # Font Awesome 6 Free
│           ├── all.min.css
│           └── webfonts/
│
├── css/                       # Modular stylesheets
│   ├── variables.css          # CSS custom properties (design tokens)
│   ├── main.css               # Reset, body, title bar, status bar, layout
│   ├── explorer.css           # Activity bar, sidebar, file tree, extensions
│   ├── editor.css             # Tabs, editor area, markdown & JSON rendering
│   ├── terminal.css           # Bottom terminal panel
│   ├── ai.css                 # J.A.R.V.I.S chat panel + resize handles
│   └── responsive.css         # Mobile breakpoints and print styles
│
├── data/                      # Portfolio content as JSON
│   ├── profile.json           # Personal info, bio, stats, roles
│   ├── projects.json          # All projects with metadata
│   ├── skills.json            # Technical skills by category
│   ├── education.json         # Education timeline + achievements
│   ├── certifications.json    # Certifications list
│   └── socials.json           # Social media links
│
├── js/                        # JavaScript modules
│   ├── dataLoader.js          # Async JSON data loader → window.PORTFOLIO_DATA
│   ├── markdown.js            # Custom markdown renderer
│   ├── router.js              # Hash-based URL router
│   ├── explorer.js            # File explorer logic
│   ├── tabs.js                # Tab manager
│   ├── terminal.js            # Terminal emulator
│   ├── ai.js                  # J.A.R.V.I.S AI assistant
│   ├── app.js                 # Main controller & content builders
│   └── resize.js              # Resizable panel handles
│
├── index.html                 # App entry point
└── README.md                  # This file
```

---

## 🛠️ Technologies

| Category | Technology |
|---|---|
| **Structure** | HTML5 (semantic) |
| **Styles** | Vanilla CSS3 (modular, custom properties) |
| **Logic** | Vanilla JavaScript ES6+ (IIFE modules) |
| **Font (Code)** | Fira Code v27 — self-hosted |
| **Font (UI)** | Inter v20 — self-hosted |
| **Icons** | Font Awesome 6 Free — self-hosted |
| **Data** | JSON files (no backend required) |

> **Zero frameworks. Zero build tools. Zero CDN dependencies.**

---

## 🚀 Getting Started

### Run Locally

Because the app uses `fetch()` to load JSON files, it requires an HTTP server (not `file://`).

**Option 1 — VS Code Live Server extension:**
```
Right-click index.html → Open with Live Server
```

**Option 2 — Python:**
```bash
python3 -m http.server 8080
# Then open: http://localhost:8080
```

**Option 3 — Node.js http-server:**
```bash
npx http-server -p 8080
# Then open: http://localhost:8080
```

**Option 4 — PHP:**
```bash
php -S localhost:8080
```

---

## 🎨 Customization Guide

### Updating Personal Information

Edit `data/profile.json`:

```json
{
  "name": "Your Name",
  "title": "Your Title",
  "location": "Your City, Country",
  "email": "you@email.com",
  "bio": ["First paragraph...", "Second paragraph..."]
}
```

### Adding a New Project

Edit `data/projects.json` and add a new object to the array:

```json
{
  "id": "my-project",
  "title": "My Project Name",
  "description": "What this project does...",
  "tech": ["React", "Node.js"],
  "github": "https://github.com/username/repo",
  "live": "https://your-live-demo.com",
  "image": "assets/images/your-project/screenshot.png",
  "year": "2025",
  "type": "web"
}
```

Then add a subfolder for screenshots under `assets/images/your-project/`.

### Adding a Skill

Edit `data/skills.json` and add to the appropriate category:

```json
"web": [
  { "name": "Vue.js", "level": 80, "icon": "fab fa-vuejs" }
]
```

Skill levels are percentages (1–100) used to render the skill bar.

### Changing the Color Theme

Edit `css/variables.css` — all colors are CSS custom properties:

```css
:root {
  --bg-editor:       #1e1e1e;  /* Main editor background */
  --bg-sidebar:      #252526;  /* Sidebar background */
  --bg-status-bar:   #007acc;  /* Status bar (blue by default) */
  --text-primary:    #d4d4d4;  /* Main text color */
}
```

---

## 💬 AI Assistant (J.A.R.V.I.S)

Click the **chat icon** in the right activity bar (or click any suggestion chip) to open J.A.R.V.I.S.

### Supported Queries

| Topic | Example Questions |
|---|---|
| **About** | "Who are you?", "Tell me about yourself" |
| **Skills** | "What languages do you know?", "Show me your tech stack" |
| **Projects** | "Show your projects", "Tell me about ImgNinja" |
| **Education** | "What's your education?", "Show certificates" |
| **Contact** | "How to reach you?", "GitHub link?" |

### Suggestion Chips

J.A.R.V.I.S generates clickable suggestion chips after each response to guide the conversation.

---

## 🖥️ Terminal Commands

Open the terminal with `Ctrl+\`` or click the Terminal panel.

| Command | Description |
|---|---|
| `help` | List all available commands |
| `about` | Print personal bio |
| `skills` | List technical skills |
| `projects` | List all projects |
| `contact` | Show contact information |
| `education` | Show education history |
| `clear` | Clear terminal output |
| `whoami` | Show brief identity |
| `ls` / `dir` | List portfolio files |
| `cat README.md` | Open a file in the editor |
| `open <project>` | Open project in browser |
| `github` | Open GitHub profile |
| `linkedin` | Open LinkedIn profile |
| `email` | Open email client |
| `date` | Show current date/time |
| `history` | Show command history |

> **Tip:** Use `Tab` for autocomplete and `↑`/`↓` arrow keys to navigate command history.

---

## 📱 Responsive Design

| Breakpoint | Layout |
|---|---|
| `> 1024px` | Full desktop layout (sidebar + editor + terminal) |
| `≤ 1024px` | Narrower sidebar (220px) |
| `≤ 768px` | Mobile: off-canvas sidebar, hamburger menu |
| `≤ 480px` | Very compact: reduced font sizes, fewer menu items |
| `≤ 360px` | Minimal: only 2 menu items shown |

---

## 🖼️ Asset Organization

Project screenshots go in `assets/images/<project-id>/`:

```
assets/logos/
├── akash-prajapati.jpg  ← Main profile photo (used in README.md hero)
├── profile.png          ← Small avatar (used in activity bar)
assets/images/
├── ImgNinja/
│   ├── project-ImgNinja-01.png  ← Used as card thumbnail
│   └── project-ImgNinja-02.png  ← Additional screenshots
└── ...
```

For certificates, use `assets/images/certificate/`.

---

## 🔧 Development Notes

### Module Architecture

All JavaScript modules use the **IIFE pattern** and expose a `window.ModuleName` global:

```
window.PORTFOLIO_DATA  ← Set by dataLoader.js (async)
window.FILE_REGISTRY   ← Set by dataLoader.js (async)
window.Router          ← Hash-based navigation
window.Explorer        ← File tree & activity bar
window.TabManager      ← Tab bar management
window.Terminal        ← Terminal emulator
window.JarvisAI        ← AI assistant
window.PanelResizer    ← Drag-to-resize handles
window.MarkdownRenderer← Markdown parser
```

### Data Flow

```
index.html loads → dataLoader.js (fetch JSON files in parallel)
                 → dispatches 'portfolioDataReady' event
                 → app.js::boot() → app.js::init()
                    → Explorer.init()
                    → TabManager.init()
                    → Terminal.init()
                    → JarvisAI.init()
                    → PanelResizer.init()
                    → Router.init()
```

### CSS Load Order

CSS files **must** be loaded in this order (each depends on variables from the previous):

1. `variables.css` — design tokens
2. `main.css` — reset + body + shell
3. `explorer.css` — sidebar components
4. `editor.css` — tabs + editor
5. `terminal.css` — terminal panel
6. `ai.css` — chat panel + resize handles
7. `responsive.css` — overrides for breakpoints

---

## 🔮 Future Improvements

- [ ] Command Palette (`Ctrl+Shift+P`) with fuzzy search
- [ ] Light theme toggle
- [ ] Multi-cursor editor simulation
- [ ] Project image carousel viewer
- [ ] PWA / offline app manifest
- [ ] Animated typing effect for terminal boot
- [ ] Keyboard shortcut overlay (`Ctrl+K Ctrl+S`)

---

## 🙏 Credits

- **Design Inspiration:** [Visual Studio Code](https://code.visualstudio.com/) by Microsoft
- **Icons:** [Font Awesome 6 Free](https://fontawesome.com/)
- **Code Font:** [Fira Code](https://github.com/tonsky/FiraCode) by Nikita Prokopov
- **UI Font:** [Inter](https://rsms.me/inter/) by Rasmus Andersson

---

## 📄 License

MIT License — see [LICENSE.txt](LICENSE.txt) for details.

---

<div align="center">
  Made with ❤️ by <strong>Akash Prajapati</strong><br>
  <a href="https://github.com/akashprajapati1232">GitHub</a> ·
  <a href="https://www.linkedin.com/in/akash-prajapati1232/">LinkedIn</a> ·
  <a href="mailto:akashprajapati1232@gmail.com">Email</a>
</div>
