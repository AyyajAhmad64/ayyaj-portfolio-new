# Ayyaj Kalandar Shaikh — Personal Developer Platform
## Comprehensive Operating Manual & Developer Instructions

> **Platform Version**: 2.0.0  
> **Author**: Ayyaj Kalandar Shaikh  
> **Role**: Full Stack Developer / Java Backend Developer / Cloud Computing  
> **Specialization**: Java, Spring Boot, React.js, MySQL, Cloud Computing  
> **Location**: Krishna Priyanka New Building, C101, 2nd Floor, The Legend Rd, Hinjawadi, Phase 1, Pune, Maharashtra 411057, India  

---

## Table of Contents

1. [Platform Overview & Architecture](#1-platform-overview--architecture)
2. [Quick Start & Local Development](#2-quick-start--local-development)
3. [Production Build & Deployment](#3-production-build--deployment)
4. [Public Portfolio Guide](#4-public-portfolio-guide)
   - [Dual-Mode Architecture (Developer vs Recruiter)](#dual-mode-architecture)
   - [Interactive Project Showcase & Lightbox](#interactive-project-showcase--lightbox)
   - [Built-In AI Assistant](#built-in-ai-assistant)
   - [Resume Viewing & Download](#resume-viewing--download)
   - [Multi-Page Navigation & Smooth Scroll](#multi-page-navigation--smooth-scroll)
5. [Admin CMS Manual](#5-admin-cms-manual)
   - [Access & Authentication](#admin-access--authentication)
   - [Sidebar Navigation & Layout](#admin-layout)
   - [Managing Projects & Screenshot Gallery](#managing-projects--screenshot-gallery)
   - [Managing Experience Timeline](#managing-experience-timeline)
   - [Managing Education Timeline](#managing-education-timeline)
   - [Managing Skills Matrix](#managing-skills-matrix)
   - [Managing Certifications](#managing-certifications)
   - [Managing Achievements](#managing-achievements)
   - [Managing Gallery & Media Library](#managing-gallery--media-library)
   - [Managing Profile & Contact Address](#managing-profile--contact-address)
   - [Managing Recruiter Briefing](#managing-recruiter-briefing)
   - [Platform Settings & Data Reset](#platform-settings--data-reset)
6. [Data Persistence & Storage Architecture](#6-data-persistence--storage-architecture)
   - [How Changes are Saved](#how-changes-are-saved)
   - [How to Make Changes Permanent in Source Code](#how-to-make-changes-permanent-in-source-code)
7. [Asset Management (Resume PDF & Photos)](#7-asset-management)
8. [Production Deployment Guide](#8-production-deployment-guide)
   - [Deploying to Vercel](#deploying-to-vercel)
   - [Deploying to Netlify](#deploying-to-netlify)
   - [Deploying to GitHub Pages](#deploying-to-github-pages)
9. [Troubleshooting & Frequently Asked Questions](#9-troubleshooting--faq)

---

## 1. Platform Overview & Architecture

This repository contains the complete, production-quality personal developer platform for **Ayyaj Kalandar Shaikh**. It was engineered to serve as a high-end, lifetime-maintainable technical showcase for recruiters, engineering managers, and technical peers.

### Key Architectural Pillars
- **Framework**: React 18 with Vite 6.
- **Routing**: Client-side Multi-Page Routing via React Router v6.28.
- **Design System**: Bespoke dark editorial theme inspired by developer workstations and high-end engineering platforms.
- **Strict Motion Standard**: Zero continuous animations, zero 3D canvas libraries, zero parallax, zero flashy scroll transitions. Crisp, instant, high-contrast, accessible.
- **Fixed Navigation**: Public navbar is fixed at `top: 0` (`68px`), Admin sidebar is fixed at `100vh`, and Recruiter navbar is fixed at `top: 0` (`64px`) with guaranteed content offsets.
- **Data Layer**: Centralized reactive event-bus service layer (`src/services/dataService.js`) backed by browser `localStorage` and verified fallback defaults (`src/data/*.js`).
- **Admin CMS**: Built-in full CRUD management portal with authentication guard for managing all portfolio content without touching code.

### Directory Structure
```
c:\AYYAJAHMAD\Resumes\Portfolio\
├── public/                           # Static assets served as-is
│   ├── Ayyaj Kalandar Shaikh - Resume.pdf  # Primary resume file
│   ├── profile.jpg                   # Main headshot / avatar photo
│   ├── audit-desktop.png             # UI preview asset
│   ├── audit-mobile.png              # Mobile preview asset
│   ├── robots.txt                    # Search crawler rules
│   └── sitemap.xml                   # SEO sitemap
├── src/
│   ├── components/                   # Reusable UI & Showcase components
│   │   ├── AIAssistant.jsx           # Interactive AI portfolio query modal
│   │   ├── Button.jsx                # Unified button component
│   │   ├── Navbar.jsx                # Fixed public portfolio header
│   │   ├── Footer.jsx                # Public footer
│   │   ├── ModeSwitcher.jsx          # Developer / Recruiter mode toggle
│   │   ├── ProjectGallery.jsx        # Carousel + Lightbox + Blueprint fallback
│   │   ├── ProjectSnapshot.jsx       # Quick metadata strip
│   │   ├── ProjectAtAGlance.jsx      # Executive summary & highlight cards
│   │   ├── ProjectKeyFeatures.jsx    # Numbered feature cards
│   │   ├── ProjectTechStack.jsx      # Categorized technology stack
│   │   ├── ProjectFlowDiagram.jsx    # Architecture pipeline flow diagram
│   │   ├── ProjectTechnicalDetails.jsx # Collapsible engineering accordion
│   │   ├── ProjectThumbnail.jsx      # Card preview with fallback
│   │   ├── NormalHomeView.jsx        # Developer homepage view
│   │   ├── RecruiterHomeView.jsx     # Recruiter overview dossier
│   │   └── SEO.jsx                   # Dynamic head metadata
│   ├── context/                      # React Context providers
│   │   ├── AdminAuthContext.jsx      # Admin session & authentication
│   │   ├── ModeContext.jsx           # Developer / Recruiter mode state
│   │   └── PortfolioDataContext.jsx  # Reactive data provider
│   ├── data/                         # Verified source-of-truth default datasets
│   │   ├── achievements.js           # Hackathons, awards, recognitions
│   │   ├── certifications.js         # Cloud, Java, and dev credentials
│   │   ├── education.js              # MCA Cloud Computing, BCA
│   │   ├── experience.js             # Professional work history
│   │   ├── gallery.js                # Media and visual gallery records
│   │   ├── profile.js                # Bio, full address, contact details
│   │   ├── projects.js               # Nexora, Silent Help, full case studies
│   │   └── skills.js                 # Grouped technical proficiencies
│   ├── layouts/                      # Layout wrappers
│   │   ├── RootLayout.jsx            # Public website layout (fixed navbar)
│   │   ├── RecruiterLayout.jsx       # Recruiter portal layout (fixed navbar)
│   │   └── AdminLayout.jsx           # Admin CMS layout (fixed 100vh sidebar)
│   ├── pages/                        # Multi-page public routes
│   │   ├── HomePage.jsx              # Landing route (/ -> Normal or Recruiter)
│   │   ├── AboutPage.jsx             # Detailed technical bio & philosophy
│   │   ├── SkillsPage.jsx            # Categorized skills matrix
│   │   ├── ExperiencePage.jsx        # Full-width engineering timeline
│   │   ├── ProjectsPage.jsx          # Projects grid with category filters
│   │   ├── ProjectDetailPage.jsx     # Visual product showcase case studies
│   │   ├── EducationPage.jsx         # Academic credentials & cloud focus
│   │   ├── AchievementsPage.jsx      # Honors, hackathons & awards
│   │   ├── AchievementDetailPage.jsx # Individual achievement case study
│   │   ├── CertificationsPage.jsx    # Cloud & Java certificates with verify links
│   │   ├── GalleryPage.jsx           # Event & architectural screenshot gallery
│   │   ├── ContactPage.jsx           # Detailed contact & full Pune address
│   │   ├── ResumePage.jsx            # In-browser PDF previewer & downloader
│   │   ├── RecruiterOverviewPage.jsx # Dedicated recruiter overview route
│   │   └── NotFoundPage.jsx          # 404 handler
│   ├── pages/admin/                  # Protected Admin CMS routes
│   │   ├── AdminLoginPage.jsx        # Secure login form
│   │   ├── AdminDashboardPage.jsx    # Metrics, quick stats & recent edits
│   │   ├── AdminProfilePage.jsx      # Bio, location, address, social links
│   │   ├── AdminProjectsPage.jsx     # Project CRUD & multi-image gallery manager
│   │   ├── AdminExperiencePage.jsx   # Work history CRUD
│   │   ├── AdminEducationPage.jsx    # Academic history CRUD
│   │   ├── AdminSkillsPage.jsx       # Skills matrix manager
│   │   ├── AdminCertificationsPage.jsx # Certificate verification manager
│   │   ├── AdminAchievementsPage.jsx # Awards and honors manager
│   │   ├── AdminGalleryPage.jsx      # Visual gallery manager
│   │   ├── AdminMediaPage.jsx        # Static files & uploaded asset manager
│   │   ├── AdminResumePage.jsx       # Resume file upload & download stats
│   │   ├── AdminHomePage.jsx         # Spotlight projects & hero text config
│   │   ├── AdminRecruiterPage.jsx    # Recruiter summary & metric cards config
│   │   └── AdminSettingsPage.jsx     # Metadata, security & factory reset
│   ├── services/
│   │   └── dataService.js            # Unified data & localStorage persistence
│   ├── styles/
│   │   ├── index.css                 # Master editorial design system
│   │   └── project_detail.css        # Dedicated showcase & lightbox styles
│   ├── utils/
│   │   └── scrollUtils.js            # Precise smooth scrolling utilities
│   ├── App.jsx                       # Master route declarations
│   └── main.jsx                      # React 18 DOM mount point
├── package.json                      # Scripts and dependencies
└── vite.config.js                    # Vite dev server and build configuration
```

---

## 2. Quick Start & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) version 18.0 or newer.
- `npm` (comes bundled with Node.js).

### Installation & Launch
1. Open PowerShell or your terminal and navigate to the project directory:
   ```powershell
   cd c:\AYYAJAHMAD\Resumes\Portfolio
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the local Vite development server:
   ```powershell
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   *(Or the port displayed in your terminal)*

---

## 3. Production Build & Deployment

### Creating an Optimized Production Build
Run:
```powershell
npm run build
```
This compiles the application using Vite and generates minified, tree-shaken bundles inside the `dist/` directory:
- `dist/index.html` (~2.5 KB)
- `dist/assets/index-[hash].css` (~71 KB)
- `dist/assets/index-[hash].js` (~413 KB)

### Previewing the Production Build Locally
To test the built bundle locally under production conditions:
```powershell
npm run preview
```

---

## 4. Public Portfolio Guide

### Dual-Mode Architecture
The platform features an executive mode toggle right in the navigation bar:

1. **Portfolio Mode (Developer / Technical)**:
   - For software engineers, architects, and technical interviewers.
   - Comprehensive technical deep dives, system architecture breakdowns, categorized technology stacks, and full case study analysis.
2. **Recruiter Mode (Executive Candidate Dossier)**:
   - For technical recruiters, talent acquisition partners, and hiring managers.
   - Concise 30-second candidate summary, key engineering metrics, quick resume download buttons, featured highlights, and high-level timelines.

Toggle between modes at any time using the `Portfolio | Recruiter` pill button in the top navigation bar.

---

### Interactive Project Showcase & Lightbox
Navigate to **Projects** (`/projects`) and click any project card (e.g. `/projects/nexora`) to view the case study:

1. **Project Hero**: Displays project number, title, type, status, and direct buttons for **Live Demo ↗** and **GitHub Code ↗**.
2. **Media Showcase Carousel**:
   - Displays active high-resolution screenshots with **‹ Prev** and **Next ›** controls and an indicator count (`1 / 3`).
   - Thumbnail navigation bar below the main preview.
3. **Fullscreen Lightbox**:
   - Click anywhere on the screenshot to launch an accessible fullscreen lightbox.
   - **Keyboard Navigation**: Press `Arrow Right` (next), `Arrow Left` (previous), or `Escape` (close).
   - Click the backdrop or the `✕ Close` button to return to the page.
4. **Architectural Blueprint Fallback**:
   - If no images have been uploaded for a project, an intentional dark technical blueprint canvas renders automatically with terminal headers and system spec chips. No broken images or blank voids.
5. **Quick Snapshot Strip**: Compact strip highlighting `TYPE`, `STATUS`, `STACK`, `ROLE`, `TIMELINE`, and `STAGE`.
6. **At a Glance**: "What I Built" summary banner and 4 visual cards highlighting architecture, performance, security, and integration.
7. **Key Features**: Numbered cards (`01`, `02`, `03`...) with accent icons and concise descriptions.
8. **Grouped Technology Stack**: Divided into **Frontend**, **Backend**, **Database & Storage**, **APIs & Protocols**, and **Tools & DevOps**.
9. **Visual Flow Diagram**: Diagram mapping the request flow (`Client` &rarr; `Routing` &rarr; `Application Layer` &rarr; `Services` &rarr; `Database`).
10. **Collapsible Technical Details Accordion**:
    - **Collapsed by default** so recruiters can scan the page in 15 seconds.
    - Technical interviewers can click to expand:
      - *Problem & Core Challenge*
      - *Solution Architecture*
      - *System Architecture & Code Structure*
      - *Technical Challenges & Mitigations*
      - *Key Learnings & Takeaways*

---

### Built-In AI Assistant
The portfolio includes an AI Assistant (`AIAssistant.jsx`) accessible from the terminal chip at the bottom-right of the screen (`[AK] Ayyaj AI Assistant`).

- **Capabilities**: Pre-indexed with Ayyaj's verified background, skills, MCA education, work history, projects, certifications, and contact information.
- **Quick Prompts**: Click one-tap buttons like *"What is Ayyaj's primary tech stack?"*, *"Tell me about the Nexora project"*, or *"How can I contact Ayyaj?"*.
- **Direct Mail Action**: Includes a direct button to email Ayyaj.

---

### Resume Viewing & Download
- Navigate to `/resume`.
- Features an embedded interactive PDF viewer with fallback download links.
- Instant **Download PDF** button linking directly to `/Ayyaj Kalandar Shaikh - Resume.pdf`.

---

### Multi-Page Navigation & Smooth Scroll
- The portfolio is a structured **Multi-Page Application**. Clicking **About**, **Skills**, **Experience**, **Projects**, **Education**, **Achievements**, **Certifications**, **Gallery**, or **Contact** opens that dedicated page.
- Clicking the active link or brand logo smoothly scrolls back to the top of the current page.
- Section targets on pages use `scroll-margin-top: calc(var(--nav-height) + 20px)` so section headings never hide underneath the fixed navbar.

---

## 5. Admin CMS Manual

The platform includes a built-in content management system allowing you to update all data, upload screenshots, add projects, and manage your portfolio directly in the browser.

### Admin Access & Authentication
1. Open your browser and go to:
   ```
   http://localhost:3000/admin/login
   ```
2. Enter the administrator credentials:
   - **Username**: `ayyaj` (or configured `VITE_ADMIN_USER` in `.env`)
   - **Password**: configured in your `.env` file (`VITE_ADMIN_PASS`)
3. *(Optional)* Check **"Remember session on this device"** to persist your login across browser restarts.
4. Click **Sign In to Admin CMS**.
5. You are redirected to `/admin` (Admin Dashboard).

> **Security Note**: Set your secure private password in `.env` under `VITE_ADMIN_PASS`.

---

### Admin Layout
- **Desktop (width > 960px)**: The left sidebar is fixed at 100% viewport height. Form and table content in the main content area scrolls independently with its own scrollbar.
- **Mobile (width &le; 960px)**: The sidebar becomes an off-canvas drawer opened with the `☰` button in the sticky mobile bar. Tapping outside the drawer or selecting a menu item automatically closes the drawer.

---

### Managing Projects & Screenshot Gallery
Go to **Admin &rarr; Projects** (`/admin/projects`):

#### 1. Adding a New Project
1. Click **+ Add New Project** at the top right.
2. Fill out the project fields:
   - **Project Title**: e.g., `Nexora`
   - **URL Slug**: e.g., `nexora` (auto-generated from title if left blank; accessed at `/projects/nexora`)
   - **Project Type / Subtitle**: e.g., `Modern Full-Stack E-Commerce Platform`
   - **Development Status**: Choose `In Development`, `Completed`, or `Active Maintenance`.
   - **Categories**: Comma-separated (e.g., `Full Stack, React / JavaScript`).
   - **Stack Summary Line**: e.g., `React.js / JavaScript / REST APIs`
   - **Short Overview Description**: Concise 1–2 sentence summary.
   - **Problem & Solution (Optional)**: Deep engineering details.
   - **System Architecture & Key Learnings**: Architectural highlights.
   - **Technology Tags**: Comma-separated (e.g., `React.js, JavaScript, Spring Boot, MySQL`).
   - **Key Features**: One feature per line.
   - **GitHub Repository URL**: Link to source code.
   - **Live Demo URL**: Link to deployed preview (if available).

#### 2. Managing Primary Cover Image
Under the **Project Imagery & Showcase** box:
- **Direct URL**: Enter a path like `/audit-desktop.png` or a remote URL (`https://...`).
- **File Upload**: Click **📁 Upload Cover File** to select an image from your computer. The image is instantly read as a base64 data URI and previewed in real-time.
- **Clear Cover**: Click **Clear Cover** to revert to the intentional dark blueprint graphic.

#### 3. Managing Screenshot Gallery
The screenshot gallery allows you to showcase multiple views, dashboards, or mobile screens inside the Project Detail interactive carousel:
- **Upload Multiple Files**: Click **+ Upload Screenshots** and select one or multiple image files (PNG, JPG, WebP) from your computer. All images are added to the gallery.
- **Add by URL**: Type or paste an image URL or local path into the URL input and click **+ Add URL** (or press Enter).
- **Make Cover**: Click **Make Cover** on any gallery screenshot to set it as the project's primary card cover.
- **Remove Screenshot**: Click **✕ Remove** to delete a screenshot from the gallery.

#### 4. Featured Spotlight Toggle
Check **Featured on Homepage Spotlight & Recruiter Briefing** to display this project on the homepage spotlight and recruiter overview cards.

3. Click **Save Project**. All updates are saved instantly and live-reloaded across the public portfolio.

---

### Managing Experience Timeline
Go to **Admin &rarr; Experience** (`/admin/experience`):
- Click **+ Add Experience** or **Edit** on an existing job.
- Configure role title, organization/company name, employment type, location, start and end dates, current role checkbox, bulleted achievements (one per line), and technology tags.
- Click **Save Experience**.
- The timeline cards on `/experience` automatically display in chronological order with full container width.

---

### Managing Education Timeline
Go to **Admin &rarr; Education** (`/admin/education`):
- Click **+ Add Education** or **Edit** on an existing degree.
- Enter degree title (e.g. `Master of Computer Applications — Cloud Computing`), institution name, board/university, CGPA/percentage, duration, and key cloud/database coursework.
- Click **Save Education**.
- The timeline cards on `/education` immediately reflect the updated details.

---

### Managing Skills Matrix
Go to **Admin &rarr; Skills** (`/admin/skills`):
- Manage skills divided into categories:
  - **Backend Development**: Java, Spring Boot, Hibernate/JPA, RESTful APIs, MVC Architecture, Maven.
  - **Frontend Development**: React.js, JavaScript (ES6+), HTML5, CSS3, Bootstrap.
  - **Cloud Computing & DevOps**: Cloud Infrastructure, Virtualization, Container Concepts, Linux / Bash, Git / GitHub.
  - **Databases & Storage**: MySQL, Relational Database Design, SQL Query Optimization, JDBC.
  - **Core Computer Science**: Data Structures & Algorithms, Object-Oriented Programming, SDLC / Agile.
- Add individual skill chips with proficiency ratings.

---

### Managing Certifications
Go to **Admin &rarr; Certifications** (`/admin/certifications`):
- Add credentials from AWS, Google Cloud, Oracle/Java, Coursera, or universities.
- Set certification title, issuing organization, issue date, credential ID, and official verification URL.
- Public visitors can click **Verify Credential ↗** on `/certifications` to view your certificate online.

---

### Managing Achievements
Go to **Admin &rarr; Achievements** (`/admin/achievements`):
- Add hackathon placements, academic honors, technical competitions, and project awards.
- Set title, event/issuer, date/year, impact description, and verification links.

---

### Managing Gallery & Media Library
- **Admin &rarr; Gallery** (`/admin/gallery`): Add event photos, hackathon pictures, or presentation snapshots with titles, captions, and dates.
- **Admin &rarr; Media Library** (`/admin/media`): Centralized file registry tracking your uploaded photos, diagrams, and PDF files.

---

### Managing Profile & Contact Address
Go to **Admin &rarr; Profile** (`/admin/profile`):
- Update full name (`Ayyaj Kalandar Shaikh`), professional title, headline, and bio.
- **Exact Full Address**: Update your exact residential/work address:
  ```
  Krishna Priyanka New Building, C101, 2nd Floor, The Legend Rd, Hinjawadi, Phase 1, Pune, Maharashtra 411057, India
  ```
- **Social Profiles**: Update LinkedIn URL, GitHub profile URL, email address (`ayyaj.dev@example.com` or your real address), and phone number.

---

### Managing Recruiter Briefing
Go to **Admin &rarr; Recruiter Mode** (`/admin/recruiter`):
- Edit the candidate executive summary displayed at the top of Recruiter Mode.
- Configure metric boxes: Years of Education/Experience, Cloud Focus, Total Projects, and Primary Stack highlight.

---

### Platform Settings & Data Reset
Go to **Admin &rarr; Settings** (`/admin/settings`):
- **Site Title**: Sets the default HTML `<title>` tag for SEO.
- **Public Location**: Compact location string (e.g. `Hinjawadi, Pune, Maharashtra, India`).
- **Enable Recruiter Mode**: Toggle the recruiter mode switch on/off.
- **Availability Badge**: Toggle the green `"Available for Opportunities"` status indicator.
- **Database Reset & Defaults Restore**:
  - If you ever want to revert all changes and restore the clean verified data bundled in the source code, click **Reset to Defaults** &rarr; **Confirm Reset ⚠**.
  - All local storage modifications will be purged and verified initial data will be re-initialized.

---

## 6. Data Persistence & Storage Architecture

### How Changes are Saved
1. When you make changes through the Admin CMS, data is written to browser `localStorage` under the key:
   ```
   ayyaj_platform_data_v3
   ```
2. The `dataService` broadcasts a change event using an in-memory listener bus, updating all active tabs and public pages immediately without requiring a page reload.
3. If `localStorage` is empty (e.g., a new visitor accessing the portfolio for the first time), the platform automatically loads the verified default datasets from `src/data/*.js`.

### How to Make Changes Permanent in Source Code
Because browser `localStorage` is local to the device where you made edits, if you want your Admin CMS additions to become the **permanent defaults** for all visitors across the internet:

1. Open the corresponding file in `src/data/`:
   - Projects: `src/data/projects.js`
   - Experience: `src/data/experience.js`
   - Education: `src/data/education.js`
   - Skills: `src/data/skills.js`
   - Certifications: `src/data/certifications.js`
   - Achievements: `src/data/achievements.js`
   - Profile/Bio/Address: `src/data/profile.js`
2. Update the JavaScript array or object with your new data.
3. Commit and push your changes to GitHub:
   ```powershell
   git add .
   git commit -m "Update portfolio project and credentials"
   git push origin main
   ```
4. When deployed, every visitor receives your updated defaults worldwide!

---

## 7. Asset Management

### Updating Your Resume PDF
1. Place your updated resume file in the `public/` folder with the exact filename:
   ```
   public/Ayyaj Kalandar Shaikh - Resume.pdf
   ```
2. If your filename is different, update the filename in `src/data/profile.js`:
   ```javascript
   contact: {
     resumePdf: "Your New Resume Name.pdf",
     ...
   }
   ```
3. The `/resume` page, public download buttons, and recruiter mode download buttons will immediately link to your new resume file.

### Updating Your Profile Photo
1. Place your photo in `public/profile.jpg` (recommended resolution: 400x400 to 800x800 square JPG/WebP).
2. The homepage avatar, recruiter photo card, and admin profile preview will immediately display the new photo.

---

## 8. Production Deployment Guide

### Deploying to Vercel (Recommended)
1. Push your project to GitHub:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit of Ayyaj Developer Portfolio"
   git branch -M main
   git remote add origin https://github.com/AyyajAhmad64/ayyaj-portfolio.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will be automatically detected as **Vite**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Optional)* Under **Environment Variables**, add:
   - `VITE_ADMIN_USER`: your desired admin username
   - `VITE_ADMIN_PASS`: your desired strong password
6. Click **Deploy**.
7. In your project root, add a `vercel.json` file to support client-side routing on direct URL reloads:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

---

### Deploying to Netlify
1. Log in to [Netlify](https://www.netlify.com/) and choose **"Import from Git"**.
2. Select your repository.
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add a `public/_redirects` file with the following line to handle React Router navigation:
   ```
   /*    /index.html   200
   ```
5. Click **Deploy Site**.

---

### Deploying to GitHub Pages
1. In `vite.config.js`, set the base path to your repository name (e.g. `base: '/ayyaj-portfolio/'`).
2. Add the `gh-pages` package:
   ```powershell
   npm install --save-dev gh-pages
   ```
3. Add a deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "vite build && gh-pages -d dist"
   }
   ```
4. Run `npm run deploy`.

---

## 9. Troubleshooting & FAQ

### Q1: The Admin CMS page shows "Loading settings..." or fails to save.
- **Solution**: Ensure your browser allows `localStorage`. If you are using a strictly locked Incognito/Private window with storage disabled, localStorage operations may be blocked. Open the browser console (`F12`) to inspect any storage quota warnings.

### Q2: Direct URL navigation (e.g. `/projects/nexora` or `/admin`) returns 404 on my hosting provider.
- **Solution**: This is normal for Single Page Applications (SPAs). You must configure your host to rewrite all requests to `/index.html`:
  - For Vercel: use `vercel.json` with rewrites to `/index.html`.
  - For Netlify: use `public/_redirects` containing `/* /index.html 200`.
  - For Apache/Nginx: use `try_files $uri $uri/ /index.html;`.

### Q3: How do I change the admin password?
- **Option A (Environment Variables)**: Set `VITE_ADMIN_PASS` in `.env.local` or in your hosting provider's dashboard.
- **Option B (Source Code)**: Open `src/context/AdminAuthContext.jsx` and change line 25:
  ```javascript
  const expectedPass = import.meta.env.VITE_ADMIN_PASS || "YourNewSecurePassword";
  ```

### Q4: An uploaded image is too large and exceeds localStorage quota.
- **Solution**: Modern browsers allow 5MB to 10MB of localStorage. If uploading high-resolution 4K images, resize them to under 1920x1080 (or compress them to WebP/JPG under 500KB) before uploading, or place the file directly into the `public/` directory and reference it by path (e.g. `/screenshot1.png`).

### Q5: How do I contact Ayyaj for technical queries?
- **Email**: Reach out via the contact form on `/contact` or directly via email.
- **Address**: Krishna Priyanka New Building, C101, 2nd Floor, The Legend Rd, Hinjawadi, Phase 1, Pune, Maharashtra 411057, India.
- **GitHub**: [github.com/AyyajAhmad64](https://github.com/AyyajAhmad64)

---

*Document compiled and verified for production deployment — September 2026.*

