# UI/UX Design Document
## Project: GPT for BCA
### Software Requirements Specification — UI/UX Design
**Version:** 1.0  
**Date:** May 2026  
**Authors:** Akash Prajapati, Vivek Yadav  
**Institution:** BCA 6th Semester Project

---

## Table of Contents
1. [Design Principles](#1-design-principles)
2. [Color Palette & Typography](#2-color-palette--typography)
3. [Layout Structure & Spacing](#3-layout-structure--spacing)
4. [User Flow & Journey](#4-user-flow--journey)
5. [Interface Components](#5-interface-components)
6. [Visual Aesthetics & Interactions](#6-visual-aesthetics--interactions)
7. [Responsive Design Strategy](#7-responsive-design-strategy)
8. [Accessibility Considerations](#8-accessibility-considerations)
9. [Wireframes & Screen Layouts](#9-wireframes--screen-layouts)
10. [Design Methodology](#10-design-methodology)

---

## 1. Design Principles

The UI/UX of **GPT for BCA** is designed to address the specific needs of college students seeking academic resources. The following core principles guide the design:

- **Cognitive Clarity:** Educational platforms can easily become overwhelming. We prioritize minimalistic design to reduce cognitive load. The UI relies on dark themes to minimize eye strain during late-night study sessions.
- **Dynamic & Premium Feel:** We avoided generic Bootstrap/Tailwind templates in favor of a custom, hand-coded Vanilla CSS design system. The use of glassmorphism, subtle glows, and micro-animations makes the platform feel like a premium, modern SaaS product, encouraging user engagement.
- **Frictionless Onboarding:** Authentication is handled via an in-place modal rather than redirecting to separate login pages. Users can preview the platform's value on the homepage and are only prompted to authenticate when they explicitly try to access the AI Chat.
- **Consistency:** Reusable CSS variables (`global.css`) ensure that border radii, shadows, typography, and colors remain identical across all pages.

---

## 2. Color Palette & Typography

### 2.1 Color Palette
The platform utilizes a "Dark Mode First" aesthetic. The colors are defined as CSS Custom Properties in `:root`.

**Background Colors:**
- **Primary Background:** `#0a0a1a` (Deep Dark Blue/Black) – Gives depth to the application.
- **Secondary Background:** `#0f0f2e` – Used for layering elements like sidebars.
- **Card Background (Glassmorphism):** `rgba(255, 255, 255, 0.04)` – Semi-transparent white to create frosted glass effects.

**Brand & Accent Colors:**
- **Primary (Indigo):** `#6366f1` – Main brand color used for buttons, links, and highlights.
- **Primary Light:** `#818cf8` – Used for hover states and secondary outlines.
- **Secondary (Cyan):** `#06b6d4` – Used in gradients paired with Primary to create vibrant visual accents.
- **Accent (Amber):** `#f59e0b` – Used sparingly for warnings or specific call-outs.
- **Primary Gradient:** `linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)` – Used for primary CTA buttons and main heading text ("gradient-text").

**Text Colors:**
- **Primary Text:** `#f1f5f9` (Slate 100) – High contrast against dark backgrounds for readability.
- **Secondary Text:** `#94a3b8` – Used for subtitles, descriptions, and metadata.
- **Muted Text:** `#64748b` – Used for placeholders and inactive states.

### 2.2 Typography
Modern Google Web Fonts are utilized to establish a clean, tech-forward hierarchy.

- **Heading Font:** `Outfit` (sans-serif, Weights: 400 to 900)
  - *Usage:* Page titles, section headers, component titles, and primary buttons. Provides a geometric, modern look.
- **Body Font:** `Inter` (sans-serif, Weights: 300 to 700)
  - *Usage:* Paragraphs, chat messages, UI labels, and descriptions. Optimized for high legibility on screens of all sizes.

---

## 3. Layout Structure & Spacing

### 3.1 Grid & Container System
- **Maximum Width:** The main content is constrained to a `1200px` container (`.container`) and centered to maintain readability on ultra-wide monitors.
- **Padding:** Mobile and tablet screens use horizontal padding (`0 24px`) to prevent content from touching the screen edges.
- **Vertical Rhythm:** Sections are separated by consistent vertical padding (`.section { padding: 96px 0; }` and `.section-sm { padding: 64px 0; }`).

### 3.2 Sizing Tokens
- **Border Radii:** Rounded corners soften the interface.
  - `--radius-sm: 8px` (Inputs, small tags)
  - `--radius-md: 12px` (Chat bubbles, smaller cards)
  - `--radius-lg: 16px` (Main glassmorphic cards)
  - `--radius-full: 9999px` (Pill-shaped buttons)
- **Shadows:** Layering is achieved via shadows.
  - `--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3)`
  - `--shadow-glow: 0 0 40px rgba(99, 102, 241, 0.25)`

---

## 4. User Flow & Journey

### 4.1 New User Journey
1. **Landing (Home Page):** The user arrives at the homepage. They see the dynamic hero section with a simulated AI chat typing animation. The value proposition is clear: "Learn Smarter with GPT for BCA."
2. **Exploration (Syllabus Page):** The user navigates to the Syllabus page via the Navbar. They can expand accordion cards for Semester 1 through 6 to view subjects and units, or click "View Syllabus" to open the PDF. No login is required for this.
3. **Conversion (Auth Modal):** The user clicks "Ask AI Now" on the homepage or "Chat Workspace" in the Navbar. Because they are not logged in, the `AuthModal` pops up over the current page.
4. **Authentication:** The user signs in via Google OAuth or Email using Clerk.
5. **Onboarding (Chat Page):** After successful authentication, they are redirected to the `/chat` route.

### 4.2 Chat User Journey
1. **Sidebar Navigation:** The user sees previous chat histories in the left sidebar. They can click "New Chat" to start a fresh thread.
2. **Context Selection:** The user can optionally select their current semester from a dropdown in the chat header to give the AI context.
3. **Model Selection:** The user can toggle between AI response lengths (Short, Medium, Detailed).
4. **Interaction:** The user types a question. A typing indicator shows the AI is processing. The response streams or appears in a formatted bubble (supporting markdown/code blocks).

---

## 5. Interface Components

### 5.1 Glassmorphic Cards (`.glass-card`)
Used extensively for feature highlights, syllabus containers, and auth wrappers.
- **Visuals:** Semi-transparent background with a 12px background blur (`backdrop-filter: blur(12px)`). A subtle 1px white border (`rgba(255, 255, 255, 0.08)`) defines the edge.
- **Interaction:** On hover, the card shifts up slightly (`transform: translateY(-4px)`), the background becomes slightly more opaque, and the border changes to the primary indigo color.

### 5.2 Buttons
- **Primary Button (`.btn-primary`):** Pill-shaped, uses the primary indigo-to-cyan gradient background with bold white text. A glowing box shadow makes it pop as the main Call-to-Action. On hover, it lifts and the glow intensifies.
- **Outline Button (`.btn-outline`):** Transparent background with a 1.5px solid indigo border. Used for secondary actions (e.g., "Learn More").

### 5.3 Syllabus Accordion
- **Subject Cards:** Displays the subject name and an icon. Clicking the header toggles a smooth vertical expansion revealing a bulleted list of units.
- **Semester Cards:** Parent containers for subjects. Includes a right-aligned link to view/download the specific PDF for that semester.

### 5.4 Chat Interface
- **Message Bubbles:** User messages align right (different background color). AI messages align left (darker background) and feature a robot avatar `🤖`.
- **Typing Indicator:** When the AI is generating a response, three animated dots appear in the AI's chat bubble.
- **Input Area:** Fixed at the bottom of the chat window, featuring a textarea that auto-expands slightly, paired with a send button icon.

---

## 6. Visual Aesthetics & Interactions

### 6.1 Animations
Custom keyframe animations are central to the UX:
- **`fadeInUp`:** Used when page components load. Elements slide up 30px while fading in, creating a waterfall effect as the user scrolls.
- **`float`:** Used on background orbs and the hero UI mockup. Elements move up and down by 12px over 6 seconds to make the UI feel "alive".
- **`pulse-glow`:** Used on important badges or active states to draw attention.
- **Typing Text Animation:** The homepage hero section features a simulated typing effect (`TYPING_PHRASES`), automatically backspacing and typing out example prompts like "Explain recursion in C with examples."

### 6.2 Micro-Interactions
- **Hover States:** All interactive elements (links, buttons, cards) have a transition duration of `250ms ease` (`--transition-base`) to provide smooth visual feedback.
- **Scrollbar:** The default browser scrollbar is overridden with a slim, custom dark-themed scrollbar featuring an indigo thumb.

---

## 7. Responsive Design Strategy

The platform is fully responsive across Mobile, Tablet, and Desktop breakpoints using CSS Media Queries.

### 7.1 Mobile (< 768px)
- **Typography:** Font sizes scale down dynamically using CSS `clamp()` functions (e.g., `clamp(2rem, 4vw, 2.75rem)` for headers).
- **Navigation:** The horizontal Navbar collapses into a Hamburger Menu.
- **Chat Layout:** The two-column chat layout (Sidebar + Chat Window) becomes a single column. The Sidebar converts into an off-canvas drawer that slides in from the left and overlays the screen, locking background scroll.
- **Padding:** Container padding reduces to maximize screen real estate.

### 7.2 Tablet (768px - 960px)
- **Grid Layouts:** Feature cards and steps (Home Page) transition from 1 column to 2 columns.
- **Chat Layout:** Sidebar remains accessible but may be collapsible depending on screen width.

### 7.3 Desktop (> 960px)
- **Grid Layouts:** Feature cards align in 3 columns.
- **Chat Layout:** Persistent Sidebar on the left, expansive Chat Window on the right. User can manually toggle the sidebar to collapse it, giving the chat window full width.

---

## 8. Accessibility Considerations

- **Semantic HTML:** The markup uses appropriate semantic tags (`<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`) for screen readers.
- **ARIA Attributes:** ARIA roles (`role="button"`) and attributes (`aria-expanded`, `aria-label`) are used on custom interactive elements like the Syllabus Accordion and Icon Buttons.
- **Keyboard Navigation:** Custom interactive elements (like the accordion headers) have `tabIndex={0}` and `onKeyDown` listeners (checking for the 'Enter' key) to ensure they are fully operable via keyboard.
- **Contrast Ratios:** The slate text (`#f1f5f9`) on the dark background (`#0a0a1a`) significantly exceeds WCAG AA contrast requirements.
- **Focus States:** The CSS reset preserves outline focus styles so keyboard users can track their position on the page.

---

## 9. Wireframes & Screen Layouts (Text Description)

### 9.1 Home Page
- **Header:** Sticky Navbar with Logo (Left), Nav Links (Center), and Login/Profile CTA (Right).
- **Hero Section:** Two columns. Left column contains the main H1, subtitle, and primary CTA. Right column features a stylized, floating preview of the AI Chat interface with animated typing.
- **Features Grid:** A 3-column grid (on desktop) highlighting platform benefits via cards with emojis/icons.
- **How It Works:** A 4-step horizontal progression layout explaining the user journey.
- **Footer:** Links, copyright, and social icons.

### 9.2 Syllabus Page
- **Hero:** Centered text, explaining the curriculum. Two buttons below for "Download Full PDF" and "View Full PDF".
- **List Area:** A vertical list of "Semester Cards". Clicking a semester card expands it downward.
- **Nested Area:** Inside a semester card, a grid or list of "Subject Cards" is displayed. Clicking a subject card expands it to show the bulleted unit list.

### 9.3 Chat Workspace
- **Layout:** Full screen (minus browser chrome), hiding the standard Navbar and Footer.
- **Left Sidebar:** Contains a "+ New Chat" button at the top, followed by a scrollable list of recent chat threads.
- **Main Area:**
  - **Header:** Shows the current Chat Title, and dropdown menus for "Semester Context" and "Model Tier".
  - **Chat Body:** Scrollable area containing user and AI message bubbles.
  - **Footer/Input:** Fixed to the bottom of the main area. A wide text input field with a send icon button on the right.

---

## 10. Design Methodology

- **Inspiration:** The design draws inspiration from modern developer tools (e.g., Vercel, Linear, OpenAI) which favor dark modes, precise typography, and subtle glowing accents.
- **Prototyping:** While built directly into CSS, the layout paradigms follow standard flexbox and CSS Grid methodologies.
- **Iterative Refinement:** The CSS utilizes a global token system (`global.css`), ensuring that if the brand color needs to change from Indigo to Purple, only a single CSS variable needs to be updated.

---

*End of UI/UX Design Document*
