/**
 * Centralized Data & API Service Layer
 * Abstracts data storage and retrieval for all portfolio and admin entities.
 * Currently uses persistent browser storage (localStorage) with verified initial data,
 * fully prepared to swap to RESTful endpoints (fetch/axios) when a backend is connected.
 */

import { profileData as initialProfile, recruiterProfile as initialRecruiter } from "../data/profile.js";
import { projectsData as initialProjects } from "../data/projects.js";
import { experienceData as initialExperience } from "../data/experience.js";
import { educationData as initialEducation } from "../data/education.js";
import { skillsData as initialSkills } from "../data/skills.js";
import { certificationsData as initialCertifications } from "../data/certifications.js";
import { achievementsData as initialAchievements } from "../data/achievements.js";
import { galleryData as initialGallery } from "../data/gallery.js";

const STORAGE_KEY = "ayyaj_platform_data_v3";

const initialSettings = {
  siteTitle: "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing",
  enableRecruiterMode: true,
  enableContactForm: false, // direct contact actions preferred
  primaryAccent: "#38bdf8",
  secondaryAccent: "#f59e0b",
  publicLocation: "Hinjawadi, Pune, Maharashtra, India",
  fullAddress: "Krishna Priyanka New Building, C101, 2nd Floor, The Legend Rd, Hinjawadi, Phase 1, Pune, Maharashtra 411057, India",
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

  // Initialize store with verified data
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
   PROFILE API
   ============================================================ */
export async function getProfile() {
  const store = getStore();
  return store.profile;
}

export async function updateProfile(updates) {
  const store = getStore();
  store.profile = { ...store.profile, ...updates };
  saveStore(store);
  return store.profile;
}

/* ============================================================
   PROJECTS API
   ============================================================ */
export async function getProjects() {
  const store = getStore();
  return store.projects || [];
}

export async function getProjectBySlug(slug) {
  const store = getStore();
  return (store.projects || []).find((p) => p.slug === slug) || null;
}

export async function saveProject(project) {
  const store = getStore();
  const list = store.projects || [];
  const existingIdx = list.findIndex((p) => p.id === project.id || (project.slug && p.slug === project.slug));

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...project, updatedAt: new Date().toISOString() };
  } else {
    const newProject = {
      ...project,
      id: project.id || `proj-${Date.now()}`,
      slug: project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      createdAt: new Date().toISOString()
    };
    list.unshift(newProject);
  }

  store.projects = list;
  saveStore(store);
  return project;
}

export async function deleteProject(id) {
  const store = getStore();
  store.projects = (store.projects || []).filter((p) => p.id !== id && p.slug !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   EXPERIENCE API
   ============================================================ */
export async function getExperience() {
  const store = getStore();
  return store.experience || [];
}

export async function saveExperience(item) {
  const store = getStore();
  const list = store.experience || [];
  const existingIdx = list.findIndex((e) => e.id === item.id);

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...item };
  } else {
    list.unshift({ ...item, id: item.id || `exp-${Date.now()}` });
  }

  store.experience = list;
  saveStore(store);
  return item;
}

export async function deleteExperience(id) {
  const store = getStore();
  store.experience = (store.experience || []).filter((e) => e.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   EDUCATION API
   ============================================================ */
export async function getEducation() {
  const store = getStore();
  return store.education || [];
}

export async function saveEducation(item) {
  const store = getStore();
  const list = store.education || [];
  const existingIdx = list.findIndex((e) => e.id === item.id);

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...item };
  } else {
    list.push({ ...item, id: item.id || `edu-${Date.now()}` });
  }

  store.education = list;
  saveStore(store);
  return item;
}

export async function deleteEducation(id) {
  const store = getStore();
  store.education = (store.education || []).filter((e) => e.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   SKILLS API
   ============================================================ */
export async function getSkills() {
  const store = getStore();
  return store.skills || [];
}

export async function saveSkills(skillsGroupList) {
  const store = getStore();
  store.skills = skillsGroupList;
  saveStore(store);
  return store.skills;
}

/* ============================================================
   CERTIFICATIONS API
   ============================================================ */
export async function getCertifications() {
  const store = getStore();
  return store.certifications || [];
}

export async function saveCertification(cert) {
  const store = getStore();
  const list = store.certifications || [];
  const existingIdx = list.findIndex((c) => c.id === cert.id);

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...cert };
  } else {
    list.unshift({ ...cert, id: cert.id || `cert-${Date.now()}` });
  }

  store.certifications = list;
  saveStore(store);
  return cert;
}

export async function deleteCertification(id) {
  const store = getStore();
  store.certifications = (store.certifications || []).filter((c) => c.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   ACHIEVEMENTS API
   ============================================================ */
export async function getAchievements() {
  const store = getStore();
  return store.achievements || [];
}

export async function saveAchievement(ach) {
  const store = getStore();
  const list = store.achievements || [];
  const existingIdx = list.findIndex((a) => a.id === ach.id);

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...ach };
  } else {
    list.unshift({
      ...ach,
      id: ach.id || `ach-${Date.now()}`,
      slug: ach.slug || ach.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    });
  }

  store.achievements = list;
  saveStore(store);
  return ach;
}

export async function deleteAchievement(id) {
  const store = getStore();
  store.achievements = (store.achievements || []).filter((a) => a.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   GALLERY API
   ============================================================ */
export async function getGallery() {
  const store = getStore();
  return store.gallery || [];
}

export async function saveGalleryItem(item) {
  const store = getStore();
  const list = store.gallery || [];
  const existingIdx = list.findIndex((g) => g.id === item.id);

  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...item };
  } else {
    list.unshift({ ...item, id: item.id || `gal-${Date.now()}` });
  }

  store.gallery = list;
  saveStore(store);
  return item;
}

export async function deleteGalleryItem(id) {
  const store = getStore();
  store.gallery = (store.gallery || []).filter((g) => g.id !== id);
  saveStore(store);
  return true;
}

/* ============================================================
   RECRUITER & SETTINGS API
   ============================================================ */
export async function getRecruiterData() {
  const store = getStore();
  return store.recruiter || initialRecruiter;
}

export async function updateRecruiterData(updates) {
  const store = getStore();
  store.recruiter = { ...store.recruiter, ...updates };
  saveStore(store);
  return store.recruiter;
}

export async function getSettings() {
  const store = getStore();
  return store.settings || initialSettings;
}

export async function updateSettings(updates) {
  const store = getStore();
  store.settings = { ...store.settings, ...updates };
  saveStore(store);
  return store.settings;
}

export async function getMedia() {
  const store = getStore();
  return store.media || [];
}

export async function saveMediaItem(item) {
  const store = getStore();
  const list = store.media || [];
  list.unshift({ ...item, id: item.id || `media-${Date.now()}`, date: new Date().toISOString().slice(0, 7) });
  store.media = list;
  saveStore(store);
  return item;
}

export async function deleteMediaItem(id) {
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

