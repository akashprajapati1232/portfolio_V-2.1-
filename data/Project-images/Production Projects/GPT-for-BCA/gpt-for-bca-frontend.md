# Frontend - GPT for BCA

Ye folder GPT for BCA ka React + Vite frontend app contain karta hai.

## Purpose
- BCA students ko clean, fast aur responsive learning interface dena.
- Syllabus pages aur AI chat experience ko single web app me integrate karna.
- Auth protected chat workspace provide karna (Clerk modal flow).

## Core Modules
- `src/pages/Home.jsx` -> landing experience + CTA
- `src/pages/About.jsx` -> story, mission, team, mentor
- `src/pages/Syllabus.jsx` -> semester/subject/unit accordion listing
- `src/pages/Contact.jsx` -> validated contact form UI
- `src/pages/ChatPage.jsx` -> protected chat UI (sidebar + message area)

## Auth System (Modal Only)
- Auth popup modal components:
  - `src/components/auth/AuthModal.jsx`
  - `src/components/auth/ProtectedChatLink.jsx`
  - `src/context/AuthModalContext.jsx`
- Standalone login/signup routes intentionally use nahi kiye ja rahe.
- Chat access rule:
  - Signed-in -> direct `/chat`
  - Signed-out -> modal open

## Styling Strategy
- Pure CSS (no Tailwind / no Bootstrap)
- Global design tokens: `src/styles/global.css`
- Page-specific and component-specific CSS files
- Shared dark-theme visual language with gradients + glass effects

## Project Structure (Frontend)

```text
Frontend/
├── public/
│   ├── icons.svg
│   └── pdfs/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── ScrollToTop.jsx
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## Prerequisites
- Node.js 18+
- npm

## Setup

```bash
cd Frontend
npm install
```

## Environment Variable
Create `Frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Run Commands

```bash
npm run dev      # development server
npm run build    # production bundle
npm run preview  # preview built output
npm run lint     # eslint check
```

## Route Summary
- `/` -> Home
- `/about` -> About
- `/contact` -> Contact
- `/syllabus` -> Syllabus
- `/chat` -> Protected chat page

## UX Rules Implemented
- Responsive navbar + mobile drawer
- Popup-based auth flow for CTA buttons
- Chat page full-height app layout
- Sidebar collapse behavior on mobile
- Logout redirects to home page

## Developer Notes
- Code comments Hinglish me maintain kiye gaye hain.
- Reusable CTA links ke liye `ProtectedChatLink` use karein.
- New protected features add karte waqt auth modal context reuse karein.

## Common Issues

### App start nahi ho rahi
- Ensure dependencies installed hain (`npm install`).
- Ensure `.env` key present hai.

### Clerk modal render issue
- `VITE_CLERK_PUBLISHABLE_KEY` valid hona chahiye.
- Browser cache clear / hard refresh try karein.

### CSS changes reflect nahi ho rahe
- Dev server restart karein.
- Hard reload karein.
