/**
 * Central Content Defaults & Resolvers
 * Provides structured fallbacks for About and Home pages when custom CMS fields
 * have not yet been modified by the administrator.
 */

export function resolveAboutContent(profile) {
  const detailed = profile?.aboutDetailed;
  
  // If detailed is a structured object, extract fields; if array, use as overview paragraphs
  let customOverview = null;
  let customIntro = null;
  let customArchFocus = null;
  let customPhilosophy = null;
  let customCareer = null;

  if (detailed && typeof detailed === "object" && !Array.isArray(detailed)) {
    customIntro = detailed.introduction;
    customOverview = Array.isArray(detailed.professionalOverview) 
      ? detailed.professionalOverview 
      : (detailed.professionalOverview ? [detailed.professionalOverview] : null);
    customArchFocus = Array.isArray(detailed.architecturalFocus) ? detailed.architecturalFocus : null;
    customPhilosophy = Array.isArray(detailed.philosophy) ? detailed.philosophy : null;
    customCareer = detailed.careerDirection;
  } else if (Array.isArray(detailed) && detailed.length > 0) {
    customOverview = detailed;
  }

  const defaultIntro = `I am ${profile?.name || "Ayyaj Kalandar Shaikh"}, a software developer with a rigorous academic foundation in computer applications and hands-on industry experience building full-stack web platforms. My focus is on crafting robust backend services using Java and Spring Boot, architecting component-driven web interfaces in React.js, and leveraging Cloud Computing / AWS fundamentals for scalable system deployments.`;

  const defaultOverview = [
    `Currently pursuing my Master of Computer Applications (MCA) in Cloud Computing at Dr. D. Y. Patil Institute of Management and Entrepreneur Development, Pune, I combine rigorous theoretical knowledge in distributed computing, networking, and algorithms with practical software construction.`,
    `As a MERN Stack + AI Intern at BQARLSON Software Pvt. Ltd. in Pune, I actively build full-stack features, integrate RESTful API endpoints, and explore pragmatic generative AI integrations that solve concrete user problems without introducing unnecessary complexity.`,
    `Prior to my postgraduate studies, I completed my Bachelor of Computer Applications (BCA) at Sangameshwar College, Solapur, graduating with 79.50% distinction and solidifying my core competencies in object-oriented programming, data structures, and relational database design.`
  ];

  const defaultArchFocus = [
    {
      num: "01",
      title: "Layered Backend Design",
      desc: "Strict separation of concerns applying the Controller-Service-Repository pattern across Spring Boot and ASP.NET Core for maintainable business logic and testable code."
    },
    {
      num: "02",
      title: "Relational Integrity & SQL",
      desc: "Normalized schema design, explicit indexing, foreign key constraints, and clean transaction handling across MySQL and Microsoft SQL Server."
    },
    {
      num: "03",
      title: "Cloud & Distributed Systems",
      desc: "Practical focus on AWS fundamentals (EC2, S3, IAM), container concepts, stateless architectures, and serverless compute primitives."
    }
  ];

  const defaultPhilosophy = [
    {
      title: "Predictability over Cleverness",
      desc: "Code should be easy to read, debug, and maintain. I prioritize explicit contracts and consistent conventions."
    },
    {
      title: "Data Integrity First",
      desc: "Clean schema migrations, atomic transactions, and thorough validation guard systems against state corruption."
    },
    {
      title: "Zero Fluff, High Performance",
      desc: "Prioritize fast load times, accessible markup, and deterministic interactions without heavy animation bloat."
    }
  ];

  const defaultCareer = `I am preparing for full-time engineering roles upon completion of my postgraduate degree, with readiness for immediate onboarding or internship transitions.`;

  return {
    introduction: customIntro || defaultIntro,
    professionalOverview: customOverview && customOverview.length > 0 ? customOverview : defaultOverview,
    architecturalFocus: customArchFocus && customArchFocus.length > 0 ? customArchFocus : defaultArchFocus,
    philosophy: customPhilosophy && customPhilosophy.length > 0 ? customPhilosophy : defaultPhilosophy,
    careerDirection: customCareer || defaultCareer
  };
}

export function resolveHomeContent(profile, settings) {
  const homeData = profile?.snapshot?.home || {};

  return {
    heroRolePrimary: homeData.heroRolePrimary || "Software Developer",
    heroRoleSecondary: homeData.heroRoleSecondary || "Full Stack Developer",
    heroStackPills: Array.isArray(homeData.heroStackPills) && homeData.heroStackPills.length > 0
      ? homeData.heroStackPills
      : ["Java", "Spring Boot", "React.js", "ASP.NET Core", "Cloud Computing"],
    heroFrameCaption: homeData.heroFrameCaption || "ENGINEERING PROFILE",
    heroFrameSub: homeData.heroFrameSub || `${profile?.name || "Ayyaj Shaikh"} · MCA Cloud`,
    
    // Section headers & subtitles
    featuredHeading: homeData.featuredHeading || "Featured Work",
    featuredDesc: homeData.featuredDesc || "Highlighting robust full-stack platforms with real backend architectures, database schemas, and clean code.",
    
    experienceHeading: homeData.experienceHeading || "Career Snapshot",
    experienceDesc: homeData.experienceDesc || "Hands-on industry internships spanning MERN stack, AI integration, and modern frontend development.",
    
    skillsHeading: homeData.skillsHeading || "Skills & Technologies",
    skillsDesc: homeData.skillsDesc || "Curated core stack used in enterprise backend architectures, dynamic frontends, and cloud deployments.",
    
    educationHeading: homeData.educationHeading || "Education Snapshot",
    educationDesc: homeData.educationDesc || "Specialized postgraduate training in Cloud Computing along with foundational computer science qualifications.",
    
    achievementsHeading: homeData.achievementsHeading || "Milestones & Credentials",
    achievementsDesc: homeData.achievementsDesc || "Academic selections, industry internships, and formal software training milestones.",
    
    certificationsHeading: homeData.certificationsHeading || "Certifications & Training",
    certificationsDesc: homeData.certificationsDesc || "Verified technical credentials, licenses, and formal software development training.",
    
    galleryHeading: homeData.galleryHeading || "Development & Interface Gallery",
    galleryDesc: homeData.galleryDesc || "Visual inspections, architecture audits, and screenshots of responsive development workflows.",
    
    principlesHeading: homeData.principlesHeading || "How I Build",
    principlesDesc: homeData.principlesDesc || "Core engineering tenets that guide software design, implementation decisions, and team collaborations.",
    
    principles: Array.isArray(homeData.principles) && homeData.principles.length > 0
      ? homeData.principles
      : [
          {
            title: "Layered Clean Architecture",
            subtitle: "Controller-Service-Repository Pattern",
            desc: "Strict separation of concerns across presentation, business domain logic, and persistent relational data layers for maintainable codebases."
          },
          {
            title: "Relational Persistence & Integrity",
            subtitle: "Normalized Data Modeling",
            desc: "Explicit schema design, transactional boundaries, entity relationships, and query tuning in MySQL and Microsoft SQL Server."
          },
          {
            title: "Practical Full-Stack Execution",
            subtitle: "React Frontend + REST Contracts",
            desc: "Component-driven user interfaces connected with strongly-typed RESTful endpoints, responsive viewport handling, and accessibility standards."
          },
          {
            title: "Continuous Learning & Modernization",
            subtitle: "Cloud & AI Integrations",
            desc: "Postgraduate specialization in Cloud Computing combined with active industry experience integrating AI capabilities into MERN applications."
          }
        ],
        
    // CTA Block
    contactCtaHeading: homeData.contactCtaHeading || "Have a project, opportunity, or idea?",
    contactCtaSubheading: homeData.contactCtaSubheading || "Let's build something reliable and impactful. I am open to discussing software developer positions, backend opportunities, and cloud projects.",
    contactCtaButtonText: homeData.contactCtaButtonText || "Get in Touch →",
    contactEmailButtonText: homeData.contactEmailButtonText || "Email Me Directly ↗"
  };
}
