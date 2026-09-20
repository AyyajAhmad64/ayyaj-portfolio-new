/**
 * Slug & Title Collision Avoidance Utilities
 * Ensures cloned and duplicated items receive deterministic, collision-free slugs and titles.
 */

export function toKebabCase(str) {
  if (!str) return "";
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(baseText, existingSlugs = []) {
  const baseSlug = toKebabCase(baseText) || "item";
  const slugSet = new Set((existingSlugs || []).filter(Boolean).map((s) => s.toLowerCase()));

  // If already ends in -copy or -copy-N, strip it to find root
  let root = baseSlug;
  const copyMatch = root.match(/^(.*?)-copy(?:-(\d+))?$/);
  if (copyMatch) {
    root = copyMatch[1];
  }

  let candidate = `${root}-copy`;
  if (!slugSet.has(candidate)) {
    return candidate;
  }

  let counter = 2;
  while (slugSet.has(`${root}-copy-${counter}`)) {
    counter++;
  }
  return `${root}-copy-${counter}`;
}

export function generateUniqueTitle(baseTitle, existingTitles = []) {
  if (!baseTitle) return "Untitled Item (Copy)";
  const titleSet = new Set((existingTitles || []).filter(Boolean).map((t) => t.trim().toLowerCase()));

  let root = baseTitle.trim();
  const copyMatch = root.match(/^(.*?)\s*\(Copy(?:\s+(\d+))?\)$/i);
  if (copyMatch) {
    root = copyMatch[1].trim();
  }

  let candidate = `${root} (Copy)`;
  if (!titleSet.has(candidate.toLowerCase())) {
    return candidate;
  }

  let counter = 2;
  while (titleSet.has(`${root} (Copy ${counter})`.toLowerCase())) {
    counter++;
  }
  return `${root} (Copy ${counter})`;
}

