/**
 * Portfolio Data Context
 *
 * Primary data provider for the entire portfolio application.
 * Data authority: Supabase Cloud Database (when configured).
 * Fallback: bundled static data from src/data/*.js
 *
 * Architecture:
 *  1. On mount — immediately hydrate from bundled data (instant render, no flash).
 *  2. Then fetch from Supabase concurrently — replace state when cloud data arrives.
 *  3. Mutations go to Supabase first, then update React state.
 *  4. localStorage is used ONLY for Supabase Auth session (managed by supabaseClient).
 *     It is NOT used as the primary CMS data store.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from "react";

import { profileData as staticProfile, recruiterProfile as staticRecruiter } from "../data/profile.js";
import { projectsData as staticProjects } from "../data/projects.js";
import { experienceData as staticExperience } from "../data/experience.js";
import { educationData as staticEducation } from "../data/education.js";
import { skillsData as staticSkills } from "../data/skills.js";
import { certificationsData as staticCertifications } from "../data/certifications.js";
import { achievementsData as staticAchievements } from "../data/achievements.js";
import { galleryData as staticGallery } from "../data/gallery.js";

import { isSupabaseConfigured } from "../lib/supabaseClient.js";
import * as supabaseService from "../services/supabaseService.js";
import { defaultFeaturedItems } from "../components/FeaturedSection.jsx";
import { applyThemeColors } from "../utils/themeUtils.js";

// ── Mutations still go through dataService for localStorage cache write-through ──
import {
  saveProject,
  deleteProject,
  updateProfile,
  saveExperience,
  deleteExperience,
  saveEducation,
  deleteEducation,
  saveSkills,
  saveCertification,
  deleteCertification,
  saveAchievement,
  deleteAchievement,
  saveGalleryItem,
  deleteGalleryItem,
  updateRecruiterData,
  updateSettings,
  saveMediaItem,
  deleteMediaItem,
  resetToDefaults
} from "../services/dataService.js";

const PortfolioDataContext = createContext(null);

// Default state shape seeded from bundled static data
const buildDefaultStore = () => ({
  profile: staticProfile,
  recruiter: staticRecruiter,
  projects: staticProjects,
  experience: staticExperience,
  education: staticEducation,
  skills: staticSkills,
  certifications: staticCertifications,
  achievements: staticAchievements,
  gallery: staticGallery,
  settings: {
    siteTitle: "Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing",
    enableRecruiterMode: true,
    enableContactForm: true,
    primaryAccent: "#38bdf8",
    secondaryAccent: "#f59e0b",
    publicLocation: "Hinjawadi, Pune, Maharashtra, India",
    showAvailabilityBadge: true,
    featuredItems: defaultFeaturedItems
  },
  media: []
});

export function PortfolioDataProvider({ children }) {
  const [store, setStore] = useState(buildDefaultStore);
  const [loading, setLoading] = useState(isSupabaseConfigured()); // true while fetching cloud
  const [error, setError] = useState(null);
  const [cloudConnected, setCloudConnected] = useState(false);

  /**
   * Fetch all public portfolio data from Supabase concurrently.
   * Never throws — errors surface through the `error` state.
   */
  const fetchFromCloud = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    if (typeof window !== "undefined") {
      window.__PORTFOLIO_LOADING__ = true;
      window.__PORTFOLIO_CLOUD_LOADED__ = false;
    }

    try {
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

      setStore((prev) => {
        const next = { ...prev };

        if (cloudProjects.status === "fulfilled" && Array.isArray(cloudProjects.value)) {
          next.projects = cloudProjects.value;
        }
        if (cloudExperience.status === "fulfilled" && Array.isArray(cloudExperience.value)) {
          next.experience = cloudExperience.value;
        }
        if (cloudEducation.status === "fulfilled" && Array.isArray(cloudEducation.value)) {
          next.education = cloudEducation.value;
        }
        if (cloudSkills.status === "fulfilled" && Array.isArray(cloudSkills.value)) {
          next.skills = cloudSkills.value;
        }
        if (cloudCertifications.status === "fulfilled" && Array.isArray(cloudCertifications.value)) {
          next.certifications = cloudCertifications.value;
        }
        if (cloudAchievements.status === "fulfilled" && Array.isArray(cloudAchievements.value)) {
          next.achievements = cloudAchievements.value;
        }
        if (cloudGallery.status === "fulfilled" && Array.isArray(cloudGallery.value)) {
          next.gallery = cloudGallery.value;
        }
        if (cloudProfile.status === "fulfilled" && cloudProfile.value) {
          next.profile = { ...prev.profile, ...cloudProfile.value };
        }
        if (cloudRecruiter.status === "fulfilled" && cloudRecruiter.value) {
          next.recruiter = { ...prev.recruiter, ...cloudRecruiter.value };
        }
        if (cloudSettings.status === "fulfilled" && cloudSettings.value) {
          next.settings = { ...prev.settings, ...cloudSettings.value };
        }

        // Reconcile featuredItems: preserve saved cloud array from settings or profile snapshot
        if (cloudSettings.status === "fulfilled" && Array.isArray(cloudSettings.value?.featuredItems)) {
          next.settings = {
            ...next.settings,
            featuredItems: cloudSettings.value.featuredItems
          };
        } else if (cloudProfile.status === "fulfilled" && Array.isArray(cloudProfile.value?.snapshot?.home?.featuredItems)) {
          next.settings = {
            ...next.settings,
            featuredItems: cloudProfile.value.snapshot.home.featuredItems
          };
        } else if (Array.isArray(next.profile?.snapshot?.home?.featuredItems)) {
          next.settings = {
            ...next.settings,
            featuredItems: next.profile.snapshot.home.featuredItems
          };
        } else if (!Array.isArray(next.settings?.featuredItems)) {
          next.settings = {
            ...next.settings,
            featuredItems: defaultFeaturedItems
          };
        }

        return next;
      });

      setCloudConnected(true);
      if (typeof window !== "undefined") {
        window.__PORTFOLIO_CLOUD_LOADED__ = true;
      }
    } catch (err) {
      console.error("PortfolioDataContext: Cloud fetch error:", err);
      setError("Unable to load cloud data. Displaying cached content.");
    } finally {
      setLoading(false);
      if (typeof window !== "undefined") {
        window.__PORTFOLIO_LOADING__ = false;
      }
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchFromCloud();
  }, [fetchFromCloud]);

  // Dynamically apply primary & secondary accent colors to CSS variables
  useEffect(() => {
    applyThemeColors(store.settings?.primaryAccent, store.settings?.secondaryAccent);
  }, [store.settings?.primaryAccent, store.settings?.secondaryAccent]);

  // Public refresh API (called by admin after mutations)
  const refresh = useCallback(() => fetchFromCloud(), [fetchFromCloud]);

  // ── Selectors ────────────────────────────────────────────────
  const getProjectBySlug = useCallback(
    (slug) => (store.projects || []).find((p) => p.slug === slug || p.id === slug) || null,
    [store.projects]
  );

  const getAchievementBySlug = useCallback(
    (slug) => (store.achievements || []).find((a) => a.slug === slug || a.id === slug) || null,
    [store.achievements]
  );

  const featuredProjects = useMemo(
    () => (store.projects || []).filter((p) => p.featured),
    [store.projects]
  );

  const currentExperience = useMemo(
    () => (store.experience || []).find((e) => e.current) || store.experience?.[0] || null,
    [store.experience]
  );

  // ── Context value ────────────────────────────────────────────
  const value = useMemo(
    () => ({
      // Data
      profile: store.profile,
      recruiter: store.recruiter,
      projects: store.projects || [],
      experience: store.experience || [],
      education: store.education || [],
      skills: store.skills || [],
      certifications: store.certifications || [],
      achievements: store.achievements || [],
      gallery: store.gallery || [],
      settings: store.settings,
      media: store.media || [],

      // Status
      loading,
      error,
      isCloudConnected: cloudConnected,
      isSupabaseConfigured: isSupabaseConfigured(),

      // Computed helpers
      getProjectBySlug,
      getAchievementBySlug,
      featuredProjects,
      currentExperience,

      // Refresh
      refresh,

      // Mutations (go through dataService → Supabase then update local state)
      actions: {
        saveProject: async (...args) => {
          const result = await saveProject(...args);
          await fetchFromCloud();
          return result;
        },
        deleteProject: async (...args) => {
          const result = await deleteProject(...args);
          await fetchFromCloud();
          return result;
        },
        updateProfile: async (...args) => {
          const result = await updateProfile(...args);
          await fetchFromCloud();
          return result;
        },
        saveExperience: async (...args) => {
          const result = await saveExperience(...args);
          await fetchFromCloud();
          return result;
        },
        deleteExperience: async (...args) => {
          const result = await deleteExperience(...args);
          await fetchFromCloud();
          return result;
        },
        saveEducation: async (...args) => {
          const result = await saveEducation(...args);
          await fetchFromCloud();
          return result;
        },
        deleteEducation: async (...args) => {
          const result = await deleteEducation(...args);
          await fetchFromCloud();
          return result;
        },
        saveSkills: async (...args) => {
          const result = await saveSkills(...args);
          await fetchFromCloud();
          return result;
        },
        saveCertification: async (...args) => {
          const result = await saveCertification(...args);
          await fetchFromCloud();
          return result;
        },
        deleteCertification: async (...args) => {
          const result = await deleteCertification(...args);
          await fetchFromCloud();
          return result;
        },
        saveAchievement: async (...args) => {
          const result = await saveAchievement(...args);
          await fetchFromCloud();
          return result;
        },
        deleteAchievement: async (...args) => {
          const result = await deleteAchievement(...args);
          await fetchFromCloud();
          return result;
        },
        saveGalleryItem: async (...args) => {
          const result = await saveGalleryItem(...args);
          await fetchFromCloud();
          return result;
        },
        deleteGalleryItem: async (...args) => {
          const result = await deleteGalleryItem(...args);
          await fetchFromCloud();
          return result;
        },
        updateRecruiterData: async (...args) => {
          const result = await updateRecruiterData(...args);
          await fetchFromCloud();
          return result;
        },
        updateSettings: async (...args) => {
          const result = await updateSettings(...args);
          await fetchFromCloud();
          return result;
        },
        saveMediaItem: async (...args) => {
          const result = await saveMediaItem(...args);
          await fetchFromCloud();
          return result;
        },
        deleteMediaItem: async (...args) => {
          const result = await deleteMediaItem(...args);
          await fetchFromCloud();
          return result;
        },
        resetToDefaults: async (...args) => {
          const result = await resetToDefaults(...args);
          await fetchFromCloud();
          return result;
        }
      }
    }),
    [
      store,
      loading,
      error,
      cloudConnected,
      getProjectBySlug,
      getAchievementBySlug,
      featuredProjects,
      currentExperience,
      refresh,
      fetchFromCloud
    ]
  );

  return (
    <PortfolioDataContext.Provider value={value}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const ctx = useContext(PortfolioDataContext);
  if (!ctx) {
    // Graceful fallback — render with bundled static data if used outside provider
    const defaults = buildDefaultStore();
    return {
      ...defaults,
      loading: false,
      error: null,
      isCloudConnected: false,
      isSupabaseConfigured: isSupabaseConfigured(),
      getProjectBySlug: (slug) => (defaults.projects || []).find((p) => p.slug === slug) || null,
      getAchievementBySlug: (slug) => (defaults.achievements || []).find((a) => a.slug === slug) || null,
      featuredProjects: (defaults.projects || []).filter((p) => p.featured),
      currentExperience: (defaults.experience || []).find((e) => e.current) || defaults.experience?.[0] || null,
      refresh: () => {},
      actions: {}
    };
  }
  return ctx;
}
