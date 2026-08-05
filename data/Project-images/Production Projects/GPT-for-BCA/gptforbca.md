# GPT for BCA

GPT for BCA ek student-focused learning platform hai jo BCA syllabus ko semester-wise structure me present karta hai, aur AI-assisted chat experience ke through quick learning support deta hai.

## Project Vision
- BCA students ko scattered resources se bachana.
- Syllabus, unit details, aur PDF references ko single place par lana.
- AI-driven guided learning ko simple UI ke saath accessible banana.

## Current Highlights
- Semester-wise syllabus browser (Sem 1 se Sem 6).
- Auth-gated AI chat workspace.
- Clerk-based sign in / sign up via popup modal.
- Responsive design (desktop + tablet + mobile).
- Dedicated pages: Home, About, Contact, Syllabus, Chat.

## Tech Stack

### Frontend
- React 19
- Vite
- React Router 7
- Clerk (`@clerk/clerk-react`)
- Vanilla CSS (no Tailwind / no Bootstrap)

### Data Layer
- Local JS data (`Frontend/src/data/syllabusData.js`)
- Semester-wise JSON resources (`Backend/JSON Sallybus/...`)
- PDF assets under `Frontend/public/pdfs`

## Authentication Flow (Current)
- User jab **Get Started** ya **Ask AI Now** CTA click karta hai:
  - Agar logged-in hai: direct `/chat` open hota hai.
  - Agar logged-out hai: same screen par auth popup modal open hota hai.
- Chat route `/chat` protected hai.
- Logout ke baad redirect `/` (Home) par hota hai.
- Standalone login/signup pages intentionally remove kiye gaye hain (modal-only auth UX).

## Monorepo Structure

```text
GPT-for-BCA/
├── Backend/
│   └── JSON Sallybus/
│       ├── Sem 2nd/
│       ├── Sem 4th/
│       └── Sem 6th/
├── Frontend/
│   ├── public/
│   │   ├── pdfs/
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Local Setup

### 1. Prerequisites
- Node.js 18+
- npm 9+

### 2. Install & Run Frontend

```bash
cd Frontend
npm install
npm run dev
```

Default dev URL:
- `http://localhost:5173`

### 3. Production Build

```bash
npm run build
```

## Environment Variables

`Frontend/.env` me minimum ye key required hai:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Frontend Scripts
- `npm run dev` -> local development server
- `npm run build` -> production build
- `npm run preview` -> built app preview
- `npm run lint` -> eslint checks

## Route Map
- `/` -> Home
- `/about` -> About
- `/contact` -> Contact
- `/syllabus` -> Syllabus
- `/chat` -> Protected chat workspace
- `*` -> Home fallback

## Code Documentation Policy
- Code comments Hinglish me maintain kiye gaye hain.
- UI sections, auth flow, chat state aur form logic ke around inline comments add kiye gaye hain for maintainability.
- CSS files me section-level style comments intentionally included hain for navigation clarity.

## Troubleshooting

### Build passes but auth modal not opening?
- Check `VITE_CLERK_PUBLISHABLE_KEY` present hai ya nahi.
- Browser console me Clerk related runtime error verify karo.

### Chat route redirect issue?
- Ensure Clerk session active ho.
- Logout ke baad expected behavior: Home page redirect.

### Styling mismatch?
- Browser hard refresh (`Cmd/Ctrl + Shift + R`) run karo.

## Contributors
- Akash Prajapati
- Vivek Yadav

## License
Project educational purpose ke liye maintained hai. Agar aap open-source release plan kar rahe ho to recommended license explicitly add karein (e.g., MIT).
