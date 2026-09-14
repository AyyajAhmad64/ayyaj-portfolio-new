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
 * Updates document title and meta description dynamically for route-based SEO
 */
export function updateSEO(title, description) {
  if (title) {
    document.title = `${title} | Ayyaj Kalandar Shaikh`;
  } else {
    document.title = "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing (MCA)";
  }

  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;
  }
}

