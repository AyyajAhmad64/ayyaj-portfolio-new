# Ayyaj Kalandar Shaikh — Personal Developer Platform

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=flat&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()

> A personal developer platform, portfolio showcase, and built-in Admin CMS designed and engineered for **Ayyaj Kalandar Shaikh** (Full Stack Developer / Java Backend / Cloud Computing).

---

## ⚡ Quick Start

```powershell
# 1. Clone or navigate to the repository
cd c:\AYYAJAHMAD\Resumes\Portfolio

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in your browser
http://localhost:3000
```

To create an optimized production build:
```powershell
npm run build
```

To test the production build locally:
```powershell
npm run preview
```

---

## 📖 Complete Manual & Documentation

For the full, step-by-step operating guide, please consult the complete manual:

👉 **[Read the Full Operating Manual (MANUAL.md)](./MANUAL.md)**

The manual covers:
- **Public Portfolio Guide**: Dual-mode architecture, interactive project showcase & lightbox, AI Assistant, resume download, multi-page routing.
- **Admin CMS Manual**: Login credentials, managing projects with multi-screenshot gallery, updating experience & education, managing skills & certifications, profile & contact info.
- **Data Persistence**: How local storage and verified source defaults (`src/data/`) interact.
- **Asset Management**: Updating your resume PDF and profile headshots.
- **Production Deployment**: Guides for Vercel, Netlify, and GitHub Pages.
- **Troubleshooting & FAQ**: Common questions and solutions.

---

## 🔑 Admin CMS Access

| Parameter | Configuration |
| :--- | :--- |
| **Login URL** | `/admin/login` |
| **Username** | Configured in `.env` (`VITE_ADMIN_USER`) |
| **Password** | Configured in `.env` (`VITE_ADMIN_PASS`) |

---

## 🌟 Core Features

- **Zero Flashy Animations / Zero 3D**: High-contrast, dark developer aesthetic adhering strictly to professional software engineering standards.
- **Fixed Navigation**: Fixed top public header (`68px`) and fixed recruiter header (`64px`) with guaranteed content offsets.
- **Interactive Project Showcase**:
  - Screenshot Carousel with thumbnail selector bar.
  - Accessible fullscreen Lightbox modal with keyboard arrow navigation and Esc support.
  - Architectural blueprint fallback when screenshots are omitted.
  - Architecture pipeline flow diagram (`Client` &rarr; `API` &rarr; `Services` &rarr; `Database`).
  - Collapsible technical accordion for engineering challenges and solutions.
- **Recruiter Mode vs Developer Portfolio Mode**: One-tap toggle for executive 30-second briefing vs deep architectural breakdown.
- **Interactive AI Assistant**: Embedded query modal indexing candidate skills, education, projects, and contact info.
- **Full Address Accuracy**:
  ```
  Krishna Priyanka New Building, C101, 2nd Floor,
  The Legend Rd, Hinjawadi, Phase 1,
  Pune, Maharashtra 411057, India
  ```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Vanilla CSS3 (Custom Design System).
- **Tooling**: Vite 6, ESBuild.
- **Persistence**: Reactive event-bus architecture with browser `localStorage` and verified source-of-truth files in `src/data/`.
- **Target Backend Interop**: Ready for Spring Boot / Node.js REST API connection via `dataService.js`.

---

## 📄 License

Created by **Ayyaj Kalandar Shaikh**. All rights reserved.

