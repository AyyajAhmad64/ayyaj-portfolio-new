import React from "react";
import { Link } from "react-router-dom";
import { usePortfolioData } from "../context/PortfolioDataContext";
import { resolveHomeContent } from "../utils/contentDefaults";
import FeaturedSection from "./FeaturedSection";
import NextPageNavigation from "./NextPageNavigation";
import Button from "./Button";
import SEO from "./SEO";

export default function NormalHomeView() {
  const {
    profile: profileData,
    settings: siteSettings,
    skills: skillsData = []
  } = usePortfolioData();

  if (!profileData) return null;

  const homeContent = resolveHomeContent(profileData, siteSettings);

  const fullName = (profileData.name || "Ayyaj Kalandar Shaikh").trim();
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0]?.toUpperCase() || "AYYAJ";
  const lastName = nameParts.slice(1).join(" ")?.toUpperCase() || "KALANDAR SHAIKH";

  // Helper to extract top skills by category from live CMS data or sensible fallbacks
  const getCategorySkills = (catMatch, fallback) => {
    const group = skillsData.find((g) => g.category?.toUpperCase().includes(catMatch.toUpperCase()));
    if (!group || !Array.isArray(group.skills) || group.skills.length === 0) return fallback;
    const names = group.skills.map((s) => (typeof s === "string" ? s : s.name));
    return names.length > 0 ? names.slice(0, 6) : fallback;
  };

  const techSnapshot = {
    languages: getCategorySkills("LANGUAGE", ["Java", "JavaScript (ES6+)", "Python", "C++", "Node.js"]),
    frontend: getCategorySkills("FRONTEND", ["React.js", "Vite", "TailwindCSS", "HTML5 / CSS3", "Responsive UI"]),
    backendCloud: [
      ...getCategorySkills("BACKEND", ["Spring Boot", "Express.js", "REST APIs"]).slice(0, 3),
      ...getCategorySkills("CLOUD", ["Azure DevOps", "Docker", "Supabase"]).slice(0, 3)
    ],
    databasesTools: [
      ...getCategorySkills("DATABASE", ["PostgreSQL", "MongoDB", "MySQL"]).slice(0, 3),
      ...getCategorySkills("TOOL", ["Git / GitHub", "Postman", "Linux"]).slice(0, 3)
    ]
  };

  // 4 Core Capabilities
  const capabilities = [
    {
      id: "fullstack",
      icon: "⚡",
      title: "Full-Stack Web Applications",
      desc: "Architecting responsive, accessible, component-driven client applications with React.js and modern JavaScript, seamlessly integrated with performant backend services.",
      tags: ["React.js", "Vite", "TailwindCSS", "REST APIs", "Modern UI/UX"]
    },
    {
      id: "backend",
      icon: "⚙️",
      title: "Backend & API Architecture",
      desc: "Designing resilient server-side services, microservices, business logic, secure authentication (JWT), and strongly-typed RESTful endpoints with clean separation of concerns.",
      tags: ["Node.js", "Express", "Java", "Spring Boot", "REST APIs"]
    },
    {
      id: "cloud",
      icon: "☁️",
      title: "Cloud & DevOps Automation",
      desc: "Managing cloud-native workloads on Azure, containerizing microservices with Docker, and configuring automated CI/CD pipelines with GitHub Actions for reliable delivery.",
      tags: ["Azure DevOps", "Docker", "CI/CD", "GitHub Actions", "Cloud Computing"]
    },
    {
      id: "database",
      icon: "🗄️",
      title: "Database & System Design",
      desc: "Structuring normalized relational databases and high-performance document stores with explicit schema constraints, foreign keys, transaction boundaries, and query tuning.",
      tags: ["PostgreSQL", "Supabase", "MySQL", "MongoDB", "Data Modeling"]
    }
  ];

  // 9 Guided Portfolio Destinations
  const exploreCards = [
    {
      to: "/about",
      icon: "👤",
      title: "About Me",
      desc: "Engineering philosophy, background, and academic trajectory."
    },
    {
      to: "/skills",
      icon: "🛠️",
      title: "Technical Skills",
      desc: "Comprehensive competency matrix, frameworks, and proficiencies."
    },
    {
      to: "/experience",
      icon: "💼",
      title: "Work Experience",
      desc: "Chronological industry internships and hands-on contributions."
    },
    {
      to: "/projects",
      icon: "📁",
      title: "Projects Catalog",
      desc: "Complete portfolio of web platforms, architectures, and repositories."
    },
    {
      to: "/education",
      icon: "🎓",
      title: "Academic Education",
      desc: "MCA in Cloud Computing and computer science foundations."
    },
    {
      to: "/achievements",
      icon: "🏆",
      title: "Achievements",
      desc: "Recognized honors, milestones, and competitive programming."
    },
    {
      to: "/certifications",
      icon: "📜",
      title: "Certifications",
      desc: "Verified technical credentials, cloud licenses, and training."
    },
    {
      to: "/gallery",
      icon: "🖼️",
      title: "Visual Gallery",
      desc: "System diagrams, database schemas, and interface captures."
    },
    {
      to: "/contact",
      icon: "✉️",
      title: "Get in Touch",
      desc: "Direct messaging, email, phone, and professional inquiries."
    }
  ];

  return (
    <div className="home-container" aria-label="Personal Developer Platform — Home">
      <SEO
        title="Home"
        description={`${fullName} — Software Developer & Full Stack Engineer specializing in React.js, Node.js, Java, and Cloud Computing (MCA).`}
      />

      {/* ============================================================
          SECTION 1: HERO / IDENTITY (#home)
          ============================================================ */}
      <section className="hero-section" id="home" aria-label="Developer Introduction">
        <div className="hero-grid">
          {/* Hero Left: Narrative & Identity */}
          <div className="hero-identity-col">
            <div className="hero-status-pill">
              <span className="status-live-indicator" aria-hidden="true" />
              <span>{profileData.currentRole || "Open for Software Engineering Roles"}</span>
            </div>

            <h1 className="hero-title">
              <span className="hero-name-first">{firstName}</span>
              <span className="hero-name-last">{lastName}</span>
            </h1>

            <div className="hero-role-bar">
              <span className="hero-role-primary">{homeContent.heroRolePrimary}</span>
              <span className="hero-role-divider">/</span>
              <span className="hero-role-secondary">{homeContent.heroRoleSecondary}</span>
            </div>

            <div className="hero-stack-pills">
              {homeContent.heroStackPills.map((pill, pIdx) => (
                <React.Fragment key={pill}>
                  {pIdx > 0 && <span className="bullet-sep">•</span>}
                  <span>{pill}</span>
                </React.Fragment>
              ))}
            </div>

            <p className="hero-positioning">{profileData.bio}</p>

            {/* Quick CTAs */}
            <div className="hero-actions-block">
              <div className="hero-primary-btns">
                <Button to="/projects" variant="primary" size="lg">
                  View Projects →
                </Button>
                <Button to="/about" variant="secondary" size="lg">
                  About Me
                </Button>
              </div>

              <div className="hero-secondary-btns">
                <Button to="/resume" variant="outline" size="sm">
                  Resume
                </Button>
                <Button to="/contact" variant="outline" size="sm">
                  Contact Me
                </Button>
                {profileData.contact?.github && (
                  <Button
                    href={profileData.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                  >
                    GitHub ↗
                  </Button>
                )}
                {profileData.contact?.linkedin && (
                  <Button
                    href={profileData.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                  >
                    LinkedIn ↗
                  </Button>
                )}
              </div>
            </div>

            <div className="hero-meta-row">
              <span>📍 {profileData.location}</span>
              <span className="bullet-sep">•</span>
              <span>🎓 {profileData.educationDegree} ({profileData.educationSpecialization})</span>
            </div>
          </div>

          {/* Hero Right: Profile Photo Frame */}
          <div className="hero-visual-col">
            <div className="hero-frame">
              <img
                src="/profile.jpg"
                alt={profileData.name}
                width="280"
                height="320"
                decoding="async"
                fetchPriority="high"
                className="hero-image"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='320' viewBox='0 0 280 320'%3E%3Crect fill='%23111722' width='280' height='320'/%3E%3Ctext fill='%2338bdf8' font-family='monospace' font-size='48' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EAK%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="hero-frame-caption">
                <span className="caption-label">{homeContent.heroFrameCaption}</span>
                <span className="caption-val">{homeContent.heroFrameSub}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: SELECTED WORK (FEATURED SHOWCASE CMS) (#projects)
          ============================================================ */}
      <FeaturedSection
        heading={homeContent.featuredHeading}
        description={homeContent.featuredDesc}
      />

      {/* ============================================================
          SECTION 3: WHAT I DO / CORE CAPABILITIES (#capabilities)
          ============================================================ */}
      <section className="home-section" id="capabilities" aria-label="Core Capabilities">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">ENGINEERING PROFILE</span>
            <h2 className="home-section-title">What I Do</h2>
            <p className="home-section-desc">
              Specialized engineering focus across modern web architectures, resilient backend services, and scalable cloud deployments.
            </p>
          </div>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((item) => (
            <div key={item.id} className="capability-card">
              <div className="capability-card-header">
                <span className="capability-icon" aria-hidden="true">{item.icon}</span>
                <h3 className="capability-title">{item.title}</h3>
              </div>
              <p className="capability-desc">{item.desc}</p>
              <div className="capability-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="micro-tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 4: TECHNOLOGY SNAPSHOT (#tech-stack)
          ============================================================ */}
      <section className="home-section" id="tech-stack" aria-label="Technology Snapshot">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">TECHNICAL COMPETENCY</span>
            <h2 className="home-section-title">Technology Snapshot</h2>
            <p className="home-section-desc">
              A curated snapshot of languages, frameworks, databases, and DevOps tools I work with daily.
            </p>
          </div>
          <Button to="/skills" variant="outline" size="sm">
            Explore All Skills →
          </Button>
        </div>

        <div className="tech-snapshot-grid">
          <div className="tech-snapshot-card">
            <h3 className="tech-snapshot-category">Languages &amp; Runtimes</h3>
            <div className="tech-snapshot-pills">
              {techSnapshot.languages.map((skill) => (
                <span key={skill} className="skill-chip core-item">{skill}</span>
              ))}
            </div>
          </div>

          <div className="tech-snapshot-card">
            <h3 className="tech-snapshot-category">Frontend Architecture</h3>
            <div className="tech-snapshot-pills">
              {techSnapshot.frontend.map((skill) => (
                <span key={skill} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          <div className="tech-snapshot-card">
            <h3 className="tech-snapshot-category">Backend &amp; Cloud</h3>
            <div className="tech-snapshot-pills">
              {techSnapshot.backendCloud.map((skill) => (
                <span key={skill} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          <div className="tech-snapshot-card">
            <h3 className="tech-snapshot-category">Databases &amp; Tooling</h3>
            <div className="tech-snapshot-pills">
              {techSnapshot.databasesTools.map((skill) => (
                <span key={skill} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          SECTION 5: QUICK PORTFOLIO NAVIGATION (#explore)
          ============================================================ */}
      <section className="home-section" id="explore" aria-label="Explore My Portfolio">
        <div className="home-section-header">
          <div>
            <span className="section-micro-label">PORTFOLIO DIRECTORY</span>
            <h2 className="home-section-title">Explore My Portfolio</h2>
            <p className="home-section-desc">
              Jump directly to detailed sections covering my engineering work, verified credentials, and professional background.
            </p>
          </div>
        </div>

        <div className="explore-nav-grid">
          {exploreCards.map((dest) => (
            <Link key={dest.to} to={dest.to} className="explore-nav-card" aria-label={`Navigate to ${dest.title}`}>
              <div className="explore-nav-top">
                <span className="explore-nav-icon" aria-hidden="true">{dest.icon}</span>
                <span className="explore-nav-arrow" aria-hidden="true">→</span>
              </div>
              <h3 className="explore-nav-title">{dest.title}</h3>
              <p className="explore-nav-desc">{dest.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 6: FINAL CALL TO ACTION (#contact)
          ============================================================ */}
      <section className="home-cta-section" id="contact" aria-label="Call to Action">
        <div className="cta-inner-box">
          <span className="section-micro-label">INITIATE COLLABORATION</span>
          <h2 className="cta-heading">{homeContent.contactCtaHeading}</h2>
          <p className="cta-subheading">
            {homeContent.contactCtaSubheading}
          </p>

          <div className="cta-action-buttons">
            <Button to="/contact" variant="primary" size="lg">
              Contact Me
            </Button>
            <Button to="/projects" variant="secondary" size="lg">
              View Projects
            </Button>
            <Button to="/resume" variant="outline" size="lg">
              Download Resume
            </Button>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: NEXT PAGE NAVIGATION
          ============================================================ */}
      <NextPageNavigation
        next={{
          label: "About Me",
          to: "/about",
          description: "Explore my background, architectural tenets, and educational journey."
        }}
      />
    </div>
  );
}
