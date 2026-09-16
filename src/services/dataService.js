/**
 * Centralized Data & API Service Layer
 * Abstracts data storage and retrieval for all portfolio and admin entities.
 * Seamlessly bridges Supabase Cloud Database & Storage with local caching
 * and graceful fallback to verified initial data.
 */

import { profileData as initialProfile, recruiterProfile as initialRecruiter } from "../data/profile.js";
import { projectsData as initialProjects } from "../data/projects.js";
import { experienceData as initialExperience } from "../data/experience.js";
import { educationData as initialEducation } from "../data/education.js";
import { skillsData as initialSkills } from "../data/skills.js";
import { certificationsData as initialCertifications } from "../data/certifications.js";
import { achievementsData as initialAchievements } from "../data/achievements.js";
import { galleryData as initialGallery } from "../data/gallery.js";

import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import * as supabaseService from "./supabaseService.js";

const STORAGE_KEY = "ayyaj_platform_data_v4";

const initialSettings = {
  siteTitle: "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing",
  enableRecruiterMode: true,
  enableContactForm: true,
  primaryAccent: "#38bdf8",
  secondaryAccent: "#f59e0b",
  publicLocation: "Hinjawadi, Pune, Maharashtra, India",
  showAvailabilityBadge: true
};

function getStore() {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not read local data store:", err);
    }
  }

  // Initialize store with verified bundled data
  const store = {
    profile: initialProfile,
    recruiter: initialRecruiter,
    projects: initialProjects,
    experience: initialExperience,
    education: initialEducation,
    skills: initialSkills,
    certifications: initialCertifications,
    achievements: initialAchievements,
    gallery: initialGallery,
    settings: initialSettings,
    media: [
      { id: "m-profile", name: "profile.jpg", url: "/profile.jpg", type: "image/jpeg", size: "1.8 MB", date: "2026-09" },
      { id: "m-resume", name: "Ayyaj Kalandar Shaikh - Resume.pdf", url: "/Ayyaj Kalandar Shaikh - Resume.pdf", type: "application/pdf", size: "386 KB", date: "2026-09" }
    ]
  };

  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    saveStore(store);
  }
  return store;
}

function saveStore(data) {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      notifyListeners();
    } catch (err) {
      console.error("Could not write to local data store:", err);
    }
  }
}

// Simple event subscriber for live reactivity
const listeners = new Set();
function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function subscribeToData(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Synchronous getters (read from cached store)
export function getStoreSync() {
  return getStore();
}

export function getProfileSync() {
  return getStore().profile;
}

export function getProjectsSync() {
  return getStore().projects || [];
}

export function getExperienceSync() {
  return getStore().experience || [];
}

export function getEducationSync() {
  return getStore().education || [];
}

export function getSkillsSync() {
  return getStore().skills || [];
}

export function getCertificationsSync() {
  return getStore().certifications || [];
}

export function getAchievementsSync() {
  return getStore().achievements || [];
}

export function getGallerySync() {
  return getStore().gallery || [];
}

export function getRecruiterSync() {
  return getStore().recruiter;
}

export function getSettingsSync() {
  return getStore().settings;
}

/* ============================================================
   INITIALIZATION & CLOUD SYNC
   ============================================================ */

let isSyncing = false;

export async function syncWithSupabase() {
  if (!isSupabaseConfigured() || isSyncing) return;
  isSyncing = true;

  try {
    const store = getStore();

    // Fetch published entities concurrently from Supabase
    const [
      cloudProjects,
      cloudExperience,
      cloudEducation,
      cloudSkills,
      cloudCertifications,
      cloudAchievements,
      cloudGallery,
      cloudProfile,
      cloudRecruiter,
      cloudSettings
    ] = await Promise.allSettled([
      supabaseService.fetchPublishedProjects(),
      supabaseService.fetchPublishedExperiences(),
      supabaseService.fetchPublishedEducation(),
      supabaseService.fetchPublishedSkills(),
      supabaseService.fetchPublishedCertifications(),
      supabaseService.fetchPublishedAchievements(),
      supabaseService.fetchPublishedGallery(),
      supabaseService.fetchProfileFromDb(),
      supabaseService.fetchRecruiterFromDb(),
      supabaseService.fetchSiteSettingsFromDb()
    ]);

    let changed = false;

    // Always trust cloud data over local cache — even if cloud returns empty array.
    // This ensures admin deletes propagate correctly across devices.
    if (cloudProjects.status === "fulfilled" && Array.isArray(cloudProjects.value)) {
      store.projects = cloudProjects.value;
      changed = true;
    }
    if (cloudExperience.status === "fulfilled" && Array.isArray(cloudExperience.value)) {
      store.experience = cloudExperience.value;
      changed = true;
    }
    if (cloudEducation.status === "fulfilled" && Array.isArray(cloudEducation.value)) {
      store.education = cloudEducation.value;
      changed = true;
    }
    if (cloudSkills.status === "fulfilled" && Array.isArray(cloudSkills.value)) {
      store.skills = cloudSkills.value;
      changed = true;
    }
    if (cloudCertifications.status === "fulfilled" && Array.isArray(cloudCertifications.value)) {
      store.certifications = cloudCertifications.value;
      changed = true;
    }
    if (cloudAchievements.status === "fulfilled" && Array.isArray(cloudAchievements.value)) {
      store.achievements = cloudAchievements.value;
      changed = true;
    }
    if (cloudGallery.status === "fulfilled" && Array.isArray(cloudGallery.value)) {
      store.gallery = cloudGallery.value;
      changed = true;
    }
    if (cloudProfile.status === "fulfilled" && cloudProfile.value) {
      store.profile = { ...store.profile, ...cloudProfile.value };
      changed = true;
    }
    if (cloudRecruiter.status === "fulfilled" && cloudRecruiter.value) {
      store.recruiter = { ...store.recruiter, ...cloudRecruiter.value };
      changed = true;
    }
    if (cloudSettings.status === "fulfilled" && cloudSettings.value) {
      store.settings = { ...store.settings, ...cloudSettings.value };
      changed = true;
    }

    if (changed) {
      saveStore(store);
    }
  } catch (err) {
    console.warn("Supabase background sync encountered an error (using cached fallback):", err);
  } finally {
    isSyncing = false;
  }
}

// Trigger background sync on module load
if (typeof window !== "undefined") {
  syncWithSupabase();
}

/* ============================================================
   PROFILE API
   ============================================================ */
export async function getProfile() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchProfileFromDb();
    if (cloud) {
      const store = getStore();
      store.profile = { ...store.profile, ...cloud };
      saveStore(store);
      return store.profile;
    }
  }
  return getStore().profile;
}

function assertCloudConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Cloud CMS mutations require an active Supabase Cloud connection.");
  }
}

export async function updateProfile(updates) {
  assertCloudConfigured();
  const cloudUpdated = await supabaseService.updateProfileInDb(updates);
  if (!cloudUpdated) {
    throw new Error("Cloud save failed. Profile was not updated.");
  }
  const store = getStore();
  store.profile = { ...store.profile, ...cloudUpdated };
  saveStore(store);
  return store.profile;
}

/* ============================================================
   PROJECTS API
   ============================================================ */
export async function getProjects() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchAllProjectsAdmin();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.projects = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().projects || [];
}

export async function getProjectBySlug(slug) {
  const store = getStore();
  return (store.projects || []).find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveProject(project) {
  assertCloudConfigured();
  const savedProject = await supabaseService.upsertProject(project);
  if (!savedProject) {
    throw new Error("Cloud save failed. Project was not saved.");
  }

  const store = getStore();
  const list = store.projects || [];
  const existingIdx = list.findIndex((p) => p.id === savedProject.id || (savedProject.slug && p.slug === savedProject.slug));

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...savedProject, updatedAt: new Date().toISOString() };
  } else {
    list.unshift(savedProject);
  }

  store.projects = list;
  saveStore(store);
  return savedProject;
}

export async function deleteProject(id) {
  assertCloudConfigured();
  await supabaseService.deleteProjectFromDb(id);

  const store = getStore();
  store.projects = (store.projects || []).filter((p) => p.id !== id && p.slug !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   EXPERIENCE API
   ============================================================ */
export async function getExperience() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchPublishedExperiences();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.experience = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().experience || [];
}

export async function saveExperience(item) {
  assertCloudConfigured();
  const saved = await supabaseService.upsertExperience(item);
  if (!saved) {
    throw new Error("Cloud save failed. Experience was not saved.");
  }

  const store = getStore();
  const list = store.experience || [];
  const existingIdx = list.findIndex((e) => e.id === saved.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...saved };
  } else {
    list.unshift(saved);
  }

  store.experience = list;
  saveStore(store);
  return saved;
}

export async function deleteExperience(id) {
  assertCloudConfigured();
  await supabaseService.deleteExperienceFromDb(id);

  const store = getStore();
  store.experience = (store.experience || []).filter((e) => e.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   EDUCATION API
   ============================================================ */
export async function getEducation() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchPublishedEducation();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.education = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().education || [];
}

export async function saveEducation(item) {
  assertCloudConfigured();
  const saved = await supabaseService.upsertEducation(item);
  if (!saved) {
    throw new Error("Cloud save failed. Education was not saved.");
  }

  const store = getStore();
  const list = store.education || [];
  const existingIdx = list.findIndex((e) => e.id === saved.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...saved };
  } else {
    list.push(saved);
  }

  store.education = list;
  saveStore(store);
  return saved;
}

export async function deleteEducation(id) {
  assertCloudConfigured();
  await supabaseService.deleteEducationFromDb(id);

  const store = getStore();
  store.education = (store.education || []).filter((e) => e.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   SKILLS API
   ============================================================ */
export async function getSkills() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchPublishedSkills();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.skills = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().skills || [];
}

export async function saveSkills(skillsGroupList) {
  assertCloudConfigured();
  await supabaseService.upsertSkillsBatch(skillsGroupList);

  const store = getStore();
  store.skills = skillsGroupList;
  saveStore(store);
  return store.skills;
}

/* ============================================================
   CERTIFICATIONS API
   ============================================================ */
export async function getCertifications() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchPublishedCertifications();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.certifications = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().certifications || [];
}

export async function saveCertification(cert) {
  assertCloudConfigured();
  const saved = await supabaseService.upsertCertification(cert);
  if (!saved) {
    throw new Error("Cloud save failed. Certification was not saved.");
  }

  const store = getStore();
  const list = store.certifications || [];
  const existingIdx = list.findIndex((c) => c.id === saved.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...saved };
  } else {
    list.unshift(saved);
  }

  store.certifications = list;
  saveStore(store);
  return saved;
}

export async function deleteCertification(id) {
  assertCloudConfigured();
  await supabaseService.deleteCertificationFromDb(id);

  const store = getStore();
  store.certifications = (store.certifications || []).filter((c) => c.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   ACHIEVEMENTS API
   ============================================================ */
export async function getAchievements() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchPublishedAchievements();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.achievements = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().achievements || [];
}

export async function saveAchievement(ach) {
  assertCloudConfigured();
  const saved = await supabaseService.upsertAchievement(ach);
  if (!saved) {
    throw new Error("Cloud save failed. Achievement was not saved.");
  }

  const store = getStore();
  const list = store.achievements || [];
  const existingIdx = list.findIndex((a) => a.id === saved.id || (saved.slug && a.slug === saved.slug));
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...saved };
  } else {
    list.unshift(saved);
  }

  store.achievements = list;
  saveStore(store);
  return saved;
}

export async function deleteAchievement(id) {
  assertCloudConfigured();
  await supabaseService.deleteAchievementFromDb(id);

  const store = getStore();
  store.achievements = (store.achievements || []).filter((a) => a.id !== id && a.slug !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   GALLERY API
   ============================================================ */
export async function getGallery() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchPublishedGallery();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.gallery = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().gallery || [];
}

export async function saveGalleryItem(item) {
  assertCloudConfigured();
  const saved = await supabaseService.upsertGalleryItem(item);
  if (!saved) {
    throw new Error("Cloud save failed. Gallery item was not saved.");
  }

  const store = getStore();
  const list = store.gallery || [];
  const existingIdx = list.findIndex((g) => g.id === saved.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...saved };
  } else {
    list.unshift(saved);
  }

  store.gallery = list;
  saveStore(store);
  return saved;
}

export async function deleteGalleryItem(id) {
  assertCloudConfigured();
  await supabaseService.deleteGalleryItemFromDb(id);

  const store = getStore();
  store.gallery = (store.gallery || []).filter((g) => g.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   RECRUITER & SETTINGS API
   ============================================================ */
export async function getRecruiterData() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchRecruiterFromDb();
    if (cloud) {
      const store = getStore();
      store.recruiter = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().recruiter || initialRecruiter;
}

export async function updateRecruiterData(updates) {
  assertCloudConfigured();
  const saved = await supabaseService.updateRecruiterInDb(updates);
  if (!saved) {
    throw new Error("Cloud save failed. Recruiter data was not updated.");
  }

  const store = getStore();
  store.recruiter = { ...store.recruiter, ...saved };
  saveStore(store);
  return store.recruiter;
}

export async function getSettings() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchSiteSettingsFromDb();
    if (cloud) {
      const store = getStore();
      store.settings = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().settings || initialSettings;
}

export async function updateSettings(updates) {
  assertCloudConfigured();
  const saved = await supabaseService.updateSiteSettingsInDb(updates);
  if (!saved) {
    throw new Error("Cloud save failed. Site settings were not updated.");
  }

  const store = getStore();
  store.settings = { ...store.settings, ...saved };
  saveStore(store);
  return store.settings;
}

/* ============================================================
   MEDIA CATALOG & STORAGE API
   ============================================================ */
export async function getMedia() {
  if (isSupabaseConfigured()) {
    const cloud = await supabaseService.fetchMediaCatalog();
    if (cloud && cloud.length > 0) {
      const store = getStore();
      store.media = cloud;
      saveStore(store);
      return cloud;
    }
  }
  return getStore().media || [];
}

export async function saveMediaItem(item) {
  assertCloudConfigured();
  const saved = await supabaseService.upsertMediaItem(item);
  if (!saved) {
    throw new Error("Cloud save failed. Media item was not saved.");
  }

  const store = getStore();
  const list = store.media || [];
  const existingIdx = list.findIndex((m) => m.id === saved.id);
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...saved };
  } else {
    list.unshift(saved);
  }
  store.media = list;
  saveStore(store);
  return saved;
}

export async function deleteMediaItem(id, storagePath = null) {
  assertCloudConfigured();
  await supabaseService.deleteMediaFromStorage(storagePath, id);

  const store = getStore();
  store.media = (store.media || []).filter((m) => m.id !== id);
  saveStore(store);
  return true;
}

export async function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEY);
  notifyListeners();
  return getStore();
}
