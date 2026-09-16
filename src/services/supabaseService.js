/**
 * Centralized Supabase Cloud Service Layer
 * Direct interface for Supabase PostgreSQL tables, Supabase Storage buckets,
 * and authenticated CRUD operations.
 * Includes bi-directional mapping between database schema (snake_case)
 * and React application models (camelCase).
 */

import { supabase, isSupabaseConfigured } from "../lib/supabaseClient.js";

/* ============================================================
   PROJECTS SERVICE
   ============================================================ */

export async function fetchPublishedProjects() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_images (
          id,
          image_url,
          storage_path,
          alt_text,
          caption,
          sort_order
        )
      `)
      .eq("publication_status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapProjectFromDb);
  } catch (err) {
    console.error("Supabase: Error fetching published projects:", err);
    return null;
  }
}

export async function fetchAllProjectsAdmin() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_images (
          id,
          image_url,
          storage_path,
          alt_text,
          caption,
          sort_order
        )
      `)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapProjectFromDb);
  } catch (err) {
    console.error("Supabase: Error fetching admin projects:", err);
    return null;
  }
}

export async function upsertProject(project, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const dbPayload = mapProjectToDb(project);
    const { data, error } = await supabase
      .from("projects")
      .upsert(dbPayload, { onConflict: "slug" })
      .select()
      .single();

    if (error) throw error;

    // Handle project images if provided
    if (project.images && Array.isArray(project.images) && data?.id) {
      // Delete old relations and re-insert
      await supabase.from("project_images").delete().eq("project_id", data.id);
      if (project.images.length > 0) {
        const imageRows = project.images.map((imgUrl, idx) => ({
          project_id: data.id,
          image_url: imgUrl,
          sort_order: idx + 1
        }));
        await supabase.from("project_images").insert(imageRows);
      }
    }

    // Record audit log & version
    await recordAuditLog("UPSERT", "project", data.id, { title: project.title }, actorEmail);
    await recordContentVersion("project", data.id, project, actorEmail);

    return mapProjectFromDb(data);
  } catch (err) {
    console.error("Supabase: Error saving project:", err);
    throw err;
  }
}

export async function deleteProjectFromDb(idOrSlug, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    // Can be UUID or slug
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrSlug);
    const query = supabase.from("projects").delete();
    const { data, error } = isUuid
      ? await query.eq("id", idOrSlug).select()
      : await query.eq("slug", idOrSlug).select();

    if (error) throw error;
    await recordAuditLog("DELETE", "project", idOrSlug, {}, actorEmail);
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting project:", err);
    throw err;
  }
}

/* ============================================================
   EXPERIENCES SERVICE
   ============================================================ */

export async function fetchPublishedExperiences() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("publication_status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapExperienceFromDb);
  } catch (err) {
    console.error("Supabase: Error fetching experiences:", err);
    return null;
  }
}

export async function upsertExperience(exp, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      id: /^[0-9a-fA-F-]{36}$/.test(exp.id) ? exp.id : undefined,
      company: exp.company,
      role: exp.role,
      location: exp.location,
      employment_type: exp.employmentType || exp.employment_type || "Internship",
      start_date: exp.startDate || exp.start_date,
      end_date: exp.endDate || exp.end_date,
      duration: exp.duration,
      current: Boolean(exp.current),
      description: exp.description,
      technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      publication_status: exp.publicationStatus || exp.publication_status || "published",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("experiences")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPSERT", "experience", data.id, { company: exp.company }, actorEmail);
    return mapExperienceFromDb(data);
  } catch (err) {
    console.error("Supabase: Error saving experience:", err);
    throw err;
  }
}

export async function deleteExperienceFromDb(id, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const { error } = await supabase.from("experiences").delete().eq("id", id);
    if (error) throw error;
    await recordAuditLog("DELETE", "experience", id, {}, actorEmail);
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting experience:", err);
    throw err;
  }
}

/* ============================================================
   EDUCATION SERVICE
   ============================================================ */

export async function fetchPublishedEducation() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .eq("publication_status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapEducationFromDb);
  } catch (err) {
    console.error("Supabase: Error fetching education:", err);
    return null;
  }
}

export async function upsertEducation(edu, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      id: /^[0-9a-fA-F-]{36}$/.test(edu.id) ? edu.id : undefined,
      institution: edu.institution,
      degree: edu.degree,
      specialization: edu.specialization,
      location: edu.location,
      start_date: edu.startDate || edu.start_date,
      end_date: edu.endDate || edu.end_date,
      year: edu.year,
      status: edu.status || "Completed",
      current: Boolean(edu.current),
      description: edu.description,
      highlights: Array.isArray(edu.highlights) ? edu.highlights : [],
      publication_status: edu.publicationStatus || edu.publication_status || "published",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("education")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPSERT", "education", data.id, { institution: edu.institution }, actorEmail);
    return mapEducationFromDb(data);
  } catch (err) {
    console.error("Supabase: Error saving education:", err);
    throw err;
  }
}

export async function deleteEducationFromDb(id, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const { error } = await supabase.from("education").delete().eq("id", id);
    if (error) throw error;
    await recordAuditLog("DELETE", "education", id, {}, actorEmail);
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting education:", err);
    throw err;
  }
}

/* ============================================================
   SKILLS SERVICE
   ============================================================ */

export async function fetchPublishedSkills() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("publication_status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return groupSkillsByCategory(data || []);
  } catch (err) {
    console.error("Supabase: Error fetching skills:", err);
    return null;
  }
}

export async function upsertSkillsBatch(groupedSkills, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    // Flatten grouped skills into individual skill rows
    const rows = [];
    let order = 1;
    for (const group of groupedSkills) {
      for (const skill of group.skills || []) {
        rows.push({
          category: group.category,
          category_badge: group.badge || group.category_badge,
          category_description: group.description || group.category_description,
          name: typeof skill === "string" ? skill : skill.name,
          level: skill.level || "Proficient",
          core: Boolean(skill.core),
          sort_order: order++,
          publication_status: "published",
          updated_at: new Date().toISOString()
        });
      }
    }

    // Replace existing skills in db
    await supabase.from("skills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase.from("skills").insert(rows);
    if (error) throw error;

    await recordAuditLog("BATCH_UPDATE", "skills", null, { count: rows.length }, actorEmail);
    return groupedSkills;
  } catch (err) {
    console.error("Supabase: Error saving skills batch:", err);
    throw err;
  }
}

/* ============================================================
   CERTIFICATIONS SERVICE
   ============================================================ */

export async function fetchPublishedCertifications() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("publication_status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapCertificationFromDb);
  } catch (err) {
    console.error("Supabase: Error fetching certifications:", err);
    return null;
  }
}

export async function upsertCertification(cert, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      id: /^[0-9a-fA-F-]{36}$/.test(cert.id) ? cert.id : undefined,
      title: cert.name || cert.title,
      issuer: cert.issuer,
      date: cert.date,
      status: cert.status || "Active",
      credential_id: cert.credentialId || cert.credential_id,
      certificate_url: cert.certificateUrl || cert.certificate_url,
      verification_url: cert.verificationUrl || cert.verification_url,
      description: cert.description,
      skills: Array.isArray(cert.skills) ? cert.skills : [],
      publication_status: cert.publicationStatus || cert.publication_status || "published",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("certifications")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPSERT", "certification", data.id, { title: cert.name || cert.title }, actorEmail);
    return mapCertificationFromDb(data);
  } catch (err) {
    console.error("Supabase: Error saving certification:", err);
    throw err;
  }
}

export async function deleteCertificationFromDb(id, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const { error } = await supabase.from("certifications").delete().eq("id", id);
    if (error) throw error;
    await recordAuditLog("DELETE", "certification", id, {}, actorEmail);
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting certification:", err);
    throw err;
  }
}

/* ============================================================
   ACHIEVEMENTS SERVICE
   ============================================================ */

export async function fetchPublishedAchievements() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("publication_status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapAchievementFromDb);
  } catch (err) {
    console.error("Supabase: Error fetching achievements:", err);
    return null;
  }
}

export async function upsertAchievement(ach, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      id: /^[0-9a-fA-F-]{36}$/.test(ach.id) ? ach.id : undefined,
      slug: ach.slug || ach.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: ach.title,
      type: ach.type,
      organization: ach.organization,
      date: ach.date,
      description: ach.description,
      impact: ach.impact,
      highlights: Array.isArray(ach.highlights) ? ach.highlights : [],
      credential: ach.credential,
      image: ach.image,
      link: ach.link,
      publication_status: ach.publicationStatus || ach.publication_status || "published",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("achievements")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPSERT", "achievement", data.id, { title: ach.title }, actorEmail);
    return mapAchievementFromDb(data);
  } catch (err) {
    console.error("Supabase: Error saving achievement:", err);
    throw err;
  }
}

export async function deleteAchievementFromDb(idOrSlug, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrSlug);
    const query = supabase.from("achievements").delete();
    const { error } = isUuid ? await query.eq("id", idOrSlug) : await query.eq("slug", idOrSlug);
    if (error) throw error;
    await recordAuditLog("DELETE", "achievement", idOrSlug, {}, actorEmail);
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting achievement:", err);
    throw err;
  }
}

/* ============================================================
   GALLERY SERVICE
   ============================================================ */

export async function fetchPublishedGallery() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .eq("publication_status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapGalleryFromDb);
  } catch (err) {
    console.error("Supabase: Error fetching gallery:", err);
    return null;
  }
}

export async function upsertGalleryItem(item, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      id: /^[0-9a-fA-F-]{36}$/.test(item.id) ? item.id : undefined,
      image_url: item.src || item.imageUrl || item.image_url,
      storage_path: item.storagePath || item.storage_path,
      title: item.title,
      caption: item.caption,
      category: item.category || "Projects",
      publication_status: item.publicationStatus || item.publication_status || "published",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("gallery")
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPSERT", "gallery", data.id, { title: item.title }, actorEmail);
    return mapGalleryFromDb(data);
  } catch (err) {
    console.error("Supabase: Error saving gallery item:", err);
    throw err;
  }
}

export async function deleteGalleryItemFromDb(id, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) throw error;
    await recordAuditLog("DELETE", "gallery", id, {}, actorEmail);
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting gallery item:", err);
    throw err;
  }
}

/* ============================================================
   PROFILE & SETTINGS SERVICE
   ============================================================ */

export async function fetchProfileFromDb() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapProfileFromDb(data);
  } catch (err) {
    console.error("Supabase: Error fetching profile:", err);
    return null;
  }
}

export async function updateProfileInDb(updates, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = mapProfileToDb(updates);
    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPDATE", "profile", "primary", updates, actorEmail);
    return mapProfileFromDb(data);
  } catch (err) {
    console.error("Supabase: Error updating profile:", err);
    throw err;
  }
}

export async function fetchRecruiterFromDb() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("recruiter_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return {
      summary: data.summary,
      availability: data.availability,
      targetRoles: data.target_roles || [],
      highlights: data.highlights || [],
      coreMetrics: data.core_metrics || []
    };
  } catch (err) {
    console.error("Supabase: Error fetching recruiter settings:", err);
    return null;
  }
}

export async function updateRecruiterInDb(updates, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      summary: updates.summary,
      availability: updates.availability,
      target_roles: updates.targetRoles || updates.target_roles,
      highlights: updates.highlights,
      core_metrics: updates.coreMetrics || updates.core_metrics,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from("recruiter_settings")
      .update(payload)
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPDATE", "recruiter_settings", "primary", updates, actorEmail);
    return {
      summary: data.summary,
      availability: data.availability,
      targetRoles: data.target_roles || [],
      highlights: data.highlights || [],
      coreMetrics: data.core_metrics || []
    };
  } catch (err) {
    console.error("Supabase: Error updating recruiter settings:", err);
    throw err;
  }
}

export async function fetchSiteSettingsFromDb() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return {
      siteTitle: data.site_title,
      enableRecruiterMode: data.enable_recruiter_mode,
      enableContactForm: data.enable_contact_form,
      primaryAccent: data.primary_accent,
      secondaryAccent: data.secondary_accent,
      publicLocation: data.public_location,
      showAvailabilityBadge: data.show_availability_badge
    };
  } catch (err) {
    console.error("Supabase: Error fetching site settings:", err);
    return null;
  }
}

export async function updateSiteSettingsInDb(updates, actorEmail = "admin") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      site_title: updates.siteTitle,
      enable_recruiter_mode: updates.enableRecruiterMode,
      enable_contact_form: updates.enableContactForm,
      primary_accent: updates.primaryAccent,
      secondary_accent: updates.secondaryAccent,
      public_location: updates.publicLocation,
      show_availability_badge: updates.showAvailabilityBadge,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from("site_settings")
      .update(payload)
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .select()
      .single();

    if (error) throw error;
    await recordAuditLog("UPDATE", "site_settings", "primary", updates, actorEmail);
    return {
      siteTitle: data.site_title,
      enableRecruiterMode: data.enable_recruiter_mode,
      enableContactForm: data.enable_contact_form,
      primaryAccent: data.primary_accent,
      secondaryAccent: data.secondary_accent,
      publicLocation: data.public_location,
      showAvailabilityBadge: data.show_availability_badge
    };
  } catch (err) {
    console.error("Supabase: Error updating site settings:", err);
    throw err;
  }
}

/* ============================================================
   STORAGE UPLOADS (portfolio-media & resume)
   ============================================================ */

/**
 * Uploads a binary file to Supabase Storage bucket and creates a media table record
 */
export async function uploadMediaFile(file, bucket = "portfolio-media", folder = "uploads") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.");
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    console.error("Supabase Storage upload error:", uploadError);
    throw uploadError;
  }

  // Retrieve public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;

  // Insert into media catalog table
  try {
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    await supabase.from("media").insert({
      file_name: file.name,
      storage_path: filePath,
      public_url: publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      category: bucket === "resume" ? "document" : "image",
      alt_text: file.name
    });
  } catch (e) {
    console.warn("Could not insert media metadata row:", e);
  }

  return {
    path: filePath,
    url: publicUrl,
    name: file.name,
    type: file.type,
    size: file.size
  };
}

export async function fetchMediaCatalog() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((m) => ({
      id: m.id,
      name: m.file_name,
      url: m.public_url,
      storagePath: m.storage_path,
      type: m.mime_type,
      size: m.size_bytes ? `${Math.round(m.size_bytes / 1024)} KB` : "N/A",
      date: (m.created_at || "").slice(0, 7)
    }));
  } catch (err) {
    console.error("Supabase: Error fetching media catalog:", err);
    return null;
  }
}

export async function deleteMediaFromStorage(storagePath, id = null, bucket = "portfolio-media") {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Media deletion requires an active Supabase Cloud connection.");
  }
  try {
    if (storagePath) {
      const { error: storageErr } = await supabase.storage.from(bucket).remove([storagePath]);
      if (storageErr) {
        console.error("Supabase Storage error deleting file:", storageErr);
      }
    }
    if (id) {
      const { error: dbErr } = await supabase.from("media").delete().eq("id", id);
      if (dbErr) throw dbErr;
    }
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting media:", err);
    throw err;
  }
}

export async function upsertMediaItem(item) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud media save requires an active Supabase Cloud connection.");
  }
  try {
    const payload = {
      file_name: item.name,
      storage_path: item.storagePath || "",
      public_url: item.url,
      mime_type: item.type || "image/jpeg",
      size_bytes: typeof item.size === "number" ? item.size : null,
      category: item.category || (item.type === "application/pdf" ? "document" : "image"),
      alt_text: item.altText || item.name
    };
    if (item.id && /^[0-9a-fA-F-]{36}$/.test(item.id)) {
      payload.id = item.id;
    } else if (payload.storage_path || payload.public_url) {
      // Idempotency guard: if a media record with the same storage_path or public_url already exists, update it instead of duplicating
      let query = supabase.from("media").select("id");
      if (payload.storage_path) {
        query = query.eq("storage_path", payload.storage_path);
      } else {
        query = query.eq("public_url", payload.public_url);
      }
      const { data: existing } = await query.maybeSingle();
      if (existing?.id) {
        payload.id = existing.id;
      }
    }
    const { data, error } = await supabase.from("media").upsert(payload).select().single();
    if (error) throw error;
    return {
      id: data.id,
      name: data.file_name,
      url: data.public_url,
      storagePath: data.storage_path,
      type: data.mime_type,
      size: data.size_bytes ? `${Math.round(data.size_bytes / 1024)} KB` : item.size || "Unknown",
      date: (data.created_at || "").slice(0, 7)
    };
  } catch (err) {
    console.error("Supabase: Error saving media item:", err);
    throw err;
  }
}

/* ============================================================
   RESUME VERSIONS SERVICE
   ============================================================ */

export async function fetchActiveResumeVersion() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("resume_versions")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase: Error fetching active resume:", err);
    return null;
  }
}

export async function fetchResumeVersionsList() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("resume_versions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase: Error fetching resume versions:", err);
    return null;
  }
}

export async function uploadResumeVersion(file, versionStr = "v2026", notes = "", makeActive = true) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Resume upload requires an active Supabase Cloud connection.");
  }
  try {
    const uploadRes = await uploadMediaFile(file, "resume", "resumes");
    if (makeActive) {
      await supabase.from("resume_versions").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data, error } = await supabase
      .from("resume_versions")
      .insert({
        title: file.name,
        file_url: uploadRes.url,
        storage_path: uploadRes.path,
        version: versionStr,
        is_active: makeActive,
        file_size_bytes: file.size,
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase: Error uploading resume version:", err);
    throw err;
  }
}

/* ============================================================
   MESSAGES INBOX (CONTACT FORM)
   ============================================================ */

export async function submitContactMessage({ name, email, subject, message }) {
  if (!isSupabaseConfigured()) return { success: false, reason: "unconfigured" };
  try {
    const { data, error } = await supabase.from("messages").insert({
      name,
      email,
      subject: subject || "Portfolio Inbound Inquiry",
      message,
      status: "unread"
    }).select().single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Supabase: Error submitting message:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchMessagesInbox() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase: Error fetching messages inbox:", err);
    return [];
  }
}

export async function updateMessageStatus(id, status) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Message updates require an active Supabase Cloud connection.");
  }
  try {
    const { error } = await supabase
      .from("messages")
      .update({ status })
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase: Error updating message status:", err);
    throw err;
  }
}

export async function deleteMessage(id) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Message deletion requires an active Supabase Cloud connection.");
  }
  try {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase: Error deleting message:", err);
    throw err;
  }
}

/* ============================================================
   ANALYTICS, AUDIT LOGS & VERSIONS
   ============================================================ */

const ALLOWED_ANALYTICS_EVENTS = new Set([
  "page_view",
  "project_view",
  "resume_view",
  "resume_download",
  "recruiter_mode_visit",
  "contact_click",
  "github_click",
  "linkedin_click"
]);

export async function logAnalyticsEvent(eventName, pagePath, metadata = {}) {
  if (!isSupabaseConfigured()) return;
  const normalizedEvent = String(eventName || "").toLowerCase().trim();
  if (!ALLOWED_ANALYTICS_EVENTS.has(normalizedEvent)) {
    return; // Ignore / reject unknown event names
  }

  try {
    const safeMetadata = typeof metadata === "object" && metadata !== null ? metadata : {};
    const serialized = JSON.stringify(safeMetadata);
    if (serialized.length > 2048) {
      return; // Reject excessively large metadata payloads
    }

    await supabase.from("analytics_events").insert({
      event_name: normalizedEvent,
      page_path: (pagePath || (typeof window !== "undefined" ? window.location.pathname : "/")).slice(0, 255),
      metadata: safeMetadata
    });
  } catch {
    // Non-blocking telemetry
  }
}

export async function recordAuditLog(action, entityType, entityId, details = {}, actorEmail = "admin") {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from("audit_logs").insert({
      action,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      details,
      actor_email: actorEmail
    });
  } catch (err) {
    console.warn("Could not write audit log:", err);
  }
}

export async function fetchAuditLogs() {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase: Error fetching audit logs:", err);
    return [];
  }
}

export async function recordContentVersion(entityType, entityId, data, changedBy = "admin") {
  if (!isSupabaseConfigured()) return;
  try {
    // Count previous versions
    const { count } = await supabase
      .from("content_versions")
      .select("*", { count: "exact", head: true })
      .eq("entity_type", entityType)
      .eq("entity_id", String(entityId));

    await supabase.from("content_versions").insert({
      entity_type: entityType,
      entity_id: String(entityId),
      version_number: (count || 0) + 1,
      data,
      changed_by: changedBy
    });
  } catch (err) {
    console.warn("Could not write content version:", err);
  }
}

export async function fetchContentVersions(entityType, entityId) {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from("content_versions")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", String(entityId))
      .order("version_number", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase: Error fetching content versions:", err);
    return [];
  }
}

/* ============================================================
   DATA MAPPERS (Snake <-> Camel)
   ============================================================ */

function mapProjectFromDb(row) {
  if (!row) return null;
  const images = (row.project_images || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((img) => img.image_url);

  // If thumbnail exists and not in images, prepend it
  if (row.thumbnail && !images.includes(row.thumbnail)) {
    images.unshift(row.thumbnail);
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    status: row.status,
    featured: Boolean(row.featured),
    publicationStatus: row.publication_status,
    category: Array.isArray(row.category) ? row.category : [],
    stack: Array.isArray(row.tech_stack) ? row.tech_stack.join(" / ") : row.type || "",
    description: row.short_description || row.full_description || "",
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    problem: row.problem,
    solution: row.solution,
    technologies: Array.isArray(row.tech_stack) ? row.tech_stack : [],
    features: Array.isArray(row.features) ? row.features : [],
    architecture: row.architecture,
    challenges: row.challenges,
    learnings: row.learnings,
    github: row.github_url,
    liveDemo: row.live_url,
    thumbnail: row.thumbnail,
    images
  };
}

function mapProjectToDb(p) {
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(p.id);
  return {
    id: isUuid ? p.id : undefined,
    slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: p.title,
    type: p.type,
    short_description: p.description || p.shortDescription,
    full_description: p.fullDescription || p.description,
    status: p.status || "In Development",
    featured: Boolean(p.featured),
    thumbnail: p.thumbnail,
    live_url: p.liveDemo || p.live_url || null,
    github_url: p.github || p.github_url || null,
    category: Array.isArray(p.category) ? p.category : [],
    tech_stack: Array.isArray(p.technologies) ? p.technologies : [],
    features: Array.isArray(p.features) ? p.features : [],
    problem: p.problem,
    solution: p.solution,
    architecture: p.architecture,
    challenges: p.challenges,
    learnings: p.learnings,
    publication_status: p.publicationStatus || p.publication_status || "published",
    updated_at: new Date().toISOString()
  };
}

function mapExperienceFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location,
    employmentType: row.employment_type,
    startDate: row.start_date,
    endDate: row.end_date,
    duration: row.duration,
    current: Boolean(row.current),
    description: row.description,
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    publicationStatus: row.publication_status
  };
}

function mapEducationFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    specialization: row.specialization,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    year: row.year,
    status: row.status,
    current: Boolean(row.current),
    description: row.description,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    publicationStatus: row.publication_status
  };
}

function mapCertificationFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.title,
    title: row.title,
    issuer: row.issuer,
    date: row.date,
    status: row.status,
    credentialId: row.credential_id,
    certificateUrl: row.certificate_url,
    verificationUrl: row.verification_url,
    description: row.description,
    skills: Array.isArray(row.skills) ? row.skills : [],
    publicationStatus: row.publication_status
  };
}

function mapAchievementFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    organization: row.organization,
    date: row.date,
    description: row.description,
    impact: row.impact,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    credential: row.credential,
    image: row.image,
    link: row.link,
    publicationStatus: row.publication_status
  };
}

function mapGalleryFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    src: row.image_url,
    thumbnail: row.image_url,
    title: row.title,
    caption: row.caption,
    category: row.category,
    alt: row.title,
    storagePath: row.storage_path,
    publicationStatus: row.publication_status
  };
}

function mapProfileFromDb(row) {
  if (!row) return null;
  return {
    name: row.name,
    shortName: row.short_name,
    title: row.title,
    headline: row.headline,
    currentRole: row.current_position,
    educationDegree: row.education_degree,
    educationSpecialization: row.education_specialization,
    educationInstitution: row.education_institution,
    location: row.location || "Hinjawadi, Pune, Maharashtra, India",
    fullAddress: row.location || "Hinjawadi, Pune, Maharashtra, India",
    addressLines: [row.location || "Hinjawadi, Pune, Maharashtra, India"],
    availability: row.availability,
    status: row.status,
    bio: row.bio,
    aboutDetailed: row.about_detailed || [],
    snapshot: row.snapshot || {},
    contact: row.contact || {},
    primarySkills: Array.isArray(row.primary_skills) ? row.primary_skills : []
  };
}

function mapProfileToDb(p) {
  return {
    name: p.name,
    short_name: p.shortName,
    title: p.title,
    headline: p.headline,
    current_position: p.currentRole,
    education_degree: p.educationDegree,
    education_specialization: p.educationSpecialization,
    education_institution: p.educationInstitution,
    location: p.location || "Hinjawadi, Pune, Maharashtra, India",
    availability: p.availability,
    status: p.status,
    bio: p.bio,
    about_detailed: p.aboutDetailed,
    snapshot: p.snapshot,
    contact: p.contact,
    primary_skills: p.primarySkills,
    updated_at: new Date().toISOString()
  };
}

function groupSkillsByCategory(skillRows) {
  const categoryMap = new Map();

  for (const row of skillRows) {
    const cat = row.category || "GENERAL";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        category: cat,
        badge: row.category_badge || "Competency",
        description: row.category_description || "",
        skills: []
      });
    }

    categoryMap.get(cat).skills.push({
      name: row.name,
      level: row.level || "Proficient",
      core: Boolean(row.core)
    });
  }

  return Array.from(categoryMap.values());
}

