/**
 * Shared Helper Utilities
 */

/**
 * Copies plain text to user clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Fallback below
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}

/**
 * Sets or updates a meta tag by attribute and key.
 */
function setMetaTag(attr, key, content) {
  if (!content) return;
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/**
 * Sets or updates a link tag by rel.
 */
function setLinkTag(rel, href) {
  if (!href) return;
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * Injects or updates Schema.org JSON-LD structured data.
 */
function setStructuredData(data) {
  let script = document.getElementById("schema-structured-data");
  if (!data) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.id = "schema-structured-data";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Updates document title, meta description, canonical link, OpenGraph,
 * Twitter cards, and Schema.org structured data dynamically for route-based SEO.
 */
export function updateSEO(options, legacyDesc) {
  let title = options;
  let description = legacyDesc;
  let image = null;
  let type = "website";
  let canonical = null;
  let schema = null;

  if (typeof options === "object" && options !== null) {
    title = options.title;
    description = options.description;
    image = options.image;
    type = options.type || "website";
    canonical = options.canonical;
    schema = options.schema;
  }

  const baseTitle = "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing (MCA)";
  const pageTitle = (!title || title === "Home") ? baseTitle : `${title} | Ayyaj Kalandar Shaikh`;
  document.title = pageTitle;

  const defaultDesc =
    "Ayyaj Kalandar Shaikh — Software Developer & Full Stack Engineer specializing in Java, Spring Boot, React.js, and Cloud Computing (MCA).";
  const desc = description || defaultDesc;

  const envOrigin = typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL;
  const origin = envOrigin
    ? envOrigin.replace(/\/+$/, "")
    : (typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://ayyajahmad64.github.io");

  const currentUrl = typeof window !== "undefined" ? window.location.href : origin;
  const canonicalUrl = canonical || currentUrl;

  const resolvedImage = image
    ? (image.startsWith("http") ? image : `${origin}${image.startsWith("/") ? "" : "/"}${image}`)
    : `${origin}/profile.jpg`;

  // Standard Meta Tags
  setMetaTag("name", "description", desc);

  // Canonical Link
  setLinkTag("canonical", canonicalUrl);

  // Open Graph
  setMetaTag("property", "og:title", pageTitle);
  setMetaTag("property", "og:description", desc);
  setMetaTag("property", "og:type", type);
  setMetaTag("property", "og:url", canonicalUrl);
  setMetaTag("property", "og:image", resolvedImage);

  // Twitter / X Card
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", pageTitle);
  setMetaTag("name", "twitter:description", desc);
  setMetaTag("name", "twitter:image", resolvedImage);

  // Schema.org Structured Data
  if (schema) {
    setStructuredData(schema);
  } else {
    // Default baseline Person + WebSite schema (Public only, strict privacy adherence)
    setStructuredData({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${origin}/#website`,
          "url": origin,
          "name": "Ayyaj Kalandar Shaikh — Developer Platform",
          "description": desc
        },
        {
          "@type": "Person",
          "@id": `${origin}/#person`,
          "name": "Ayyaj Kalandar Shaikh",
          "url": origin,
          "jobTitle": "Software Developer & Cloud Computing (MCA)",
          "image": `${origin}/profile.jpg`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Pune",
            "addressRegion": "Maharashtra",
            "addressCountry": "India"
          },
          "sameAs": [
            "https://github.com/AyyajAhmad64",
            "https://www.linkedin.com/in/ayyajahmad86"
          ],
          "knowsAbout": [
            "Java",
            "Spring Boot",
            "React.js",
            "Cloud Computing",
            "AWS",
            "PostgreSQL",
            "Microservices"
          ]
        }
      ]
    });
  }
}
