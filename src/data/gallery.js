/**
 * Centralized Gallery Data
 * Media and development showcase items supporting responsive lightbox and category filtering.
 */

export const galleryData = [
  {
    id: "gallery-profile",
    title: "Ayyaj Kalandar Shaikh — Professional Developer Profile",
    category: "Other",
    src: "/profile.jpg",
    thumbnail: "/profile.jpg",
    alt: "Portrait of Ayyaj Kalandar Shaikh, Full Stack & Cloud Computing Developer",
    date: "2026",
    caption: "Professional portrait of software engineer and MCA Cloud Computing student Ayyaj Kalandar Shaikh."
  },
  {
    id: "gallery-audit-desktop",
    title: "Portfolio Desktop Interface Audit & Architecture",
    category: "Projects",
    src: "/audit-desktop.png",
    thumbnail: "/audit-desktop.png",
    alt: "Desktop interface architecture and visual inspection of developer portfolio",
    date: "2026",
    caption: "High-resolution desktop interface architecture verification showing structured layouts, developer status panel, and typography balance."
  },
  {
    id: "gallery-audit-mobile",
    title: "Mobile Viewport Responsiveness Verification",
    category: "Projects",
    src: "/audit-mobile.png",
    thumbnail: "/audit-mobile.png",
    alt: "Mobile responsiveness audit displaying touch-friendly layout at 390px",
    date: "2026",
    caption: "Mobile viewport inspection verifying fluid layout stacking, accessible touch targets, and zero horizontal overflow on small screens."
  },
  {
    id: "gallery-audit-typography",
    title: "Typography System & Hierarchy Inspection",
    category: "Projects",
    src: "/audit-typography.png",
    thumbnail: "/audit-typography.png",
    alt: "Typography system audit testing JetBrains Mono scale and contrast ratios",
    date: "2026",
    caption: "Typography review testing JetBrains Mono scale, line-height geometry, and strict WCAG color contrast fidelity."
  }
];

/**
 * Automatically extracts only categories that actually contain items
 */
export function getGalleryCategories() {
  const set = new Set();
  galleryData.forEach((item) => {
    if (item.category) set.add(item.category);
  });
  return ["All", ...Array.from(set)];
}

