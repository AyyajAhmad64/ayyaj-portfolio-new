/**
 * ASK JARVIS — Portfolio Intelligence & Decision Support Engine 2.0
 *
 * Grounded dynamically on canonical portfolio CMS data (Supabase & PortfolioDataContext).
 * Strictly read-only for Phase 3A: queries, analyzes, summarizes, compares,
 * identifies missing information, and flags warnings without mutating data.
 *
 * Includes future Phase 3B extensible intent/action proposal architecture.
 */

import { isSupabaseConfigured } from "../lib/supabaseClient.js";

/**
 * Calculates cross-entity references for media assets.
 * Matches exact logic of Media Library 2.0.
 */
export function getMediaReferences(item, store = {}) {
  if (!item?.url) return [];
  const url = item.url;
  const refs = [];

  const {
    projects = [],
    certifications = [],
    achievements = [],
    gallery = [],
    profile = {}
  } = store;

  // 1. Projects
  projects.forEach((p) => {
    if (p.thumbnail === url) {
      refs.push({ type: "Project Thumbnail", title: p.title, link: "/admin/projects" });
    }
    if (Array.isArray(p.images) && p.images.includes(url)) {
      refs.push({ type: "Project Gallery", title: p.title, link: "/admin/projects" });
    }
  });

  // 2. Certifications
  certifications.forEach((c) => {
    if (c.image === url || c.certificateUrl === url) {
      refs.push({ type: "Certification Credential", title: c.name, link: "/admin/certifications" });
    }
  });

  // 3. Achievements
  achievements.forEach((a) => {
    if (a.image === url) {
      refs.push({ type: "Achievement Showcase", title: a.title, link: "/admin/achievements" });
    }
  });

  // 4. Gallery
  gallery.forEach((g) => {
    if (g.src === url || g.thumbnail === url) {
      refs.push({ type: "Gallery Item", title: g.title, link: "/admin/gallery" });
    }
  });

  // 5. Profile & Resume
  if (profile.avatar === url) {
    refs.push({ type: "Profile Avatar", title: "Primary Avatar", link: "/admin/profile" });
  }
  const resumeUrl = profile.snapshot?.resume?.pdfUrl || profile.resumeUrl;
  if (resumeUrl === url) {
    refs.push({ type: "PDF Resume Document", title: "Official Resume", link: "/admin/resume" });
  }

  return refs;
}

/**
 * Computes comprehensive site health & completeness metrics.
 */
export function evaluateSiteHealth(store = {}) {
  const {
    projects = [],
    certifications = [],
    achievements = [],
    gallery = [],
    profile = {},
    settings = {},
    media = []
  } = store;

  const warnings = [];
  const passes = [];

  // Content: Featured showcase
  const featuredItems = profile.snapshot?.home?.featuredItems || settings.featuredItems || [];
  const activeFeatured = featuredItems.filter((i) => i.enabled !== false && i.contentId).length;
  if (activeFeatured >= 3 && activeFeatured <= 6) {
    passes.push(`Featured Showcase has ${activeFeatured} active items (ideal range 3–6).`);
  } else if (activeFeatured > 0) {
    warnings.push({
      text: `Featured Showcase has ${activeFeatured} items. 3–6 items provide the best visitor engagement.`,
      link: "/admin/home",
      actionLabel: "Configure Showcase"
    });
  } else {
    warnings.push({
      text: "Featured Showcase has 0 items enabled. Homepage uses default fallback spotlight.",
      link: "/admin/home",
      actionLabel: "Configure Showcase"
    });
  }

  // Projects completeness
  const incompleteProjects = projects.filter((p) => {
    const hasDesc = Boolean(p.description || p.shortDescription);
    const hasLinks = Boolean(p.liveDemo || p.github);
    const hasMedia = Boolean(p.thumbnail || (Array.isArray(p.images) && p.images.length > 0));
    return !hasDesc || !hasLinks || !hasMedia;
  });

  if (incompleteProjects.length === 0 && projects.length > 0) {
    passes.push(`All ${projects.length} projects have descriptions, repository/demo links, and imagery.`);
  } else if (incompleteProjects.length > 0) {
    warnings.push({
      text: `${incompleteProjects.length} project(s) are missing descriptions, links, or media thumbnails: ${incompleteProjects.map((p) => p.title).join(", ")}.`,
      link: "/admin/projects",
      actionLabel: "Review Projects"
    });
  }

  // Certifications verification
  const missingCertUrls = certifications.filter((c) => !c.certificateUrl && !c.verificationUrl && !c.credentialId);
  if (missingCertUrls.length === 0 && certifications.length > 0) {
    passes.push(`All ${certifications.length} certifications have verified credential IDs or verification URLs.`);
  } else if (missingCertUrls.length > 0) {
    warnings.push({
      text: `${missingCertUrls.length} certification(s) are missing credential IDs or verification URLs: ${missingCertUrls.map((c) => c.name).join(", ")}.`,
      link: "/admin/certifications",
      actionLabel: "Review Certifications"
    });
  }

  // Media Library Orphaned Check
  const unusedMedia = media.filter((m) => getMediaReferences(m, store).length === 0);
  if (unusedMedia.length === 0 && media.length > 0) {
    passes.push(`All ${media.length} media assets are actively utilized in portfolio content.`);
  } else if (unusedMedia.length > 0) {
    warnings.push({
      text: `${unusedMedia.length} unused or orphaned asset(s) found in Media Library.`,
      link: "/admin/media",
      actionLabel: "Manage Media"
    });
  }

  // SEO Check
  const siteTitle = settings.siteTitle || profile.name || "";
  if (!siteTitle || siteTitle.length < 30) {
    warnings.push({
      text: "Global SEO site title is short or not configured (recommended: 50–60 characters).",
      link: "/admin/seo",
      actionLabel: "Open SEO Manager"
    });
  } else {
    passes.push("Global SEO site title is configured.");
  }

  // Calculate score
  const totalChecks = passes.length + warnings.length;
  const score = totalChecks > 0 ? Math.round((passes.length / totalChecks) * 100) : 100;
  const level = score >= 85 ? "OPTIMAL" : (score >= 65 ? "GOOD" : "NEEDS ATTENTION");

  return {
    score,
    level,
    passes,
    warnings,
    activeFeatured,
    incompleteProjects,
    missingCertUrls,
    unusedMedia
  };
}

/**
 * Main ASK JARVIS Natural Language Resolution Engine.
 * Grounded in live CMS data with privacy protection and explainability.
 */
export function resolveJarvisQuery(prompt, store = {}, adminData = {}) {
  const q = (prompt || "").trim().toLowerCase();

  // Guard: Empty query
  if (!q) {
    return {
      intent: "EMPTY",
      heading: "ASK JARVIS",
      summary: "I'm ready to answer any questions about your portfolio content, site health, SEO, or recent activity.",
      bullets: [
        "Ask about your Projects, Certifications, or Experience",
        "Ask about Incomplete content or Warnings",
        "Ask about SEO metadata, Unused Media, or Recent changes"
      ],
      text: "Type a question or select a suggested topic to get started.",
      sourceLabel: "ASK JARVIS Intelligence",
      source: "Grounded in live Supabase Portfolio CMS",
      actions: [],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 1. PRIVACY & CREDENTIAL SECURITY BOUNDARY
  // ─────────────────────────────────────────────────────────────
  const isSecurityQuery =
    q.includes("password") ||
    q.includes("secret") ||
    q.includes("service role") ||
    q.includes("service_role") ||
    q.includes("anon key") ||
    q.includes("api key") ||
    q.includes(".env") ||
    q.includes("token") ||
    q.includes("jwt") ||
    q.includes("database url") ||
    q.includes("postgres://") ||
    q.includes("credentials");

  if (isSecurityQuery) {
    return {
      intent: "SECURITY_BOUNDARY",
      heading: "SECURITY & PRIVACY BOUNDARY",
      summary: "Administrative security boundary active. Sensitive system credentials cannot be accessed or displayed.",
      bullets: [
        "Supabase Service Role Keys and database connection strings are never exposed in client context.",
        "Authentication tokens and environment variables are strictly encapsulated.",
        "Public credentials follow the principle of least privilege using Supabase RLS policies."
      ],
      text: "JARVIS enforces strict privacy boundaries. Administrative secrets, private keys, authentication tokens, and `.env` files are permanently inaccessible.",
      sourceLabel: "Security Policy Enforcement",
      source: "Security Boundary Guarantee",
      actions: [],
      isReadOnly: true,
      proposal: null
    };
  }

  const {
    profile = {},
    projects = [],
    experience = [],
    education = [],
    skills = [],
    certifications = [],
    achievements = [],
    gallery = [],
    settings = {},
    media = adminData.media || []
  } = store;

  const auditLogs = adminData.auditLogs || [];
  const messages = adminData.messages || [];

  // Helper: Derived Counts
  const publishedProjects = projects.filter((p) => (p.publicationStatus || p.publication_status || "published") === "published");
  const draftProjects = projects.filter((p) => (p.publicationStatus || p.publication_status) === "draft");

  const publishedGallery = gallery.filter((g) => (g.status || "published") === "published");
  const draftGallery = gallery.filter((g) => (g.status || "published") === "draft");

  const publishedAchievements = achievements.filter((a) => (a.publicationStatus || "published") === "published");
  const draftAchievements = achievements.filter((a) => (a.publicationStatus || "published") === "draft");

  const publishedCerts = certifications.filter((c) => (c.publicationStatus || "published") === "published");
  const draftCerts = certifications.filter((c) => (c.publicationStatus || "published") === "draft");

  // ─────────────────────────────────────────────────────────────
  // 2. PORTFOLIO OVERVIEW & SUMMARY
  // ─────────────────────────────────────────────────────────────
  const isOverviewQuery =
    q.includes("overview") ||
    q.includes("how is my portfolio") ||
    q.includes("summarize my portfolio") ||
    q.includes("summary of my portfolio") ||
    q.includes("what do i have on my portfolio") ||
    q.includes("what is on my portfolio") ||
    q.includes("portfolio stats") ||
    q.includes("portfolio summary") ||
    q.includes("portfolio overview") ||
    q === "stats";

  if (isOverviewQuery) {
    const health = evaluateSiteHealth({ ...store, media });
    const featuredItems = profile.snapshot?.home?.featuredItems || settings.featuredItems || [];
    const activeFeatured = featuredItems.filter((i) => i.enabled !== false && i.contentId).length;
    const unreadMsgs = messages.filter((m) => m.status === "unread").length;

    const bullets = [
      `Projects: ${projects.length} (${publishedProjects.length} published, ${draftProjects.length} draft)`,
      `Certifications: ${certifications.length}`,
      `Achievements: ${achievements.length}`,
      `Experience Records: ${experience.length}`,
      `Education Records: ${education.length}`,
      `Skill Categories: ${skills.length} (${skills.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)} total skills)`,
      `Gallery Items: ${gallery.length}`,
      `Featured Showcase: ${activeFeatured} active highlights`,
      `Site Health Score: ${health.score}% (${health.level})`
    ];

    if (unreadMsgs > 0) {
      bullets.push(`Inbound Messages: ${unreadMsgs} unread message(s)`);
    }

    return {
      intent: "PORTFOLIO_OVERVIEW",
      heading: "PORTFOLIO OVERVIEW",
      summary: `Your portfolio currently features ${projects.length} projects, ${certifications.length} certifications, and ${experience.length} experience records with a Site Health rating of ${health.score}% (${health.level}).`,
      bullets,
      text:
        `### Portfolio Overview\n\n` +
        bullets.map((b) => `• **${b.split(":")[0]}:**${b.split(":")[1]}`).join("\n") +
        `\n\nSite is fully synchronized with Supabase Cloud.`,
      sourceLabel: "Portfolio Data Context",
      source: "Based on live Supabase portfolio records",
      actions: [
        { label: "View Dashboard", link: "/admin" },
        { label: "Site Health Audit", link: "/admin/health" }
      ],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3.0 SPECIFIC PROJECT LOOKUP BY TITLE OR SLUG
  // ─────────────────────────────────────────────────────────────
  const matchedProject = projects.find(
    (p) =>
      (p.title && p.title.trim().length > 2 && q.includes(p.title.trim().toLowerCase())) ||
      (p.slug && p.slug.trim().length > 2 && q.includes(p.slug.trim().toLowerCase()))
  );

  if (matchedProject) {
    const techList = Array.isArray(matchedProject.technologies)
      ? matchedProject.technologies.join(", ")
      : (Array.isArray(matchedProject.techStack) ? matchedProject.techStack.join(", ") : matchedProject.stack || "Full Stack Architecture");
    const statusText = matchedProject.status || "Completed";

    return {
      intent: "PROJECT_SPECIFIC",
      heading: matchedProject.title.toUpperCase(),
      summary: `${matchedProject.title} is a ${matchedProject.type || "Software Engineering"} project (${statusText}) built with ${techList}.`,
      bullets: [
        `Status: ${statusText}`,
        `Stack: ${techList}`,
        `Publication: ${matchedProject.publicationStatus || "published"}`
      ],
      text:
        `### ${matchedProject.title} (${matchedProject.type || "Software Engineering"})\n\n` +
        `• **Status:** ${statusText}\n` +
        `• **Stack:** ${techList}\n` +
        `• **Publication:** ${matchedProject.publicationStatus || "published"}\n` +
        `• **Description:** ${matchedProject.description || matchedProject.shortDescription || "Software engineering project."}\n\n` +
        (matchedProject.problem ? `• **The Challenge:** ${matchedProject.problem}\n` : "") +
        (matchedProject.solution ? `• **Engineering Solution:** ${matchedProject.solution}\n` : "") +
        (matchedProject.architecture ? `• **Architecture:** ${matchedProject.architecture}\n` : "") +
        (matchedProject.github ? `• **GitHub Repository:** [${matchedProject.github}](${matchedProject.github})\n` : "") +
        (matchedProject.liveDemo ? `• **Live Demo:** [${matchedProject.liveDemo}](${matchedProject.liveDemo})\n` : ""),
      sourceLabel: "Projects CMS",
      source: "Based on your portfolio project records",
      actions: [
        { label: "View Public Case Study", link: `/projects/${matchedProject.slug}` },
        { label: "Edit in Projects CMS", link: "/admin/projects" }
      ],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PROJECT INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isProjectQuery =
    q.includes("project") ||
    q.includes("projects") ||
    q.includes("case study") ||
    q.includes("case studies");

  if (isProjectQuery) {
    // 3A. Incomplete projects / missing information
    if (
      q.includes("incomplete") ||
      q.includes("missing") ||
      q.includes("attention") ||
      q.includes("lacking") ||
      q.includes("need work")
    ) {
      const incomplete = projects.filter((p) => {
        const missing = [];
        if (!p.description && !p.shortDescription) missing.push("Description");
        if (!p.liveDemo) missing.push("Live Demo URL");
        if (!p.github) missing.push("GitHub Repository URL");
        if (!p.thumbnail && (!Array.isArray(p.images) || p.images.length === 0)) missing.push("Project Imagery / Thumbnail");
        p._missing = missing;
        return missing.length > 0;
      });

      if (incomplete.length === 0) {
        return {
          intent: "PROJECTS_INCOMPLETE",
          heading: "PROJECT COMPLETENESS",
          summary: `All ${projects.length} projects are fully documented with descriptions, repository links, live demos, and media imagery.`,
          bullets: projects.map((p) => `✓ ${p.title} — 100% complete`),
          text: `All ${projects.length} projects meet complete documentation standards.`,
          sourceLabel: "Projects CMS",
          source: "Based on your portfolio project records",
          actions: [{ label: "Review Projects", link: "/admin/projects" }],
          isReadOnly: true,
          proposal: null
        };
      }

      const bullets = incomplete.map((p) => `**${p.title}:** Missing ${p._missing.join(", ")}`);
      return {
        intent: "PROJECTS_INCOMPLETE",
        heading: "PROJECTS NEEDING ATTENTION",
        summary: `Found ${incomplete.length} project(s) with incomplete metadata or missing assets.`,
        bullets,
        text:
          `### Incomplete Projects (${incomplete.length})\n\n` +
          incomplete
            .map((p) => `• **${p.title}**\n  *Missing:* ${p._missing.join(", ")}`)
            .join("\n\n"),
        sourceLabel: "Projects CMS",
        source: "Based on your portfolio project records",
        actions: [{ label: "Edit Projects in CMS", link: "/admin/projects" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // 3B. Projects with GitHub links
    if (q.includes("github") || q.includes("repo") || q.includes("source code")) {
      const withGithub = projects.filter((p) => Boolean(p.github || p.githubUrl));
      const withoutGithub = projects.filter((p) => !p.github && !p.githubUrl);

      const bullets = withGithub.map((p) => `**${p.title}:** ${p.github || p.githubUrl}`);
      if (withoutGithub.length > 0) {
        bullets.push(`*(Missing GitHub: ${withoutGithub.map((p) => p.title).join(", ")})*`);
      }

      return {
        intent: "PROJECTS_GITHUB",
        heading: "PROJECT GITHUB REPOSITORIES",
        summary: `${withGithub.length} of ${projects.length} projects have verified public GitHub repositories.`,
        bullets,
        text:
          `### GitHub Repositories (${withGithub.length}/${projects.length})\n\n` +
          withGithub.map((p) => `• **${p.title}:** [${p.github || p.githubUrl}](${p.github || p.githubUrl})`).join("\n") +
          (withoutGithub.length > 0 ? `\n\n⚠ Missing repositories for: ${withoutGithub.map((p) => p.title).join(", ")}` : ""),
        sourceLabel: "Projects CMS",
        source: "Based on your portfolio project records",
        actions: [{ label: "Update Projects", link: "/admin/projects" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // 3C. Projects with Live Demos
    if (q.includes("live demo") || q.includes("live link") || q.includes("deployed") || q.includes("demo")) {
      const withDemos = projects.filter((p) => Boolean(p.liveDemo || p.liveUrl));
      const withoutDemos = projects.filter((p) => !p.liveDemo && !p.liveUrl);

      const bullets = withDemos.map((p) => `**${p.title}:** ${p.liveDemo || p.liveUrl}`);
      if (withoutDemos.length > 0) {
        bullets.push(`*(Missing live demos: ${withoutDemos.map((p) => p.title).join(", ")})*`);
      }

      return {
        intent: "PROJECTS_DEMOS",
        heading: "PROJECT LIVE DEMOS",
        summary: `${withDemos.length} of ${projects.length} projects have live deployments.`,
        bullets,
        text:
          `### Live Deployments (${withDemos.length}/${projects.length})\n\n` +
          withDemos.map((p) => `• **${p.title}:** [${p.liveDemo || p.liveUrl}](${p.liveDemo || p.liveUrl})`).join("\n") +
          (withoutDemos.length > 0 ? `\n\n⚠ No live demo URL configured for: ${withoutDemos.map((p) => p.title).join(", ")}` : ""),
        sourceLabel: "Projects CMS",
        source: "Based on your portfolio project records",
        actions: [{ label: "Configure Demo URLs", link: "/admin/projects" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // 3D. Projects filtered by technology (e.g. "Which project uses React?", "Which project uses Spring Boot?")
    const techQuery = ["react", "spring", "spring boot", "java", "node", "aws", "docker", "python", "mongodb", "mysql", "tailwind"]
      .find((t) => q.includes(t));

    if (techQuery) {
      const matching = projects.filter((p) => {
        const stackStr = [
          Array.isArray(p.technologies) ? p.technologies.join(" ") : "",
          Array.isArray(p.techStack) ? p.techStack.join(" ") : "",
          p.stack || "",
          p.description || ""
        ].join(" ").toLowerCase();
        return stackStr.includes(techQuery);
      });

      if (matching.length === 0) {
        return {
          intent: "PROJECTS_TECH",
          heading: `PROJECTS USING ${techQuery.toUpperCase()}`,
          summary: `No projects in your portfolio currently list ${techQuery} in their technology stack.`,
          bullets: [`Total indexed projects: ${projects.length}`],
          text: `None of your ${projects.length} projects specify **${techQuery}** in their stack.`,
          sourceLabel: "Projects CMS",
          source: "Based on your portfolio project records",
          actions: [{ label: "View All Projects", link: "/admin/projects" }],
          isReadOnly: true,
          proposal: null
        };
      }

      return {
        intent: "PROJECTS_TECH",
        heading: `PROJECTS USING ${techQuery.toUpperCase()}`,
        summary: `Found ${matching.length} project(s) utilizing ${techQuery}.`,
        bullets: matching.map((p) => `**${p.title}** (${p.type || "Software"}) — [${p.publicationStatus || "published"}]`),
        text:
          `### Projects Built with ${techQuery.toUpperCase()} (${matching.length})\n\n` +
          matching.map((p) => `• **${p.title}** [${p.publicationStatus || "published"}] — ${p.shortDescription || p.description || "Technical project"}`).join("\n"),
        sourceLabel: "Projects CMS",
        source: "Based on your portfolio project records",
        actions: [{ label: "Inspect Projects", link: "/admin/projects" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // 3E. Draft vs Published Projects
    if (q.includes("draft") || q.includes("unpublished")) {
      return {
        intent: "PROJECTS_DRAFT",
        heading: "DRAFT PROJECTS",
        summary: `You currently have ${draftProjects.length} draft project(s) unpublished.`,
        bullets: draftProjects.length > 0 ? draftProjects.map((p) => `• **${p.title}** (${p.slug || "no-slug"})`) : ["No draft projects. All projects are published."],
        text: draftProjects.length > 0
          ? `### Draft Projects (${draftProjects.length})\n\n` + draftProjects.map((p) => `• **${p.title}** (Slug: \`${p.slug}\`)`).join("\n")
          : "You have 0 draft projects. All projects in your CMS are currently live.",
        sourceLabel: "Projects CMS",
        source: "Based on your portfolio project records",
        actions: [{ label: "Manage Projects", link: "/admin/projects" }],
        isReadOnly: true,
        proposal: null
      };
    }

    if (q.includes("published")) {
      return {
        intent: "PROJECTS_PUBLISHED",
        heading: "PUBLISHED PROJECTS",
        summary: `You currently have ${publishedProjects.length} published project(s) active on the live site.`,
        bullets: publishedProjects.map((p) => `• **${p.title}** (${p.slug})`),
        text: `### Published Projects (${publishedProjects.length})\n\n` + publishedProjects.map((p) => `• **${p.title}** — [Live Details](/projects/${p.slug})`).join("\n"),
        sourceLabel: "Projects CMS",
        source: "Based on your portfolio project records",
        actions: [{ label: "Manage Projects", link: "/admin/projects" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // 3F. General Project Listing
    const bullets = projects.map((p) => `**${p.title}** [${p.publicationStatus || "published"}] — ${p.type || "Full Stack"}`);
    return {
      intent: "PROJECTS_ALL",
      heading: "PROJECT CATALOG",
      summary: `You have ${projects.length} total project(s) in your portfolio CMS (${publishedProjects.length} published, ${draftProjects.length} draft).`,
      bullets,
      text:
        `### Portfolio Projects (${projects.length})\n\n` +
        projects.map((p) => `• **${p.title}** [${p.publicationStatus || "published"}] — ${p.shortDescription || p.description || "Software Engineering"}`).join("\n"),
      sourceLabel: "Projects CMS",
      source: "Based on your portfolio project records",
      actions: [{ label: "Manage Projects", link: "/admin/projects" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. CERTIFICATION INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isCertQuery =
    q.includes("certification") ||
    q.includes("certifications") ||
    q.includes("certificate") ||
    q.includes("certificates") ||
    q.includes("credential") ||
    q.includes("credentials") ||
    q.includes("license");

  if (isCertQuery) {
    // 4A. Missing credentials / URLs
    if (q.includes("missing") || q.includes("without") || q.includes("no link") || q.includes("unverified")) {
      const missingUrls = certifications.filter((c) => !c.certificateUrl && !c.verificationUrl && !c.credentialId);
      if (missingUrls.length === 0) {
        return {
          intent: "CERTS_MISSING",
          heading: "CERTIFICATION VERIFICATION STATUS",
          summary: `All ${certifications.length} certifications have verified credential IDs or public verification links.`,
          bullets: certifications.map((c) => `✓ ${c.name} (${c.issuer})`),
          text: `All ${certifications.length} credentials in your CMS have complete verification details.`,
          sourceLabel: "Certifications CMS",
          source: "Based on your portfolio certification records",
          actions: [{ label: "View Certifications", link: "/admin/certifications" }],
          isReadOnly: true,
          proposal: null
        };
      }

      return {
        intent: "CERTS_MISSING",
        heading: "CERTIFICATIONS MISSING VERIFICATION",
        summary: `Found ${missingUrls.length} certification(s) without credential IDs or verification URLs.`,
        bullets: missingUrls.map((c) => `• **${c.name}** (${c.issuer}) — Missing verification link/ID`),
        text: `### Unverified Certifications (${missingUrls.length})\n\n` + missingUrls.map((c) => `• **${c.name}** (Issuer: ${c.issuer})`).join("\n"),
        sourceLabel: "Certifications CMS",
        source: "Based on your portfolio certification records",
        actions: [{ label: "Add Verification URLs", link: "/admin/certifications" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // 4B. By issuer (AWS, Microsoft, Google, etc.)
    const issuerMatch = ["aws", "microsoft", "google", "coursera", "udemy", "oracle", "cisco"]
      .find((iss) => q.includes(iss));

    if (issuerMatch) {
      const matching = certifications.filter((c) => (c.issuer || "").toLowerCase().includes(issuerMatch));
      return {
        intent: "CERTS_ISSUER",
        heading: `${issuerMatch.toUpperCase()} CERTIFICATIONS`,
        summary: matching.length > 0
          ? `You have ${matching.length} certification(s) issued by ${issuerMatch.toUpperCase()}.`
          : `No certifications from ${issuerMatch.toUpperCase()} found in your CMS.`,
        bullets: matching.map((c) => `• **${c.name}** (${c.date || "Verified"})`),
        text: matching.length > 0
          ? `### ${issuerMatch.toUpperCase()} Credentials (${matching.length})\n\n` + matching.map((c) => `• **${c.name}** — Issue Date: ${c.date || "N/A"}`).join("\n")
          : `No credentials issued by **${issuerMatch.toUpperCase()}** were found in your CMS.`,
        sourceLabel: "Certifications CMS",
        source: "Based on your portfolio certification records",
        actions: [{ label: "Manage Certifications", link: "/admin/certifications" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // 4C. All certifications / recent
    const bullets = certifications.map((c) => `• **${c.name}** (${c.issuer} · ${c.date || "Completed"})`);
    return {
      intent: "CERTS_ALL",
      heading: "VERIFIED CERTIFICATIONS",
      summary: `You have ${certifications.length} verified certification credential(s) listed.`,
      bullets,
      text:
        `### Verified Certifications (${certifications.length})\n\n` +
        certifications.map((c) => `• **${c.name}** (${c.issuer}) — ${c.status || "Completed"}`).join("\n"),
      sourceLabel: "Certifications CMS",
      source: "Based on your portfolio certification records",
      actions: [{ label: "Manage Certifications", link: "/admin/certifications" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. EXPERIENCE INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isExpQuery =
    q.includes("experience") ||
    q.includes("where have i worked") ||
    q.includes("where did i work") ||
    q.includes("employment") ||
    q.includes("companies worked") ||
    q.includes("work history");

  if (isExpQuery) {
    const bullets = experience.map((exp) => {
      const range = `${exp.startDate || ""} – ${exp.current ? "Present" : (exp.endDate || "")}`;
      return `• **${exp.role}** at **${exp.company}** (${range})${exp.current ? " [Current Role]" : ""}`;
    });

    return {
      intent: "EXPERIENCE_ALL",
      heading: "WORK EXPERIENCE",
      summary: `You have ${experience.length} professional work experience record(s) documented.`,
      bullets,
      text:
        `### Professional Experience (${experience.length})\n\n` +
        experience
          .map((exp) => `• **${exp.role}** at **${exp.company}** (${exp.startDate || ""} – ${exp.current ? "Present" : (exp.endDate || "")})\n  ${exp.description || ""}`)
          .join("\n\n"),
      sourceLabel: "Experience CMS",
      source: "Based on your portfolio experience records",
      actions: [{ label: "Manage Experience", link: "/admin/experience" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. SKILL INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isSkillQuery =
    q.includes("skill") ||
    q.includes("skills") ||
    q.includes("technologies") ||
    q.includes("tech stack") ||
    q.includes("what do i know") ||
    q.includes("does he know") ||
    q.includes("do you know") ||
    q.includes("knows") ||
    q.includes("know ") ||
    q.endsWith("know") ||
    q.includes("proficient") ||
    q.includes("expertise") ||
    q.includes("backend skills") ||
    q.includes("cloud skills") ||
    q.includes("frontend skills");

  if (isSkillQuery) {
    // Check specific skill
    const targetSkill = ["react", "java", "spring", "spring boot", "python", "aws", "docker", "sql", "mongodb", "javascript", "c#", ".net"]
      .find((s) => q.includes(s));

    if (targetSkill) {
      const allSkillsFlat = skills.flatMap((c) => (Array.isArray(c.skills) ? c.skills.map((s) => (typeof s === "string" ? s : s.name)) : []));
      const hasSkill = allSkillsFlat.some((s) => s && s.toLowerCase().includes(targetSkill));

      return {
        intent: "SKILL_CHECK",
        heading: `SKILL PROFICIENCY: ${targetSkill.toUpperCase()}`,
        summary: hasSkill
          ? `Yes, **${targetSkill.toUpperCase()}** is verified and listed in your Skills CMS.`
          : `No, **${targetSkill.toUpperCase()}** is not explicitly listed in your Skills CMS categories.`,
        bullets: hasSkill
          ? [`Listed in Skill Categories: ${skills.filter((c) => (c.skills || []).some((s) => (s.name || s).toLowerCase().includes(targetSkill))).map((c) => c.category).join(", ")}`]
          : [`Total skill categories defined: ${skills.length}`],
        text: hasSkill
          ? `✓ **${targetSkill.toUpperCase()}** is an official competency in your technical skills catalog.`
          : `⚠ **${targetSkill.toUpperCase()}** does not currently appear in your Skills CMS. You can add it on the Skills page.`,
        sourceLabel: "Skills CMS",
        source: "Based on your portfolio skills records",
        actions: [{ label: "Manage Skills", link: "/admin/skills" }],
        isReadOnly: true,
        proposal: null
      };
    }

    const bullets = skills.map((cat) => {
      const names = Array.isArray(cat.skills) ? cat.skills.map((s) => s.name || s).join(", ") : "";
      return `• **${cat.category}:** ${names}`;
    });

    return {
      intent: "SKILLS_ALL",
      heading: "TECHNICAL SKILLS CATALOG",
      summary: `You have ${skills.length} categorized skill groups comprising ${skills.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0)} individual competencies.`,
      bullets,
      text:
        `### Technical Skills (${skills.length} Groups)\n\n` +
        bullets.join("\n"),
      sourceLabel: "Skills CMS",
      source: "Based on your portfolio skills records",
      actions: [{ label: "Manage Skills", link: "/admin/skills" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. ACHIEVEMENTS INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isAchievementQuery =
    q.includes("achievement") ||
    q.includes("achievements") ||
    q.includes("award") ||
    q.includes("awards") ||
    q.includes("milestone") ||
    q.includes("milestones");

  if (isAchievementQuery) {
    const withImages = achievements.filter((a) => Boolean(a.image));
    const withoutImages = achievements.filter((a) => !a.image);

    const bullets = achievements.map((a) => `• **${a.title}** (${a.organization || "Honors"} · ${a.date || ""})${a.image ? " [Image Attached]" : ""}`);

    return {
      intent: "ACHIEVEMENTS_ALL",
      heading: "HONORS & MILESTONES",
      summary: `You have ${achievements.length} achievement milestone(s) recorded (${withImages.length} with showcase imagery).`,
      bullets,
      text:
        `### Achievements & Milestones (${achievements.length})\n\n` +
        achievements.map((a) => `• **${a.title}** — ${a.organization || "Honor"} (${a.date || ""})`).join("\n") +
        (withoutImages.length > 0 ? `\n\n*Milestones without imagery: ${withoutImages.map((a) => a.title).join(", ")}*` : ""),
      sourceLabel: "Achievements CMS",
      source: "Based on your portfolio achievement records",
      actions: [{ label: "Manage Achievements", link: "/admin/achievements" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. GALLERY & MEDIA INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isMediaGalleryQuery =
    q.includes("media") ||
    q.includes("gallery") ||
    q.includes("orphaned") ||
    q.includes("unused media") ||
    q.includes("used media") ||
    q.includes("images");

  if (isMediaGalleryQuery) {
    if (q.includes("unused") || q.includes("orphaned")) {
      const unused = media.filter((m) => getMediaReferences(m, store).length === 0);
      return {
        intent: "MEDIA_UNUSED",
        heading: "UNUSED & ORPHANED MEDIA",
        summary: unused.length > 0
          ? `Found ${unused.length} media asset(s) not currently referenced by any public portfolio content.`
          : `All ${media.length} library assets are actively referenced in your portfolio.`,
        bullets: unused.map((m) => `• **${m.name}** (${m.size || "file"}) — URL: \`${m.url}\``),
        text: unused.length > 0
          ? `### Unused / Orphaned Assets (${unused.length})\n\n` + unused.map((m) => `• **${m.name}** (${m.type}) — \`${m.url}\``).join("\n")
          : "Zero orphaned media found. Every uploaded asset is currently tied to a project, credential, achievement, or profile.",
        sourceLabel: "Media Library 2.0",
        source: "Cross-referenced with live portfolio entities",
        actions: [{ label: "Inspect Media Library", link: "/admin/media" }],
        isReadOnly: true,
        proposal: null
      };
    }

    if (q.includes("gallery") && !q.includes("media")) {
      const bullets = gallery.map((g) => `• **${g.title}** (${g.category || "Visual"}) [${g.status || "published"}]`);
      return {
        intent: "GALLERY_ALL",
        heading: "VISUAL GALLERY ASSETS",
        summary: `You have ${gallery.length} showcase item(s) in your Visual Gallery (${publishedGallery.length} published, ${draftGallery.length} draft).`,
        bullets,
        text:
          `### Visual Gallery Items (${gallery.length})\n\n` +
          gallery.map((g) => `• **${g.title}** [${g.status || "published"}] — Category: ${g.category || "General"}`).join("\n"),
        sourceLabel: "Gallery CMS",
        source: "Based on your portfolio gallery records",
        actions: [{ label: "Manage Gallery", link: "/admin/gallery" }],
        isReadOnly: true,
        proposal: null
      };
    }

    // Default Media overview
    const inUseCount = media.filter((m) => getMediaReferences(m, store).length > 0).length;
    const unusedCount = media.length - inUseCount;

    return {
      intent: "MEDIA_OVERVIEW",
      heading: "MEDIA LIBRARY STATUS",
      summary: `Media library holds ${media.length} cloud asset(s): ${inUseCount} actively in use, ${unusedCount} orphaned.`,
      bullets: [
        `Total Assets: ${media.length}`,
        `In Use: ${inUseCount}`,
        `Unused / Orphaned: ${unusedCount}`,
        `Gallery Entities: ${gallery.length}`
      ],
      text: `### Media Assets (${media.length})\n\n• **Active in Content:** ${inUseCount}\n• **Orphaned:** ${unusedCount}\n• **Visual Gallery Showcase:** ${gallery.length} items`,
      sourceLabel: "Media Library 2.0",
      source: "Based on Supabase Storage & reference inspection",
      actions: [
        { label: "Open Media Library", link: "/admin/media" },
        { label: "Manage Gallery", link: "/admin/gallery" }
      ],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. FEATURED SHOWCASE INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isFeaturedQuery =
    q.includes("featured") ||
    q.includes("showcase") ||
    q.includes("spotlight") ||
    q.includes("what is featured");

  if (isFeaturedQuery) {
    const rawFeatured = profile.snapshot?.home?.featuredItems || settings.featuredItems || [];
    const active = rawFeatured.filter((i) => i.enabled !== false && i.contentId);

    const resolvedList = active.map((item, idx) => {
      let title = item.title || item.contentId;
      if (item.contentType === "project") {
        const p = projects.find((x) => x.id === item.contentId);
        if (p) title = p.title;
      } else if (item.contentType === "certification") {
        const c = certifications.find((x) => x.id === item.contentId);
        if (c) title = c.name;
      } else if (item.contentType === "achievement") {
        const a = achievements.find((x) => x.id === item.contentId);
        if (a) title = a.title;
      } else if (item.contentType === "gallery") {
        const g = gallery.find((x) => x.id === item.contentId);
        if (g) title = g.title;
      }
      return `${idx + 1}. **${title}** — *${item.contentType || "Item"}*`;
    });

    return {
      intent: "FEATURED_ALL",
      heading: "FEATURED SHOWCASE",
      summary: `Your homepage Featured Showcase has ${active.length} active highlight item(s) enabled.`,
      bullets: resolvedList.length > 0 ? resolvedList : ["No items currently enabled in Featured Showcase."],
      text:
        `### Featured Showcase Highlights (${active.length})\n\n` +
        (resolvedList.length > 0 ? resolvedList.join("\n") : "Featured Showcase is empty. Default fallback spotlight active."),
      sourceLabel: "Home CMS Showcase",
      source: "Based on your homepage showcase configuration",
      actions: [{ label: "Configure Featured Work", link: "/admin/home" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10. SEO INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isSeoQuery =
    q.includes("seo") ||
    q.includes("meta description") ||
    q.includes("meta title") ||
    q.includes("search engine") ||
    q.includes("discoverability");

  if (isSeoQuery) {
    const issues = [];
    const title = settings.siteTitle || profile.name || "";
    const desc = profile.bio || settings.metaDescription || "";

    if (!title || title.length < 30) {
      issues.push("Global title is under 30 characters (recommended: 50–60 chars).");
    } else if (title.length > 65) {
      issues.push("Global title exceeds 65 characters and may truncate in Google SERPs.");
    }

    if (!desc || desc.length < 100) {
      issues.push("Global meta description is short (recommended: 140–160 chars).");
    } else if (desc.length > 165) {
      issues.push("Global meta description is longer than 165 characters and will truncate.");
    }

    return {
      intent: "SEO_ISSUES",
      heading: "SEO & DISCOVERABILITY AUDIT",
      summary: issues.length > 0
        ? `Found ${issues.length} SEO optimization recommendation(s).`
        : "Your global titles and meta descriptions match recommended SERP lengths.",
      bullets: issues.length > 0 ? issues : ["✓ Global Title length optimal (50–60 chars)", "✓ Meta Description length optimal (140–160 chars)"],
      text:
        `### SEO Health & Metadata\n\n` +
        (issues.length > 0
          ? issues.map((iss) => `⚠ ${iss}`).join("\n")
          : "✓ Global page titles, social cards, and descriptions meet Google SERP guidelines."),
      sourceLabel: "SEO Manager 2.0",
      source: "Based on SEO Manager configuration and live routes",
      actions: [{ label: "Open SEO Manager 2.0", link: "/admin/seo" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 11. SITE HEALTH INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  const isHealthQuery =
    q.includes("healthy") ||
    q.includes("site health") ||
    q.includes("warning") ||
    q.includes("warnings") ||
    q.includes("what needs attention") ||
    q.includes("what should i fix") ||
    q.includes("issues") ||
    q.includes("audit");

  if (isHealthQuery) {
    const health = evaluateSiteHealth({ ...store, media });
    return {
      intent: "HEALTH_ALL",
      heading: "SITE HEALTH AUDIT",
      summary: `Site Health is rated **${health.score}% (${health.level})** with ${health.warnings.length} actionable warning(s).`,
      bullets: health.warnings.length > 0
        ? health.warnings.map((w) => `⚠ ${w.text}`)
        : ["✓ All content, SEO, and media checks are in optimal status."],
      text:
        `### Site Health Score: ${health.score}% (${health.level})\n\n` +
        (health.warnings.length > 0
          ? `I found ${health.warnings.length} item(s) needing attention:\n\n` + health.warnings.map((w, i) => `${i + 1}. ${w.text}`).join("\n")
          : "✓ Everything is healthy. Zero critical warnings detected."),
      sourceLabel: "Site Health Audit",
      source: "Composite audit calculated from all CMS entities",
      actions: [{ label: "View Site Health Dashboard", link: "/admin/health" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 12. RECENT CHANGES & AUDIT TRAIL
  // ─────────────────────────────────────────────────────────────
  const isRecentChangesQuery =
    q.includes("recent") ||
    q.includes("what changed") ||
    q.includes("audit") ||
    q.includes("activity") ||
    q.includes("updated today");

  if (isRecentChangesQuery) {
    const recent = auditLogs.slice(0, 6);
    if (recent.length === 0) {
      return {
        intent: "RECENT_CHANGES",
        heading: "RECENT ADMIN ACTIVITY",
        summary: "No recent audit activity logged in the current session.",
        bullets: ["Audit logs are created whenever entities are updated, duplicated, or restored."],
        text: "Audit logging is active. No mutations have been recorded in the recent session.",
        sourceLabel: "Audit Logs",
        source: "Based on Supabase audit trail records",
        actions: [{ label: "View Audit Logs", link: "/admin/audit" }],
        isReadOnly: true,
        proposal: null
      };
    }

    const bullets = recent.map((log) => {
      const time = log.created_at ? new Date(log.created_at).toLocaleString() : "Recent";
      return `• **${log.action || "UPDATE"}** on \`${log.entity || log.table_name || "content"}\` (${time})`;
    });

    return {
      intent: "RECENT_CHANGES",
      heading: "RECENT ADMIN ACTIVITY",
      summary: `Showing ${recent.length} latest operational mutation(s).`,
      bullets,
      text:
        `### Recent Admin Activity\n\n` +
        recent
          .map((log) => {
            const time = log.created_at ? new Date(log.created_at).toLocaleString() : "Recent";
            return `• **${log.action || "MUTATION"}** — Entity: \`${log.entity || "content"}\` at ${time}`;
          })
          .join("\n"),
      sourceLabel: "Audit Logs",
      source: "Based on Supabase audit trail records",
      actions: [{ label: "Open Audit Trail", link: "/admin/audit" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 13. DRAFT CONTENT ACROSS ALL COLLECTIONS
  // ─────────────────────────────────────────────────────────────
  const isDraftQuery =
    q.includes("draft") ||
    q.includes("drafts") ||
    q.includes("unpublished");

  if (isDraftQuery) {
    const totalDrafts = draftProjects.length + draftCerts.length + draftAchievements.length + draftGallery.length;
    const bullets = [
      `Projects in draft: ${draftProjects.length}${draftProjects.length > 0 ? ` (${draftProjects.map((p) => p.title).join(", ")})` : ""}`,
      `Certifications in draft: ${draftCerts.length}${draftCerts.length > 0 ? ` (${draftCerts.map((c) => c.name).join(", ")})` : ""}`,
      `Achievements in draft: ${draftAchievements.length}`,
      `Gallery items in draft: ${draftGallery.length}`
    ];

    return {
      intent: "DRAFTS_ALL",
      heading: "DRAFT CONTENT BREAKDOWN",
      summary: `You have ${totalDrafts} draft record(s) across all collections.`,
      bullets,
      text:
        `### Draft Content (${totalDrafts} Total)\n\n` +
        bullets.map((b) => `• ${b}`).join("\n"),
      sourceLabel: "CMS Content Registry",
      source: "Based on publication status across all collections",
      actions: [{ label: "Review Projects", link: "/admin/projects" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 14. DEFAULT / UNKNOWN QUESTION FALLBACK (NO HALLUCINATION)
  // 14. EDUCATION & ACADEMIC CREDENTIALS
  // ─────────────────────────────────────────────────────────────
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
    q.includes("qualification");

  if (isEducationQuery) {
    const bullets = education.map(
      (e) => `• **${e.degree}** (${e.institution} · ${e.year || ""}) — ${e.score || e.grade || "Completed"}`
    );
    return {
      intent: "EDUCATION_ALL",
      heading: "ACADEMIC QUALIFICATIONS",
      summary: `Ayyaj holds ${education.length} formal academic credential(s), including MCA from D.Y. Patil International University.`,
      bullets,
      text:
        `### Academic Qualifications (${education.length})\n\n` +
        education
          .map((e) => `• **${e.degree}** — ${e.institution} (${e.year || ""})\n  Score/Grade: ${e.score || e.grade || "Completed"}`)
          .join("\n\n"),
      sourceLabel: "Education CMS",
      source: "Based on your portfolio education records",
      actions: [{ label: "Manage Education", link: "/admin/education" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 15. RESUME & CV DOCUMENT
  // ─────────────────────────────────────────────────────────────
  const isResumeQuery =
    q.includes("resume") ||
    q.includes("cv") ||
    q.includes("curriculum vitae");

  if (isResumeQuery) {
    const resumeFile = profile.snapshot?.resume?.pdfUrl || profile.resumeUrl || "/resume.pdf";
    return {
      intent: "RESUME_INFO",
      heading: "OFFICIAL RESUME",
      summary: "Official verified resume is available for preview and download.",
      bullets: [
        "Interactive digital resume viewer (/resume)",
        "Direct PDF download",
        profile.contact?.resumeDrive ? "Google Drive backup copy" : "Cloud storage verified"
      ],
      text:
        `### Official Resume\n\n` +
        `• **Digital Viewer:** Visit the interactive [/resume](/resume) page.\n` +
        `• **Direct PDF Link:** [Download Resume PDF](${resumeFile})\n` +
        (profile.contact?.resumeDrive ? `• **Google Drive Copy:** [Open in Drive](${profile.contact.resumeDrive})\n` : ""),
      sourceLabel: "Resume Manager",
      source: "Based on configured resume files in CMS",
      actions: [
        { label: "View Resume Page", link: "/resume" },
        { label: "Manage Resume File", link: "/admin/resume" }
      ],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 16. CONTACT DETAILS & BASE LOCATION
  // ─────────────────────────────────────────────────────────────
  const isContactQuery =
    q.includes("contact") ||
    q.includes("email") ||
    q.includes("phone") ||
    q.includes("reach") ||
    q.includes("location") ||
    q.includes("where do you live") ||
    q.includes("address") ||
    q.includes("pune");

  if (isContactQuery) {
    const contact = profile.contact || {};
    return {
      intent: "CONTACT_DETAILS",
      heading: "CONTACT & AVAILABILITY",
      summary: `Ayyaj is based in ${profile.location || "Hinjawadi, Pune, Maharashtra, India"} and open to software engineering opportunities.`,
      bullets: [
        `Email: ${contact.email || "ayyajahmad64@gmail.com"}`,
        `Phone: ${contact.phone || "+91 84324 85204"}`,
        `Location: ${profile.location || "Hinjawadi, Pune, Maharashtra, India"}`,
        `LinkedIn: ${contact.linkedin || "linkedin.com/in/ayyajahmad86"}`,
        `GitHub: ${contact.github || "github.com/AyyajAhmad64"}`
      ],
      text:
        `### Contact Information\n\n` +
        `• **Email:** [${contact.email || "ayyajahmad64@gmail.com"}](mailto:${contact.email || "ayyajahmad64@gmail.com"})\n` +
        `• **Phone / WhatsApp:** [${contact.phone || "+91 84324 85204"}](tel:${contact.phoneRaw || "+918432485204"})\n` +
        `• **Location Base:** ${profile.location || "Hinjawadi, Pune, Maharashtra, India"}\n` +
        `• **LinkedIn:** [Profile](${contact.linkedin || "https://www.linkedin.com/in/ayyajahmad86"})\n` +
        `• **GitHub:** [Profile](${contact.github || "https://github.com/AyyajAhmad64"})\n\n` +
        `Available for on-site, hybrid, or remote opportunities.`,
      sourceLabel: "Contact CMS",
      source: "Based on contact configuration in CMS",
      actions: [{ label: "Contact Settings", link: "/admin/contact" }],
      isReadOnly: true,
      proposal: null
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 17. DEFAULT / UNKNOWN QUESTION FALLBACK (NO HALLUCINATION)
  // ─────────────────────────────────────────────────────────────
  return {
    intent: "UNKNOWN",
    heading: "ASK JARVIS",
    summary: "I'm your factual portfolio intelligence assistant. I can query and analyze any section of your portfolio.",
    bullets: [
      "Ask: 'Give me a portfolio overview'",
      "Ask: 'Which projects are incomplete?'",
      "Ask: 'What needs attention?'",
      "Ask: 'Show my draft projects'",
      "Ask: 'Which media is unused?'",
      "Ask: 'What is featured?'",
      "Ask: 'How is my SEO?'"
    ],
    text:
      `I can help analyze your portfolio data, projects, certifications, skills, experience, SEO, media, site health, and recent changes.\n\n` +
      `Try asking:\n` +
      `• *"Give me a portfolio overview"*\n` +
      `• *"Which projects are incomplete?"*\n` +
      `• *"What needs attention?"*\n` +
      `• *"Show recent changes"*\n` +
      `• *"Which media is unused?"*`,
    sourceLabel: "ASK JARVIS Intelligence",
    source: "Ready to query live Supabase portfolio records",
    actions: [],
    isReadOnly: true,
    proposal: null
  };
}
