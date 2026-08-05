# Technical Stack Document
## Project: GPT for BCA
### Software Requirements Specification — Technical Stack
**Version:** 1.0  
**Date:** May 2026  
**Authors:** Akash Prajapati, Vivek Yadav  
**Institution:** BCA 6th Semester Project

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Frontend Technologies](#3-frontend-technologies)
4. [Backend Technologies](#4-backend-technologies)
5. [AI / LLM Engine](#5-ai--llm-engine)
6. [Data Layer](#6-data-layer)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Structure](#8-api-structure)
9. [Hosting & Deployment](#9-hosting--deployment)
10. [Version Control](#10-version-control)
11. [Third-Party Services](#11-third-party-services)
12. [Security Practices](#12-security-practices)
13. [Scalability Considerations](#13-scalability-considerations)
14. [Development Tools & Environment](#14-development-tools--environment)

---

## 1. Project Overview

**GPT for BCA** is a student-focused, AI-powered learning platform built exclusively for BCA (Bachelor of Computer Applications) students. The platform provides:

- A **semester-wise structured syllabus browser** covering all 6 semesters of the BCA program.
- An **AI-driven chat workspace** where students can ask questions on any BCA topic and receive instant, context-aware answers.
- **Downloadable PDF resources** for each semester's subjects.
- A **protected chat route** — only authenticated users can access the AI assistant, preventing misuse.

The project follows a **monorepo structure** with a separate `Frontend/` and `Backend/` directory, both maintained under a single Git repository.

---

## 2. System Architecture

### 2.1 Architecture Pattern
The system follows a **Client-Server Architecture** with a clear separation of concerns:

```
[User's Browser]
       |
       | HTTPS
       ↓
[Frontend — React SPA hosted on Vercel]
       |
       | HTTP REST API calls (fetch)
       ↓
[Backend — Node.js / Express server]
       |
       | HTTP (localhost / LAN)
       ↓
[Ollama Local LLM Server]
       |
       ↓
[qwen3:8b AI Model — runs locally on hardware]
```

### 2.2 Monorepo Layout & File Structure Explanation

The project uses a monorepo structure to keep both frontend and backend codebases in a single repository. Below is the detailed file structure and an explanation of how each part works:

```text
GPT-for-BCA/
├── Backend/                      ← Node.js / Express REST API
│   ├── JSON Sallybus/            ← Stores static JSON files containing detailed syllabus data for each semester (e.g., Sem 2nd, 4th, 6th).
│   ├── controllers/              ← Contains business logic. 
│   │   └── chatController.js     ← Handles AI chat requests, formatting prompts, and communicating with the local Ollama LLM.
│   ├── routes/                   ← Defines API endpoints.
│   │   └── chatRoutes.js         ← Maps the `/api/chat` endpoint to `chatController.js`.
│   ├── utils/                    ← Helper functions and utilities.
│   │   └── syllabusLoader.js     ← Utility for loading syllabus data.
│   ├── .env                      ← Backend environment variables (PORT, OLLAMA_URL).
│   ├── package.json              ← Backend dependencies (express, axios, cors, dotenv).
│   └── server.js                 ← Main entry point for the backend server. Configures middleware, routes, and starts the Express app.
│
├── Frontend/                     ← React 19 SPA built with Vite
│   ├── public/                   ← Static assets served directly at the root path.
│   │   ├── pdfs/                 ← Downloadable PDF syllabus files for students.
│   │   └── icons.svg             ← SVG icon assets.
│   ├── src/                      ← Main React source code directory.
│   │   ├── assets/               ← Images and other media imported into React components.
│   │   ├── components/           ← Reusable UI components.
│   │   │   ├── auth/             ← Authentication-related components (AuthModal, ProtectedChatLink).
│   │   │   ├── chat/             ← Chat interface components (ChatWindow, Sidebar, MessageInput, ChatItem).
│   │   │   ├── Footer.jsx        ← Global footer component.
│   │   │   ├── Navbar.jsx        ← Global navigation bar.
│   │   │   └── ScrollToTop.jsx   ← Utility component to scroll to the top on route change.
│   │   ├── context/              ← React Context providers.
│   │   │   └── AuthModalContext  ← Manages the state of the custom Authentication Modal.
│   │   ├── data/                 ← Static frontend data.
│   │   │   └── syllabusData.js   ← JavaScript object containing the semester-wise syllabus structure used by the Syllabus page.
│   │   ├── pages/                ← Top-level route components.
│   │   │   ├── About.jsx         ← "About Us" page.
│   │   │   ├── ChatPage.jsx      ← Protected AI Chat workspace.
│   │   │   ├── Contact.jsx       ← "Contact Us" page.
│   │   │   ├── Home.jsx          ← Landing page with hero section and features.
│   │   │   ├── ProfilePage.jsx   ← User profile management.
│   │   │   └── Syllabus.jsx      ← Page displaying the accordion-style syllabus viewer.
│   │   ├── styles/               ← CSS stylesheets.
│   │   │   ├── global.css        ← Global design tokens, variables, and utility classes.
│   │   │   └── *.css             ← Component-specific styles (e.g., Home.css, ChatPage.css).
│   │   ├── App.jsx               ← Root React component defining React Router routes and layouts.
│   │   └── main.jsx              ← React entry point, wrapping the app with ClerkProvider and attaching it to the DOM.
│   ├── .env                      ← Frontend environment variables (VITE_CLERK_PUBLISHABLE_KEY).
│   ├── eslint.config.js          ← ESLint configuration for code quality.
│   ├── index.html                ← Main HTML template where the Vite app is injected.
│   ├── package.json              ← Frontend dependencies (React, Clerk, React Router, Vite).
│   ├── vercel.json               ← Configuration for deploying to Vercel (rewrite rules for SPA routing).
│   └── vite.config.js            ← Vite bundler configuration.
│
├── .gitignore                    ← Global Git ignore rules (node_modules, .env).
└── README.md                     ← Project documentation and setup instructions.
```

**How it works together:**
1. **Initial Load:** The user visits the frontend (hosted on Vercel or locally). `index.html` loads the React app via `main.jsx`.
2. **Routing & Views:** `App.jsx` handles routing using React Router. Static pages like the Home or Syllabus page fetch and render static data from local files (`src/data/syllabusData.js`).
3. **Authentication:** For protected routes (like `/chat`), the `ClerkProvider` ensures the user is authenticated. If not, the custom `AuthModal` pops up within the same page context without a hard redirect.
4. **API Communication:** When a user sends a message in the chat interface, the React frontend makes an HTTP POST request to the backend API (`server.js` -> `chatRoutes.js` -> `chatController.js`).
5. **AI Inference:** The backend `chatController.js` receives the request, constructs the appropriate prompt using conversation history, and sends it to the local Ollama LLM server. Once the LLM generates a response, the Express server sends it back to the React UI where it is displayed.

### 2.3 Design Principles
- **Separation of Concerns:** Frontend handles UI/UX; Backend handles AI inference and routing logic.
- **Stateless API:** The backend does not maintain session state; Clerk tokens authenticate each request.
- **Local-first AI:** The LLM runs locally via Ollama, keeping all AI inference private and cost-free.

---

## 3. Frontend Technologies

### 3.1 React 19
**Version:** `^19.2.4`  
**Why chosen:** React is the industry-standard JavaScript library for building interactive, component-based user interfaces. Version 19 introduces improved concurrent rendering and automatic batching, which makes the chat interface smoother and more responsive.  
**How used:**
- All pages (Home, About, Contact, Syllabus, Chat) are built as React function components.
- React's `useState` and `useEffect` hooks manage local UI state (e.g., open/close accordion, typing animation, sidebar toggle).
- The `useCallback` hook is used in `ChatPage.jsx` to memoize event handlers for renaming and deleting chats, preventing unnecessary re-renders.

### 3.2 Vite
**Version:** `^8.0.1`  
**Why chosen:** Vite is a next-generation frontend build tool. It uses native ES modules during development, providing near-instant Hot Module Replacement (HMR). This dramatically speeds up development compared to Webpack.  
**How used:**
- Configured via `vite.config.js` with the `@vitejs/plugin-react` plugin for JSX transformation.
- `npm run dev` starts the Vite dev server on `http://localhost:5173`.
- `npm run build` generates an optimized production bundle in the `dist/` folder, which is deployed to Vercel.

### 3.3 React Router DOM v7
**Version:** `^7.13.2`  
**Why chosen:** React Router is the standard routing library for React SPAs. It allows navigation between pages without full page reloads, keeping the experience fast and seamless.  
**How used:**
- `BrowserRouter` wraps the entire app.
- Defined routes: `/` (Home), `/about`, `/contact`, `/syllabus`, `/chat`, `/chat/profile`.
- The `/chat` and `/chat/profile` routes are **protected** — unauthenticated users trigger the `ChatAuthRedirect` component, which opens the auth modal and redirects to home.
- `ScrollToTop` component listens to route changes and scrolls the window to the top on navigation.

### 3.4 Vanilla CSS (Custom Design System)
**Why chosen:** No CSS framework like Tailwind or Bootstrap is used. This keeps the bundle size minimal and gives complete control over the visual design system. The project uses a carefully crafted CSS design system defined in `global.css`.

**How used:**
- **CSS Custom Properties (Variables):** All design tokens are defined as `:root` variables:
  - Colors: `--color-primary: #6366f1`, `--color-secondary: #06b6d4`, `--color-bg: #0a0a1a`
  - Typography: `--font-body: 'Inter'`, `--font-heading: 'Outfit'`
  - Spacing, radii, shadows, transitions — all tokenized.
- **Component-level CSS:** Each component/page has its own dedicated CSS file (e.g., `Home.css`, `ChatWindow.css`, `Navbar.css`) imported directly into the JSX file.
- **Utility classes:** Global reusable classes like `.btn-primary`, `.btn-outline`, `.glass-card`, `.gradient-text`, `.section-tag`, `.container` are defined once and reused everywhere.
- **Animations:** Custom `@keyframes` animations — `fadeInUp`, `float`, `pulse-glow`, `shimmer`, `spin-slow`, `fadeInLeft`, `fadeInRight` — add life to the UI.

### 3.5 Google Fonts
**Fonts used:**
- `Inter` (weights: 300, 400, 500, 600, 700) — Body text font. Clean, readable, and modern.
- `Outfit` (weights: 400–900) — Heading font. Bold and distinctive for titles and CTAs.

Imported via `@import url('https://fonts.googleapis.com/...')` in `global.css`.

---

## 4. Backend Technologies

### 4.1 Node.js
**Version:** 18+ (LTS)  
**Why chosen:** Node.js is a JavaScript runtime built on Chrome's V8 engine. Using JavaScript on both frontend and backend reduces context switching for the development team. Node.js is particularly well-suited for I/O-bound tasks like making HTTP requests to an AI inference server.  
**How used:** Runs the Express server process. Manages asynchronous operations (AI API calls, route handling) via async/await.

### 4.2 Express.js
**Version:** `^5.2.1`  
**Why chosen:** Express is the most widely used Node.js web framework. It is minimal, fast, and provides a clean API for defining routes and middleware. Version 5 improves async error handling, making the code cleaner.  
**How used:**
- `app.use(cors())` — Enables Cross-Origin Resource Sharing so the React frontend (running on a different port) can call the backend.
- `app.use(express.json())` — Parses incoming JSON request bodies.
- Route defined: `POST /api/chat` — the primary AI chat endpoint.
- Global 404 and error handler middleware for consistent error responses.

### 4.3 CORS (`cors` package)
**Version:** `^2.8.6`  
**Why chosen:** The frontend and backend run on different origins during development (`localhost:5173` vs `localhost:5001`). CORS middleware allows the browser to make cross-origin API calls.

### 4.4 dotenv
**Version:** `^17.4.0`  
**Why chosen:** Manages environment-specific configuration (ports, API URLs, model names) without hardcoding them in source code.  
**Configuration:**
```
PORT=5001
OLLAMA_URL=http://localhost:11434/api/generate
DEFAULT_MODEL=qwen3:8b
```

### 4.5 axios
**Version:** `^1.14.0`  
**Why chosen:** Used in the backend to make HTTP requests from the Node.js server to the Ollama LLM server. Axios provides a clean Promise-based API with timeout support (120-second timeout for AI inference) and automatic JSON parsing.

---

## 5. AI / LLM Engine

### 5.1 Ollama
**What it is:** Ollama is an open-source tool that allows developers to run large language models (LLMs) locally on their own hardware. It provides a REST API interface for model inference.  
**Why chosen:**
- **Privacy:** All AI inference happens locally — no user data is sent to external cloud APIs.
- **Cost-free:** No per-token API charges (unlike OpenAI GPT or Google Gemini).
- **Control:** The developer controls which model runs and can switch models without code changes.
- **Offline capability:** Works without an internet connection once the model is downloaded.

**How used:**
- The backend calls `http://localhost:11434/api/generate` via Axios.
- On server startup, a **warm-up request** is sent to pre-load the model into memory so the first user request responds quickly.
- Stream is set to `false` for simplicity (full response returned at once).

### 5.2 qwen3:8b Model
**What it is:** Qwen3 is an 8-billion parameter open-source LLM developed by Alibaba Cloud. The `8b` variant balances intelligence and performance for commodity hardware.  
**Why chosen:**
- Excellent reasoning and instruction-following capability.
- Multilingual support — the system prompt instructs it to auto-detect and respond in the user's language (English or Hindi).
- 8B parameter size runs efficiently on modern laptops/desktops with a GPU or Apple Silicon.

### 5.3 Model Tier System
The chat controller implements three **response verbosity tiers**, selectable by the user in the chat interface:

| Tier ID             | Response Style                              |
|---------------------|---------------------------------------------|
| `gptforbca-low`     | Short and concise (2-3 sentences max)       |
| `gptforbca-medium`  | Moderate detail, uses bullet points         |
| `gptforbca-high`    | Full, in-depth explanation (default)        |

All tiers use the same `qwen3:8b` model; only the system prompt instruction changes.

### 5.4 System Prompt Design
The AI is given a carefully crafted system prompt:
- Identity: "You are GPTforBCA, a highly capable AI model for BCA students."
- Language auto-detection: Responds in the same language as the user.
- Conversation history: Last 10 messages are injected into the prompt for context continuity.
- Response mode: Appended based on the selected tier.

### 5.5 Built-in Shortcut Handlers
Before calling Ollama, the controller checks for:
1. **Greeting patterns** (hi, hello, namaste) → Returns a hardcoded friendly reply instantly, saving inference time.
2. **Syllabus page queries** (e.g., "show syllabus", "syllabus dikhao") → Returns a redirect hint with `syllabusRedirect: true` flag, which the frontend uses to display a navigation button.

---

## 6. Data Layer

> **Note:** This project does **not** use a traditional relational or NoSQL database for persistent storage. All data is either static (JSON files, PDFs) or managed client-side in React state.

### 6.1 Static Syllabus Data — Local JS/JSON
**Location:** `Frontend/src/data/syllabusData.js`  
**Format:** A JavaScript array of objects, each representing a semester with its subjects and unit-wise breakdowns.  
**Why:** The BCA syllabus is largely static data that changes at most once per year. A database would be over-engineering for this use case. Local data loads instantly with zero network overhead.

### 6.2 Semester JSON Resources
**Location:** `Backend/JSON Sallybus/Sem 2nd/`, `Sem 4th/`, `Sem 6th/`  
**Format:** JSON files containing detailed subject data per semester.  
**Why:** Keeps structured curriculum data organized by semester, easily extendable.

### 6.3 PDF Resources
**Location:** `Frontend/public/pdfs/`  
**Format:** Static PDF files served directly by Vite/Vercel.  
**Why:** Allows students to download the official syllabus PDFs without needing a backend request.

### 6.4 Runtime Chat State
- All chat messages and chat sessions are managed **in-memory** using React's `useState` (`messagesByChat`, `chats` arrays in `ChatPage.jsx`).
- Data is not persisted across browser sessions (by design for the current version).
- The `apiRequest` helper in `ChatPage.jsx` is a stub that returns empty arrays — the persistence layer is intentionally disabled for this academic release.

---

## 7. Authentication & Authorization

### 7.1 Clerk
**Package:** `@clerk/clerk-react` version `^5.61.4`  
**What it is:** Clerk is a full-featured, developer-first authentication and user management SaaS platform. It handles user sign-up, sign-in, session management, and user profiles out of the box.

**Why chosen:**
- Zero backend auth code needed — Clerk manages the entire auth flow.
- Supports Email/Password, Google OAuth, and GitHub OAuth out of the box.
- Provides React components and hooks that integrate seamlessly.
- Free tier is generous enough for a college project.

**How it works in this project:**

1. **ClerkProvider** wraps the app in `main.jsx`, initialized with `VITE_CLERK_PUBLISHABLE_KEY`.
2. **Auth Modal (Popup-only UX):** Standalone login/signup pages are intentionally removed. Auth happens via a custom modal (`AuthModal.jsx`) that appears in-place without a page redirect, keeping the user on the same page.
3. **AuthModalContext:** A React Context (`AuthModalContext.jsx`) manages the modal's open/close state and the target redirect path after login.
4. **ProtectedChatLink component:** A wrapper that checks auth state. If signed in → navigates to `/chat`. If signed out → opens the auth modal.
5. **Route Protection:**
   - `<SignedIn>` / `<SignedOut>` Clerk components conditionally render the `ChatPage` or trigger `ChatAuthRedirect`.
   - `ChatAuthRedirect` opens the auth modal and navigates to `/` (home), preventing direct URL access to `/chat` by unauthenticated users.
6. **Token Management:** `useAuth().getToken()` is available for authenticated API calls (prepared for future backend auth middleware).

### 7.2 Authorization Model
- **Public routes:** `/`, `/about`, `/contact`, `/syllabus` — accessible by anyone.
- **Protected routes:** `/chat`, `/chat/profile` — requires an active Clerk session.
- Authorization is enforced at the **React Router level** using Clerk's `SignedIn`/`SignedOut` components.

---

## 8. API Structure

### 8.1 API Style
The project uses a **RESTful HTTP API** built with Express.js.

### 8.2 Base URL
- **Development:** `http://localhost:5001`
- **Production:** Backend is intended to run as a separate server (not yet hosted on cloud for the academic version).

### 8.3 Endpoints

#### `GET /`
- **Description:** Health check endpoint. Returns a confirmation that the server is running.
- **Response:**
  ```json
  { "message": "GPT for BCA — Backend is running 🚀" }
  ```

#### `POST /api/chat`
- **Description:** The primary AI inference endpoint. Sends a user message to Ollama and returns the AI response.
- **Request Body:**
  ```json
  {
    "message": "Explain recursion in C with examples.",
    "model": "gptforbca-high",
    "semester": "3",
    "history": [
      { "role": "user", "content": "Hello" },
      { "role": "assistant", "content": "Hello! How can I help you?" }
    ]
  }
  ```
- **Field Descriptions:**
  - `message` (required): The user's question/input.
  - `model` (optional, default: `gptforbca-high`): Response verbosity tier.
  - `semester` (optional): Semester context hint.
  - `history` (optional): Array of previous messages for conversation context (last 10 used).

- **Success Response (200):**
  ```json
  {
    "reply": "Recursion is when a function calls itself...",
    "model": "gptforbca-high",
    "syllabusRedirect": false
  }
  ```
- **Error Responses:**
  - `400 Bad Request` — Empty or missing `message` field.
  - `503 Service Unavailable` — Ollama server is not running (`ECONNREFUSED`).
  - `502 Bad Gateway` — Ollama returned an empty response.
  - `500 Internal Server Error` — Unhandled server error.

### 8.4 Frontend API Call (fetch)
The frontend uses the native `fetch` API to call the backend:
```javascript
const aiRes = await fetch('http://localhost:5001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, model, semester, history }),
});
```

---

## 9. Hosting & Deployment

### 9.1 Frontend — Vercel
**Platform:** [Vercel](https://vercel.com)  
**Why chosen:**
- Purpose-built for frontend frameworks like React/Vite.
- Automatic deployments on every Git push to the main branch.
- Global CDN (Content Delivery Network) ensures fast load times worldwide.
- Free tier is sufficient for academic projects.
- Zero-configuration deployment for Vite projects.

**Configuration (`vercel.json`):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This single rewrite rule ensures that React Router's client-side routing works correctly on Vercel. Without it, directly navigating to `/syllabus` or `/chat` would return a 404 from the server.

**Build Command:** `npm run build` (generates `dist/`)  
**Output Directory:** `dist/`  
**Dev URL:** `http://localhost:5173`

### 9.2 Backend — Local / Self-hosted
The Express backend and Ollama server are designed to run locally. For production deployment, the backend can be hosted on:
- **Railway.app** or **Render.com** — free-tier Node.js hosting.
- **VPS (DigitalOcean, AWS EC2)** — for more control and to run Ollama with GPU support.

> **Note:** Because Ollama runs a large language model locally, hosting on free cloud platforms has memory/CPU limitations. For a college demo, the backend + Ollama runs on the developer's local machine.

---

## 10. Version Control

### 10.1 Git
**Why chosen:** Git is the industry-standard distributed version control system. It allows tracking every code change, reverting mistakes, and collaborating effectively.

**Key practices:**
- `.gitignore` files at both root and `Frontend/` level exclude `node_modules/`, `.env` files, `.DS_Store`, and build artifacts from version control.
- Sensitive keys (`VITE_CLERK_PUBLISHABLE_KEY`, Ollama URLs) are stored in `.env` files which are gitignored.

### 10.2 GitHub
**Repository:** `akashprajapati1232/GPT-for-BCA`  
**Why chosen:**
- Free cloud hosting for Git repositories.
- Integrated with Vercel for automatic CI/CD deployments.
- Pull request workflow for collaborative development between Akash and Vivek.

---

## 11. Third-Party Services

### 11.1 Clerk (Authentication)
- **Purpose:** User authentication, session management, user profile.
- **Integration:** `@clerk/clerk-react` SDK.
- **Cost:** Free tier.

### 11.2 Ollama (LLM Runtime)
- **Purpose:** Local large language model inference server.
- **Integration:** HTTP REST API (`/api/generate`).
- **Cost:** Free (open-source).

### 11.3 qwen3:8b (AI Model)
- **Purpose:** AI inference — answering student questions.
- **Integration:** Via Ollama.
- **Cost:** Free (open-source model).

### 11.4 Google Fonts
- **Purpose:** Typography — `Inter` and `Outfit` font families.
- **Integration:** CSS `@import` from `fonts.googleapis.com`.
- **Cost:** Free.

### 11.5 Vercel
- **Purpose:** Frontend hosting and CDN.
- **Integration:** Git-connected automatic deployment.
- **Cost:** Free tier.

---

## 12. Security Practices

### 12.1 Environment Variable Management
- All secrets (API keys, model URLs) are stored in `.env` files.
- `.env` files are excluded from Git via `.gitignore`.
- Frontend environment variables are prefixed with `VITE_` to be embedded at build time by Vite — they are **not** runtime secrets.

### 12.2 Authentication Security
- Clerk handles all authentication security: password hashing, JWT token issuance, session expiry, and CSRF protection.
- The frontend never stores raw passwords.
- Clerk sessions use short-lived JWT tokens with automatic refresh.

### 12.3 Route Protection
- The `/chat` route is protected at the React Router level using Clerk's `<SignedIn>` / `<SignedOut>` components.
- Direct URL access by unauthenticated users triggers a redirect to home with the auth modal open.

### 12.4 Input Validation
- The backend validates the `message` field before processing: checks for existence, correct type, and non-empty string.
- Invalid inputs return a `400 Bad Request` response with a descriptive error message.

### 12.5 CORS Configuration
- `cors()` middleware is applied globally on the Express server.
- For production hardening, CORS can be restricted to specific origins (e.g., only the Vercel frontend domain).

### 12.6 Timeout Handling
- Ollama API calls have a 120-second timeout. If the model takes longer, the request fails gracefully with an error message rather than hanging indefinitely.

### 12.7 No Sensitive Data in AI Prompts
- The system prompt never includes personal user data or credentials.
- Conversation history passed to Ollama contains only the text content of messages.

---

## 13. Scalability Considerations

### 13.1 Current Scale
The application is designed for academic/college use, primarily serving a small number of concurrent users.

### 13.2 Frontend Scalability
- Vercel's CDN automatically distributes static assets globally. The React SPA scales horizontally by nature — each user's browser runs its own instance.
- Code-splitting can be added via React's `lazy()` and `Suspense` for larger apps.

### 13.3 Backend Scalability
- The Express server is currently single-process. For higher traffic:
  - **PM2** cluster mode can spawn multiple Node.js processes to use all CPU cores.
  - **Load balancer** (e.g., Nginx) can distribute requests across multiple server instances.

### 13.4 AI Inference Scalability
- Ollama runs one inference at a time on the current hardware. For concurrent users:
  - A **request queue** (e.g., using `bull` or `p-queue`) can serialize AI requests.
  - Multiple Ollama instances can be run on machines with more GPU VRAM.
  - Cloud AI APIs (OpenAI, Groq) can replace Ollama for higher concurrency with a configuration change (only `OLLAMA_URL` needs updating).

### 13.5 Data Scalability
- Replacing the in-memory chat state with a database (e.g., **Supabase** PostgreSQL or **MongoDB Atlas**) would enable persistent chat history across sessions and devices.

---

## 14. Development Tools & Environment

### 14.1 Node.js & npm
- **Node.js:** v18+ (LTS) — JavaScript runtime for both the build tool (Vite) and the backend server.
- **npm:** v9+ — Package manager for installing and managing dependencies.

### 14.2 ESLint
- **Config:** `eslint.config.js` in the Frontend directory.
- **Plugins:** `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.
- **Purpose:** Enforces code quality rules, catches common React mistakes (e.g., missing dependency arrays in hooks), and ensures consistent code style.

### 14.3 Vite Dev Server
- **URL:** `http://localhost:5173`
- **Features:** Instant HMR, fast cold starts, native ES module support.

### 14.4 VS Code (Recommended IDE)
- Recommended extensions: ESLint, Prettier, React Developer Tools.

### 14.5 Browser DevTools
- Chrome/Firefox Developer Tools used for debugging React state, network requests, and CSS layout.

### 14.6 Postman / Thunder Client
- Used for testing the `POST /api/chat` endpoint independently of the frontend during development.

### 14.7 Ollama CLI
- `ollama run qwen3:8b` — Starts the model interactively for testing.
- `ollama serve` — Starts the Ollama REST server on port 11434.
- `ollama pull qwen3:8b` — Downloads the model (~5GB).

### 14.8 Git CLI & GitHub Desktop
- Used for version control operations, branching, and pushing to GitHub.

---

## Summary Table

| Category              | Technology / Tool               | Version / Details              |
|-----------------------|---------------------------------|--------------------------------|
| Frontend Framework    | React                           | 19.2.4                         |
| Build Tool            | Vite                            | 8.0.1                          |
| Routing               | React Router DOM                | 7.13.2                         |
| Styling               | Vanilla CSS + Google Fonts      | Inter, Outfit                  |
| Backend Runtime       | Node.js                         | 18+ LTS                        |
| Backend Framework     | Express.js                      | 5.2.1                          |
| AI Runtime            | Ollama                          | Latest                         |
| AI Model              | qwen3:8b                        | 8B parameters                  |
| Authentication        | Clerk                           | @clerk/clerk-react ^5.61.4     |
| API Style             | REST                            | JSON over HTTP                 |
| Frontend Deployment   | Vercel                          | Free tier, CDN                 |
| Version Control       | Git + GitHub                    | akashprajapati1232/GPT-for-BCA |
| Package Manager       | npm                             | 9+                             |
| Linting               | ESLint                          | 9.39.4                         |
| Environment Config    | dotenv                          | 17.4.0                         |
| HTTP Client (backend) | axios                           | 1.14.0                         |

---

*End of Technical Stack Document*
