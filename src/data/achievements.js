/**
 * Centralized Achievements Data
 * Verified academic milestones, internship selections, and technical accomplishments.
 * Designed to support /achievements and /achievements/:slug dynamically.
 */

export const achievementsData = [
  {
    id: "mca-cloud-admission",
    slug: "mca-cloud-admission",
    title: "Postgraduate Selection — MCA in Cloud Computing",
    type: "Academic Milestone",
    organization: "Dr. D. Y. Patil Institute of Management and Entrepreneur Development, Pune",
    date: "2024",
    description: "Secured admission to the specialized Master of Computer Applications program focused on Cloud Computing and Enterprise Software Architecture in Pune.",
    impact: "Provides dedicated training in cloud infrastructure, enterprise software development, distributed architectures, and advanced engineering practices.",
    highlights: [
      "Specialized cloud curriculum covering AWS, virtualization, and enterprise computing",
      "Hands-on research and applied engineering lab access in Pune",
      "Focus on scalable distributed systems and modern backend microservices"
    ],
    credential: null,
    image: null,
    link: null
  },
  {
    id: "bqarlson-selection",
    slug: "bqarlson-selection",
    title: "Internship Selection — MERN Stack & AI Development",
    type: "Industry Selection",
    organization: "BQARLSON Software Pvt. Ltd.",
    date: "Sep 2026",
    description: "Selected as MERN Stack + AI Intern to work on real-world web applications and artificial intelligence integration workflows.",
    impact: "Gaining active production experience building full-stack applications and combining modern AI capabilities with responsive web interfaces.",
    highlights: [
      "Working on scalable full-stack React and Node.js solutions",
      "Practical exploration of AI-assisted features in production software",
      "Collaborating remotely with cross-functional engineering teams"
    ],
    credential: null,
    image: null,
    link: null
  },
  {
    id: "bca-graduation",
    slug: "bca-graduation",
    title: "Bachelor of Computer Applications Graduation",
    type: "Academic Milestone",
    organization: "Shivraj College, Gadhinglaj (Shivaji University, Kolhapur)",
    date: "2023",
    description: "Successfully completed degree in Bachelor of Computer Applications with distinction in core software development, database design, and object-oriented programming.",
    impact: "Solidified core engineering principles in object-oriented programming, data structures, relational databases, and enterprise software foundations.",
    highlights: [
      "Rigorous coursework in C++, Java, DBMS, and Data Structures",
      "Capstone academic development project in ASP.NET Core & SQL Server",
      "Strong academic standing under Shivaji University, Kolhapur"
    ],
    credential: null,
    image: null,
    link: null
  }
];

export function getAchievementBySlug(slug) {
  return achievementsData.find((a) => a.slug === slug);
}

