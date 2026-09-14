import { useEffect } from "react";
import { updateSEO } from "../utils/helpers";

export default function SEO({ title, description }) {
  useEffect(() => {
    updateSEO(title, description);
  }, [title, description]);

  return null;
}

