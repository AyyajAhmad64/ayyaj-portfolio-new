/**
 * JARVIS — Portfolio Knowledge & AI Intelligence Engine
 * Grounded dynamically on the central data store (PortfolioDataContext / Supabase).
 * Automatically reflects every admin update to Profile, Projects, Experience,
 * Education, Skills, Certifications, Achievements, and Contact details.
 */

import { getStoreSync } from "./dataService.js";
import { resolveAboutContent } from "../utils/contentDefaults.js";

/**
 * Primary interface for querying JARVIS.
 * Prepared to delegate to an external REST endpoint (e.g. POST /api/chat)
 * or execute local rule-based knowledge retrieval grounded in the central store.
 */
export async function queryJARVIS(prompt, history = [], customStore = null) {
  const cleanPrompt = (prompt || "").trim().toLowerCase();
  const store = customStore || getStoreSync();

  // If a remote AI API is configured via environment variable, delegate to it:
  const remoteEndpoint = typeof import.meta !== "undefined" ? import.meta.env?.VITE_AI_CHAT_ENDPOINT : undefined;
  if (remoteEndpoint) {
    try {
      // Safe sanitized portfolio snapshot without private address lines
      const safeStore = {
        ...store,
        profile: {
          ...store.profile,
          fullAddress: "Hinjawadi, Pune, Maharashtra, India",
          addressLines: ["Hinjawadi, Pune, Maharashtra, India"]
        }
      };

      const res = await fetch(remoteEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: cleanPrompt,
          history,
          portfolioData: safeStore,
          assistantName: "JARVIS",
          systemInstruction:
            "You are JARVIS, the factual portfolio assistant for Ayyaj Kalandar Shaikh. " +
            "Answer strictly using the provided portfolio data. Never invent, exaggerate, or assume unverified credentials, " +
            "companies, or projects. Location is Hinjawadi, Pune, Maharashtra, India. Never reveal private residential premises."
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) return data.reply;
      }
    } catch (err) {
      console.warn("External AI endpoint unreachable, using local knowledge engine:", err);
    }
  }

  // Local knowledge engine grounded in real portfolio data
  return resolveLocalKnowledge(cleanPrompt, store);
}

// Backwards compatibility alias
export const queryAIAssistant = queryJARVIS;

function resolveLocalKnowledge(q, store) {
  const profile = store?.profile || {};
  const contact = profile.contact || {};
  const experience = store?.experience || [];
  const projects = store?.projects || [];
  const education = store?.education || [];
  const skills = store?.skills || [];
  const certifications = store?.certifications || [];
  const achievements = store?.achievements || [];
  const about = resolveAboutContent(profile);

  // 1. SPECIFIC PROJECT LOOKUP (e.g. "Tell me about Nexora", "Silent Help", or newly added project)
  const matchedProject = projects.find(
    (p) =>
      (p.title && q.includes(p.title.toLowerCase())) ||
      (p.slug && q.includes(p.slug.toLowerCase()))
  );
  if (matchedProject) {
    const techList = Array.isArray(matchedProject.technologies)
      ? matchedProject.technologies.join(", ")
      : (Array.isArray(matchedProject.techStack) ? matchedProject.techStack.join(", ") : matchedProject.stack || "Full Stack Architecture");
    const statusText = matchedProject.status || "Completed";

    return (
      `### ${matchedProject.title} (${matchedProject.type || "Software Engineering Project"})\n\n` +
      `• **Status:** ${statusText}\n` +
      `• **Primary Stack:** ${techList}\n` +
      `• **Description:** ${matchedProject.description || matchedProject.shortDescription || matchedProject.fullDescription || "N/A"}\n\n` +
      (matchedProject.problem ? `• **The Challenge:** ${matchedProject.problem}\n` : "") +
      (matchedProject.solution ? `• **Engineering Solution:** ${matchedProject.solution}\n` : "") +
      (matchedProject.architecture ? `• **Architecture:** ${matchedProject.architecture}\n` : "") +
      (matchedProject.github || matchedProject.githubUrl ? `• **GitHub Repository:** [${matchedProject.github || matchedProject.githubUrl}](${matchedProject.github || matchedProject.githubUrl})\n` : "") +
      (matchedProject.liveDemo || matchedProject.liveUrl ? `• **Live Application:** [${matchedProject.liveDemo || matchedProject.liveUrl}](${matchedProject.liveDemo || matchedProject.liveUrl})\n` : "") +
      `\nReview the complete technical case study on the [Project Detail Page](/projects/${matchedProject.slug}).`
    );
  }

  // 2. EXPERIENCE / WORK HISTORY / EMPLOYMENT / INTERNSHIPS
  // CRITICAL INTENT ROUTING FIX: Must be checked BEFORE general "project" or "work" checks!
  // Resolves queries like "What is Ayyaj's work experience?", "Tell me about his employment", "Where did he work?"
  const isExperienceQuery =
    q.includes("work experience") ||
    q.includes("working experience") ||
    q.includes("employment") ||
    q.includes("job history") ||
    q.includes("work history") ||
    q.includes("career experience") ||
    q.includes("professional experience") ||
    q.includes("companies worked") ||
    q.includes("company worked") ||
    q.includes("where did he work") ||
    q.includes("where has he worked") ||
    q.includes("where does he work") ||
    q.includes("internship") ||
    q.includes("internships") ||
    q.includes("bqarlson") ||
    (q.includes("experience") && !q.includes("education")) ||
    (q.includes("job") && !q.includes("project")) ||
    q.includes("roles held") ||
    q.includes("past roles");

  if (isExperienceQuery) {
    if (experience.length === 0) {
      return "Ayyaj's work experience records are currently being fetched from the cloud CMS. Please check the [Experience Page](/experience).";
    }

    const currentExp = experience.find((e) => e.current) || experience[0];
    const roleItems = experience
      .map((exp) => {
        const techStr = Array.isArray(exp.technologies) && exp.technologies.length > 0
          ? `\n  *Technologies:* ${exp.technologies.join(", ")}`
          : "";
        return `• **${exp.role}** at **${exp.company}** (${exp.startDate || ""} – ${exp.endDate || "Present"})\n  ${exp.description || ""}${techStr}`;
      })
      .join("\n\n");

    return (
      `**Professional Work Experience:**\n\n` +
      `Ayyaj is currently working as **${currentExp?.role || "MERN Stack + AI Intern"}** at **${currentExp?.company || "BQARLSON Software Pvt. Ltd."}** (${currentExp?.location || "Pune"}).\n\n` +
      `${roleItems}\n\n` +
      `View detailed responsibilities and achievements on the [Experience Page](/experience).`
    );
  }

  // 3. PROJECTS / PORTFOLIO / APPLICATIONS BUILT
  const isProjectQuery =
    q.includes("project") ||
    q.includes("applications built") ||
    q.includes("what did he build") ||
    q.includes("apps built") ||
    q.includes("software built") ||
    q.includes("portfolio showcase") ||
    q.includes("built");

  if (isProjectQuery) {
    // Projects in active development
    if (q.includes("in development") || q.includes("in progress") || q.includes("active development")) {
      const devProjects = projects.filter((p) => (p.status || "").toLowerCase().includes("development"));
      if (devProjects.length > 0) {
        const devList = devProjects.map((p) => `• **${p.title}** (${p.type || "Software"}): ${p.description || p.shortDescription || ""}`).join("\n");
        return `**Projects Currently in Active Development:**\n\n${devList}\n\nTrack project milestones on the [Projects Page](/projects).`;
      }
    }

    if (projects.length === 0) {
      return "No projects are currently listed in the cloud database. Visit the [Projects Page](/projects) for updates.";
    }

    const projectSummaries = projects
      .map((p) => `• **${p.title}** [${p.status || "Completed"}] — ${p.type || "Web App"}: ${p.description || p.shortDescription || "Software engineering project."}`)
      .join("\n");

    return (
      `**Key Projects Engineered by Ayyaj:**\n\n${projectSummaries}\n\n` +
      `Visit the [Projects Page](/projects) for full architectural breakdowns, GitHub repositories, and live demos.`
    );
  }

  // 4. PROFESSIONAL OVERVIEW / ABOUT NARRATIVE
  const isOverviewQuery =
    q.includes("professional overview") ||
    q.includes("overview") ||
    q.includes("architectural focus") ||
    q.includes("development philosophy") ||
    q.includes("career direction") ||
    q.includes("current focus");

  if (isOverviewQuery) {
    const overviewText = Array.isArray(about.professionalOverview) 
      ? about.professionalOverview.join("\n\n") 
      : (about.professionalOverview || profile.bio || "Software Developer focusing on Java, Spring Boot, React, and Cloud Computing.");

    return (
      `**Professional Overview:**\n\n` +
      `${overviewText}\n\n` +
      `• **Current Focus:** ${profile?.snapshot?.primaryFocus || "Java Backend & Cloud Computing"}\n` +
      `• **Career Direction:** ${about.careerDirection}\n\n` +
      `Explore the [About Page](/about) for his full background, architecture tenets, and engineering principles.`
    );
  }

  // 5. EDUCATION / DEGREE / MCA / BCA
  const isEducationQuery =
    q.includes("education") ||
    q.includes("degree") ||
    q.includes("mca") ||
    q.includes("bca") ||
    q.includes("college") ||
    q.includes("university") ||
    q.includes("academic") ||
    q.includes("patil") ||
    q.includes("sangameshwar") ||
    q.includes("studies") ||
    q.includes("qualification");

  if (isEducationQuery) {
    if (education.length === 0) {
      return "Education information is currently being fetched from the cloud CMS. Visit the [Education Page](/education).";
    }

    const eduList = education
      .map((e) => `• **${e.degree}** — ${e.institution} (${e.year || ""})` + 
        (e.specialization ? `\n  *Specialization:* ${e.specialization}` : "") + 
        (e.description ? `\n  ${e.description}` : ""))
      .join("\n\n");

    return (
      `**Educational Background:**\n\n` +
      `${eduList}\n\n` +
      `View verified academic credentials on the [Education Page](/education).`
    );
  }

  // 6. SKILLS / TECHNOLOGIES / TECH STACK / LANGUAGES
  const isSkillsQuery =
    q.includes("skills") ||
    q.includes("skill") ||
    q.includes("technologies") ||
    q.includes("tech stack") ||
    q.includes("stack") ||
    q.includes("programming languages") ||
    q.includes("programming language") ||
    q.includes("languages") ||
    q.includes("frameworks") ||
    q.includes("database") ||
    q.includes("databases") ||
    q.includes("sql") ||
    q.includes("cloud") ||
    q.includes("aws") ||
    q.includes("java") ||
    q.includes("spring") ||
    q.includes("react");

  if (isSkillsQuery) {
    if (q.includes("java") || q.includes("spring")) {
      return `**Java & Spring Boot Proficiency:**\n\nJava and Spring Boot form the backbone of Ayyaj's backend engineering skillset. He develops production-ready RESTful APIs, implements JPA/Hibernate repositories, handles complex validation, relational mapping, and JWT security.`;
    }
    if (q.includes("react")) {
      return `**React & Frontend Engineering:**\n\nAyyaj builds responsive Single Page Applications in React.js using modern hooks, context providers, state management, modular architecture, and semantic CSS without bloated animation libraries.`;
    }

    if (skills.length > 0) {
      const grouped = skills.map((g) => {
        const items = Array.isArray(g.skills) ? g.skills.map((s) => s.name || s).join(", ") : "";
        return `• **${g.category || "General"}:** ${items}`;
      }).join("\n");

      return `**Technical Skills & Competencies:**\n\n${grouped}\n\nReview complete categorized proficiencies on the [Skills Page](/skills).`;
    }

    return (
      `**Technical Architecture & Skills:**\n\n` +
      `• **Backend:** Java, Spring Boot, REST APIs, Hibernate / JPA, ASP.NET Core\n` +
      `• **Frontend:** React.js, JavaScript (ES6+), Modern Responsive Layouts, HTML5 / CSS3\n` +
      `• **Databases:** MySQL, Microsoft SQL Server, MongoDB\n` +
      `• **Cloud & Infrastructure:** Cloud Computing, AWS Fundamentals, Git/GitHub, Maven, Postman\n\n` +
      `See complete categorized proficiencies on the [Skills Page](/skills).`
    );
  }

  // 7. CERTIFICATIONS / CREDENTIALS
  const isCertQuery =
    q.includes("certification") ||
    q.includes("certifications") ||
    q.includes("certificate") ||
    q.includes("certificates") ||
    q.includes("credential") ||
    q.includes("credentials") ||
    q.includes("license");

  if (isCertQuery) {
    if (certifications.length > 0) {
      const certList = certifications.slice(0, 5).map((c) => `• **${c.name || c.title}** (${c.issuer} · ${c.date || ""})`).join("\n");
      return `**Verified Certifications:**\n\n${certList}\n\nSee all certificates on the [Certifications Page](/certifications).`;
    }
    return "Certification information is available on the [Certifications Page](/certifications).";
  }

  // 8. ACHIEVEMENTS / AWARDS / ACCOMPLISHMENTS
  const isAchievementQuery =
    q.includes("achievement") ||
    q.includes("achievements") ||
    q.includes("award") ||
    q.includes("awards") ||
    q.includes("accomplishment") ||
    q.includes("accomplishments") ||
    q.includes("milestone") ||
    q.includes("milestones");

  if (isAchievementQuery) {
    if (achievements.length > 0) {
      const achList = achievements.slice(0, 5).map((a) => `• **${a.title}** (${a.organization || ""} · ${a.date || ""}): ${a.description || ""}`).join("\n");
      return `**Key Milestones & Achievements:**\n\n${achList}\n\nRead detailed achievement case studies on the [Achievements Page](/achievements).`;
    }
    return "Achievement information is available on the [Achievements Page](/achievements).";
  }

  // 9. IDENTITY / WHO IS AYYAJ
  if (
    q.includes("who is") ||
    q.includes("about ayyaj") ||
    q.includes("tell me about ayyaj") ||
    q.includes("bio") ||
    q.includes("background") ||
    q.includes("introduce") ||
    q === "ayyaj" ||
    q === "ayyaj shaikh"
  ) {
    return (
      `**${profile.name || "Ayyaj Kalandar Shaikh"}**\n` +
      `*${profile.title || "Software Developer & Full Stack Engineer"}*\n\n` +
      `${profile.bio || "Software Developer and Cloud Computing post-graduate student specializing in Java, Spring Boot, React.js, and cloud backend architectures."}\n\n` +
      `• **Current Role:** ${profile.currentRole || "MERN Stack + AI Intern"}\n` +
      `• **Education:** ${profile.educationDegree || "MCA in Cloud Computing"} (${profile.educationInstitution || "Pune"})\n` +
      `• **Location:** ${profile.location || "Hinjawadi, Pune, Maharashtra, India"}\n` +
      `• **Availability:** ${profile.availability || "Available for Opportunities"}\n\n` +
      `Explore the [About Page](/about) for his full professional biography.`
    );
  }

  // 10. RESUME / CV
  if (q.includes("resume") || q.includes("cv") || q.includes("download resume")) {
    const resumeFile = contact.resumePdf || "Ayyaj Kalandar Shaikh - Resume.pdf";
    const resumeUrl = resumeFile.startsWith("http")
      ? resumeFile
      : (resumeFile.startsWith("/") ? resumeFile : `/${encodeURIComponent(resumeFile)}`);
    return (
      `**Official Resume for ${profile.name || "Ayyaj Kalandar Shaikh"}:**\n\n` +
      `• **Interactive Document Viewer:** Visit the dedicated [/resume](/resume) page to review the formatted document.\n` +
      `• **Direct PDF Download:** [Download PDF](${resumeUrl})\n` +
      (contact.resumeDrive ? `• **Google Drive Copy:** [Open in Google Drive](${contact.resumeDrive})\n` : "")
    );
  }

  // 11. LOCATION & BASE (Strictly public base only)
  if (q.includes("address") || q.includes("where do you live") || q.includes("location") || q.includes("city") || q.includes("pune")) {
    return (
      `**Location & Work Base:**\n\n` +
      `Ayyaj is based in **${profile.location || "Hinjawadi, Pune, Maharashtra, India"}**.\n\n` +
      `• **Public Base:** ${profile.location || "Hinjawadi, Pune, Maharashtra, India"}\n` +
      `• **Availability:** Available for on-site, hybrid, and remote software engineering opportunities.`
    );
  }

  // 12. CONTACT DETAILS / SOCIALS
  if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("reach") || q.includes("message") || q.includes("linkedin") || q.includes("github") || q.includes("whatsapp")) {
    return (
      `**Direct Contact Channels:**\n\n` +
      `• **Email:** [${contact.email || "ayyajahmad64@gmail.com"}](mailto:${contact.email || "ayyajahmad64@gmail.com"})\n` +
      `• **Phone / WhatsApp:** [${contact.phone || "+91 84324 85204"}](tel:${contact.phoneRaw || "+918432485204"})\n` +
      `• **LinkedIn:** [LinkedIn Profile](${contact.linkedin || "https://www.linkedin.com/in/ayyajahmad86"})\n` +
      `• **GitHub:** [GitHub Profile](${contact.github || "https://github.com/AyyajAhmad64"})\n` +
      `• **Location:** ${profile.location || "Hinjawadi, Pune, Maharashtra, India"}\n\n` +
      `You can also reach out via the [Contact Page](/contact).`
    );
  }

  // Default fallback
  return (
    `Hi! I'm **JARVIS**, Ayyaj's portfolio assistant. I have complete knowledge of Ayyaj's work experience, projects, technical stack, education, and credentials.\n\n` +
    `Try asking:\n` +
    `• "What is Ayyaj's work experience?"\n` +
    `• "What is his professional overview?"\n` +
    `• "What projects has he built?" or "Tell me about Nexora"\n` +
    `• "What is his education background?"\n` +
    `• "What is his technical stack?" or "Does he know Java?"\n` +
    `• "Where is he located?"\n` +
    `• "How can I contact him or download his resume?"`
  );
}

export const quickQuestions = [
  "Work Experience",
  "Professional Overview",
  "Featured Projects",
  "Does he know Java?",
  "Education (MCA)",
  "Location & Availability",
  "Contact & Resume"
];
