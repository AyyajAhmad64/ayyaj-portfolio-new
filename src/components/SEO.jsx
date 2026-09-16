import { useEffect } from "react";
import { updateSEO } from "../utils/helpers";

export default function SEO({
  title,
  description,
  image,
  type = "website",
  canonical,
  schema
}) {
  useEffect(() => {
    updateSEO({ title, description, image, type, canonical, schema });
  }, [title, description, image, type, canonical, schema]);

  return null;
}

