/**
 * JARVIS — Portfolio Knowledge & AI Intelligence Engine
 * Grounded dynamically on the central data store (dataService.js).
 * Automatically reflects every admin update to Profile, Projects, Experience,
 * Education, Skills, Certifications, Achievements, and Contact details.
 */

import { getStoreSync } from "./dataService.js";

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
  const currentRole = experience.find((e) => e.current) || experience[0] || {};

  // 1. SPECIFIC PROJECT LOOKUP (e.g. "Tell me about Nexora", "Silent Help", or newly added project)
  const matchedProject = projects.find(
    (p) =>
      q.includes((p.title || "").toLowerCase()) ||
      (p.slug && q.includes(p.slug.toLowerCase()))
  );
  if (matchedProject) {
    const techList = Array.isArray(matchedProject.technologies)
      ? matchedProject.technologies.join(", ")
      : matchedProject.stack || "Full Stack Architecture";
    const statusText = matchedProject.status || "Completed";

    return (
      `### ${matchedProject.title} (${matchedProject.type || "Software Engineering Project"})\n\n` +
      `• **Status:** ${statusText}\n` +
      `• **Primary Stack:** ${techList}\n` +
      `• **Description:** ${matchedProject.description || "N/A"}\n\n` +
      (matchedProject.problem ? `• **The Challenge:** ${matchedProject.problem}\n` : "") +
      (matchedProject.solution ? `• **Engineering Solution:** ${matchedProject.solution}\n` : "") +
      (matchedProject.github ? `• **GitHub Repository:** [${matchedProject.github}](${matchedProject.github})\n` : "") +
      (matchedProject.liveDemo ? `• **Live Application:** [${matchedProject.liveDemo}](${matchedProject.liveDemo})\n` : "") +
      `\nReview the complete technical case study on the [Project Detail Page](/projects/${matchedProject.slug}).`
    );
  }

  // 2. PROJECTS IN DEVELOPMENT
  if (q.includes("in development") || q.includes("in progress") || q.includes("current project") || q.includes("working on")) {
    const devProjects = projects.filter((p) => (p.status || "").toLowerCase().includes("development"));
    if (devProjects.length > 0) {
      const devList = devProjects.map((p) => `• **${p.title}** (${p.type}): ${p.description}`).join("\n");
      return (
        `**Projects Currently in Active Development:**\n\n${devList}\n\n` +
        `Track project milestones on the [Projects Page](/projects).`
      );
    }
  }

  // 3. ALL PROJECTS / PORTFOLIO SHOWCASE
  if (
    q.includes("project") ||
    q.includes("built") ||
    q.includes("work") ||
    q.includes("portfolio") ||
    q.includes("showcase")
  ) {
    const projectSummaries = projects
      .map((p) => `• **${p.title}** [${p.status || "Completed"}] — ${p.type}: ${p.description}`)
      .join("\n");
    return (
      `**Key Projects Engineered by Ayyaj:**\n\n${projectSummaries}\n\n` +
      `Visit the [Projects Page](/projects) for full architectural breakdowns, GitHub repos, and live demos.`
    );
  }

  // 4. CURRENT ROLE & EXPERIENCE
  if (
    q.includes("current role") ||
    q.includes("current position") ||
    q.includes("intern") ||
    q.includes("internship") ||
    q.includes("bqarlson") ||
    q.includes("experience") ||
    q.includes("work history") ||
    q.includes("job history")
  ) {
    const roleItems = experience
      .map((exp) => `• **${exp.role}** at **${exp.company}** (${exp.startDate} – ${exp.endDate})\n  ${exp.description}`)
      .join("\n\n");

    return (
      `**Professional Experience:**\n\n` +
      `Ayyaj is currently working as **${currentRole.role || "MERN Stack + AI Intern"}** at **${currentRole.company || "BQARLSON"}** (${currentRole.location || "Pune"}).\n\n` +
      `${roleItems}\n\n` +
      `View detailed responsibilities and achievements on the [Experience Page](/experience).`
    );
  }

  // 5. IDENTITY / WHO IS AYYAJ
  if (
    q.includes("who is") ||
    q.includes("about") ||
    q.includes("tell me about") ||
    q.includes("bio") ||
    q.includes("background") ||
    q.includes("summary") ||
    q.includes("introduce") ||
    q === "ayyaj" ||
    q === "ayyaj shaikh"
  ) {
    return (
      `**${profile.name || "Ayyaj Kalandar Shaikh"}**\n` +
      `*${profile.title || "Software Developer & Full Stack Engineer"}*\n\n` +
      `${profile.bio || "Software Developer and Cloud Computing post-graduate student specializing in Java, Spring Boot, React.js, and cloud backend architectures."}\n\n` +
      `• **Current Role:** ${profile.currentRole || "MERN Stack + AI Intern at BQARLSON"}\n` +
      `• **Education:** MCA in Cloud Computing from D. Y. Patil International University, Pune\n` +
      `• **Primary Backend:** Java, Spring Boot, REST APIs, Hibernate/JPA, ASP.NET Core\n` +
      `• **Primary Frontend:** React.js, JavaScript (ES6+), HTML5/CSS3\n` +
      `• **Databases:** MySQL, SQL Server, MongoDB\n` +
      `• **Cloud:** AWS Fundamentals, Cloud Architecture\n` +
      `• **Location:** Hinjawadi, Pune, Maharashtra, India\n\n` +
      `Explore the [About Page](/about) for his full professional biography.`
    );
  }

  // 6. TECHNICAL STACK & SKILLS
  if (
    q.includes("tech stack") ||
    q.includes("technologies") ||
    q.includes("stack") ||
    q.includes("skills") ||
    q.includes("programming") ||
    q.includes("languages") ||
    q.includes("frameworks") ||
    q.includes("database") ||
    q.includes("sql") ||
    q.includes("cloud") ||
    q.includes("aws")
  ) {
    return (
      `**Technical Architecture & Skills:**\n\n` +
      `• **Backend:** Java (Core & Advanced), Spring Boot, REST APIs, Hibernate / JPA, ASP.NET Core, C#\n` +
      `• **Frontend:** React.js, JavaScript (ES6+), Modern Responsive Layouts, HTML5 / CSS3\n` +
      `• **Databases:** MySQL, Microsoft SQL Server (SSMS), MongoDB, Relational Normalization\n` +
      `• **Cloud & Infrastructure:** Cloud Computing Architecture, AWS Fundamentals (EC2, S3, IAM), Git/GitHub, Maven, Postman\n` +
      `• **Methodologies:** Clean Code, Separation of Concerns, Microservices Design, System Design\n\n` +
      `See complete categorized proficiencies on the [Skills Page](/skills).`
    );
  }

  // 7. SPECIFIC SKILL CHECKS
  if (q.includes("java") || q.includes("spring")) {
    return (
      `**Java & Spring Boot Proficiency:**\n\n` +
      `Java and Spring Boot form the backbone of Ayyaj's backend engineering skillset. He develops production-ready RESTful APIs, implements JPA/Hibernate repositories, handles complex validation, relational mapping, and JWT security.`
    );
  }

  if (q.includes("react") || q.includes("frontend")) {
    return (
      `**React & Frontend Engineering:**\n\n` +
      `Ayyaj builds high-performance, responsive Single Page Applications in React.js using modern hooks, context providers, state management, modular architecture, and semantic CSS without bloated animation libraries.`
    );
  }

  // 8. EDUCATION
  if (
    q.includes("education") ||
    q.includes("college") ||
    q.includes("university") ||
    q.includes("mca") ||
    q.includes("bca") ||
    q.includes("degree") ||
    q.includes("academic") ||
    q.includes("patil")
  ) {
    const eduList = education
      .map((e) => `• **${e.degree}** — ${e.institution} (${e.year})` + (e.specialization ? `\n  Specialization: ${e.specialization}` : "") + (e.grade ? ` · Score: ${e.grade}` : ""))
      .join("\n\n");

    return (
      `**Educational Background:**\n\n` +
      `${eduList}\n\n` +
      `View complete academic achievements on the [Education Page](/education).`
    );
  }

  // 9. ADDRESS & LOCATION
  if (q.includes("address") || q.includes("where do you live") || q.includes("location") || q.includes("city") || q.includes("pune")) {
    return (
      `**Location & Work Base:**\n\n` +
      `Ayyaj is based in **Hinjawadi, Pune, Maharashtra, India**.\n\n` +
      `• **Location:** Hinjawadi, Pune, Maharashtra, India\n` +
      `• **Availability:** Available for on-site, hybrid, and remote software engineering opportunities.`
    );
  }

  // 10. RESUME / CV
  if (q.includes("resume") || q.includes("cv") || q.includes("download resume")) {
    const resumeFile = contact.resumePdf || "Ayyaj Kalandar Shaikh - Resume.pdf";
    return (
      `**Official Resume for Ayyaj Kalandar Shaikh:**\n\n` +
      `• **Interactive Document Viewer:** Visit the dedicated [/resume](/resume) page to review the formatted document.\n` +
      `• **Direct PDF Download:** [Download ${resumeFile}](/${encodeURIComponent(resumeFile)})\n` +
      (contact.resumeDrive ? `• **Google Drive Copy:** [Open in Google Drive](${contact.resumeDrive})\n` : "")
    );
  }

  // 11. AVAILABILITY & HIRING
  if (
    q.includes("available") ||
    q.includes("hire") ||
    q.includes("hiring") ||
    q.includes("job") ||
    q.includes("opportunity") ||
    q.includes("opportunities") ||
    q.includes("notice") ||
    q.includes("roles") ||
    q.includes("recruiter")
  ) {
    return (
      `**Opportunity Availability:**\n\n` +
      `Ayyaj is **actively available** for full-time Software Developer, Full Stack Engineer, Java Backend Developer, and Cloud Computing opportunities.\n\n` +
      `• **Notice Period:** Immediate / Notice-free\n` +
      `• **Location Preference:** Pune, Maharashtra, India or Remote\n` +
      `• **Target Roles:** Software Developer · Full Stack Developer · Java Backend Engineer\n\n` +
      `Hiring managers and recruiters can explore the dedicated [Recruiter Overview](/recruiter/overview) for fast candidate screening!`
    );
  }

  // 12. GITHUB & SOCIALS
  if (q.includes("github") || q.includes("code") || q.includes("repo")) {
    return (
      `Ayyaj's GitHub profile is: [${contact.github || "https://github.com/AyyajAhmad64"}](${contact.github || "https://github.com/AyyajAhmad64"}).\n\n` +
      `It contains code repositories across Java, Spring Boot, React, ASP.NET Core, and cloud architecture.`
    );
  }

  if (q.includes("linkedin")) {
    return (
      `Connect with Ayyaj on LinkedIn: [${contact.linkedin || "https://www.linkedin.com/in/ayyajahmad86"}](${contact.linkedin || "https://www.linkedin.com/in/ayyajahmad86"}).`
    );
  }

  // 13. CONTACT DETAILS
  if (q.includes("contact") || q.includes("email") || q.includes("phone") || q.includes("reach") || q.includes("message")) {
    return (
      `**Direct Contact Channels:**\n\n` +
      `• **Email:** [${contact.email}](mailto:${contact.email})\n` +
      `• **Phone / WhatsApp:** [${contact.phone}](tel:${contact.phoneRaw})\n` +
      `• **LinkedIn:** [LinkedIn Profile](${contact.linkedin})\n` +
      `• **GitHub:** [GitHub Profile](${contact.github})\n` +
      `• **Location:** ${profile.location || "Hinjawadi, Pune, Maharashtra, India"}\n\n` +
      `You can also reach out via the [Contact Page](/contact).`
    );
  }

  // 14. CERTIFICATIONS
  if (q.includes("certif") || q.includes("credential")) {
    const certs = certifications.slice(0, 3).map((c) => `• **${c.name || c.title}** (${c.issuer}, ${c.date})`).join("\n");
    return `**Verified Certifications:**\n\n${certs}\n\nSee all certificates on the [Certifications Page](/certifications).`;
  }

  // Default fallback
  return (
    `Hi! I'm **JARVIS**, Ayyaj's portfolio assistant. I have complete knowledge of Ayyaj's projects, technical stack, current internship, education, and contact details.\n\n` +
    `Try asking:\n` +
    `• "Who is Ayyaj?"\n` +
    `• "What is his current role and tech stack?"\n` +
    `• "What projects has he built?"\n` +
    `• "Where is he located?"\n` +
    `• "Does he know Java?" or "What databases does he use?"\n` +
    `• "What is his education background?"\n` +
    `• "How can I contact him or view his resume?"`
  );
}

export const quickQuestions = [
  "Who is Ayyaj?",
  "Current Role & Stack",
  "Featured Projects",
  "Does he know Java?",
  "Education (MCA)",
  "Location & Availability",
  "Contact & Resume"
];
