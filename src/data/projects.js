/**
 * Centralized Projects Data Model
 * Dynamic project architecture supporting unlimited projects, automatic category extraction,
 * featured flags for highlights, and individual detail pages (/projects/:slug).
 */

export const projectsData = [
  {
    id: "nexora",
    slug: "nexora",
    title: "Nexora",
    type: "Modern Full-Stack E-Commerce Platform",
    status: "In Development",
    featured: true,
    category: ["Full Stack", "React / JavaScript"],
    stack: "React.js / JavaScript / REST APIs",
    description: "Modern e-commerce web application focused on building a responsive shopping experience with clean architecture, product browsing, cart functionality, and authentication.",
    problem: "Modern e-commerce storefronts frequently face issues with fragmented UI states, slow page updates during cart actions, and tight coupling between the catalog UI and business validation logic.",
    solution: "Architected a modular component-driven interface with predictable state flow, decoupled catalog views, dynamic cart management, and seamless REST API integration points.",
    technologies: [
      "React.js",
      "JavaScript",
      "REST APIs",
      "Database Design",
      "CSS3",
      "HTML5"
    ],
    features: [
      "Product catalog browsing with real-time category filtering",
      "Dynamic shopping cart with item quantity adjustments and instant total calculation",
      "User authentication state handling and protected checkout routing preparation",
      "Mobile-first responsive interface tailored for seamless interaction on any device"
    ],
    architecture: "Component-driven React frontend structured into presentational components, custom container hooks for state handling, and dedicated services for asynchronous REST API communication.",
    challenges: "Handling persistent local cart updates efficiently without re-rendering unrelated product catalog components, solved through clean React state decomposition.",
    learnings: "Mastered production-style React component structuring, client-side route protection, and optimizing component re-render boundaries for e-commerce workflows.",
    github: "https://github.com/AyyajAhmad64",
    liveDemo: null
  },
  {
    id: "silent-help",
    slug: "silent-help",
    title: "Silent Help",
    type: "Community Support Platform",
    status: "Completed",
    featured: true,
    category: ["Full Stack", "Java / Spring Boot"],
    stack: "Java / Spring Boot / MySQL",
    description: "CRUD platform for posting, managing, and tracking community help requests, structured into layered Controller-Service-Repository architecture for maintainability.",
    problem: "Community assistance requests can be disorganized and lack visibility without a centralized, persistent tracker where individuals can post, update, and follow up on real needs.",
    solution: "Engineered a robust multi-tier Java backend using Spring Boot, Hibernate/JPA, and MySQL for relational persistence, paired with structured server-rendered Thymeleaf templates.",
    technologies: [
      "Java",
      "Spring Boot",
      "Hibernate / JPA",
      "MySQL",
      "Thymeleaf",
      "REST APIs",
      "Bootstrap",
      "Maven"
    ],
    features: [
      "Comprehensive CRUD operations for community help requests and status updates",
      "Strict layered Controller-Service-Repository architecture ensuring separation of concerns",
      "Relational persistence using MySQL with Hibernate ORM entity relationships and transactions",
      "Server-side validation and automated lifecycle management for help tickets"
    ],
    architecture: "Three-tier enterprise architecture: Controller layer for HTTP request validation, Service layer for business domain logic and transaction boundaries, and Repository layer interfacing with MySQL via JPA.",
    challenges: "Ensuring proper data validation and atomic transactions during concurrent request status updates, solved by utilizing Spring's transactional management.",
    learnings: "Deepened practical mastery of Spring Boot dependency injection, JPA relationship mapping (@OneToMany, @ManyToOne), and SQL schema optimization.",
    github: "https://github.com/AyyajAhmad64",
    liveDemo: null
  },
  {
    id: "bca-notes-hub",
    slug: "bca-notes-hub",
    title: "BCA Notes Hub",
    type: "Academic Resource Platform",
    status: "Completed",
    featured: true,
    category: ["Full Stack", "ASP.NET / SQL"],
    stack: "ASP.NET / SQL Server / C#",
    description: "Centralized academic portal for students to access and manage study resources and notes, backed by relational SQL Server database persistence.",
    problem: "Academic notes and subject study materials were scattered across disparate drives and messaging channels without structured semester-wise categorization.",
    solution: "Developed a centralized academic web portal in ASP.NET Core with C# and Microsoft SQL Server to organize subject materials, syllabi, and semester reference documents.",
    technologies: [
      "ASP.NET Core",
      "C#",
      "Microsoft SQL Server",
      "JavaScript",
      "Bootstrap",
      "HTML5",
      "CSS3"
    ],
    features: [
      "Centralized repository for course notes, syllabi, and past academic resources",
      "SQL Server-backed relational data management with normalized subject schemas",
      "Semester and subject-based organization enabling fast resource lookups",
      "Responsive user interface optimized for student access on both desktop and mobile"
    ],
    architecture: "ASP.NET MVC architecture with strongly-typed view models, controller endpoints, and ADO.NET / Entity Framework database queries executed against Microsoft SQL Server.",
    challenges: "Optimizing relational schema queries for quick multi-criteria retrieval across diverse academic semesters and subjects.",
    learnings: "Strengthened enterprise .NET backend development skills, C# object-oriented programming, and Microsoft SQL Server administration.",
    github: "https://github.com/AyyajAhmad64",
    liveDemo: null
  },
  {
    id: "personal-portfolio",
    slug: "personal-portfolio",
    title: "Personal Portfolio",
    type: "Responsive Web Application",
    status: "Completed",
    featured: false,
    category: ["Full Stack", "React / JavaScript"],
    stack: "React.js / JavaScript / Bootstrap",
    description: "Responsive developer portfolio web application built in React.js with modular components for project showcase, profile sections, and clean navigation.",
    problem: "Developers need an accessible, professional digital presence that clearly presents skillsets, academic credentials, and project work across all form factors.",
    solution: "Built a modular single-page portfolio application with structured component hierarchy, accessible navigation anchors, and responsive CSS layouts.",
    technologies: [
      "React.js",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Bootstrap",
      "Git"
    ],
    features: [
      "Modular project and developer profile showcase components",
      "Fluid responsive layout tested across desktop, tablet, and mobile displays",
      "Direct contact integration with one-click clipboard copy utility",
      "Structured developer skill matrix and educational roadmap"
    ],
    architecture: "Modular React architecture featuring decoupled UI components, centralized content configuration arrays, and responsive grid layouts.",
    challenges: "Maintaining crisp visual balance, clean typography, and zero horizontal overflow across extreme screen widths down to 360px.",
    learnings: "Strengthened core understanding of frontend architecture, component reusability, and CSS layout performance without heavy animation libraries.",
    github: "https://github.com/AyyajAhmad64",
    liveDemo: null
  }
];

/**
 * Returns project by its unique slug
 */
export function getProjectBySlug(slug) {
  return projectsData.find((p) => p.slug === slug);
}

/**
 * Returns only projects flagged as featured
 */
export function getFeaturedProjects() {
  return projectsData.filter((p) => p.featured);
}

/**
 * Automatically extracts unique categories from project data
 */
export function getProjectCategories() {
  const set = new Set();
  projectsData.forEach((p) => {
    if (Array.isArray(p.category)) {
      p.category.forEach((c) => set.add(c));
    }
  });
  return ["All", ...Array.from(set)];
}
