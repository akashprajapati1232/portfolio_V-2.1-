# ScaleIQ

ScaleIQ helps businesses collect more Google reviews using smart QR Codes and AI-powered review suggestions — effortlessly.

## 🚀 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS with customized design system (No Tailwind)
- **Linting**: Oxlint

## 📁 Project Structure

```text
src/
├── components/
│   ├── layout/         # High-level structural components (Navbar, Footer, etc.)
│   └── ui/             # Reusable UI components (Buttons, Inputs, Accordions, etc.)
├── constants/          # Application-wide constants and data
├── data/               # Static data and mock data used across pages
├── hooks/              # Custom React hooks (e.g., scroll handling)
├── layouts/            # Page layouts wrapper components (AuthLayout, MainLayout, etc.)
├── pages/              # Application views (Home, About, Pricing, Blog, etc.)
├── routes/             # Router configuration and definitions
├── styles/             # Global CSS files, variables, animations, and typography
└── types/              # TypeScript definitions and interfaces
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Build for Production

Compile TypeScript and build the production bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

### Linting

Run Oxlint to check for code issues:
```bash
npm run lint
```

## 🎨 Design System

ScaleIQ uses a custom CSS architecture. 
- **Variables**: Global design tokens (colors, spacing, typography) are defined in `src/styles/variables.css`.
- **Components**: UI components have colocated CSS files (e.g., `Button.tsx` and `Button.css`).
- **Animations**: Global keyframes and transitions are located in `src/styles/animations.css`.
