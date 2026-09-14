import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  getStoreSync,
  subscribeToData,
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
} from "../services/dataService";

const PortfolioDataContext = createContext(null);

export function PortfolioDataProvider({ children }) {
  const [store, setStore] = useState(() => getStoreSync());

  // Listen to in-memory store changes and cross-tab storage changes
  useEffect(() => {
    const unsubscribe = subscribeToData(() => {
      setStore(getStoreSync());
    });

    const handleStorage = (e) => {
      if (e.key && e.key.startsWith("ayyaj_platform_data")) {
        setStore(getStoreSync());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const refresh = useCallback(() => {
    setStore(getStoreSync());
  }, []);

  const getProjectBySlug = useCallback(
    (slug) => {
      return (store.projects || []).find((p) => p.slug === slug || p.id === slug) || null;
    },
    [store.projects]
  );

  const getAchievementBySlug = useCallback(
    (slug) => {
      return (store.achievements || []).find((a) => a.slug === slug || a.id === slug) || null;
    },
    [store.achievements]
  );

  const featuredProjects = useMemo(() => {
    return (store.projects || []).filter((p) => p.featured);
  }, [store.projects]);

  const currentExperience = useMemo(() => {
    return (store.experience || []).find((e) => e.current) || store.experience?.[0] || null;
  }, [store.experience]);

  const value = useMemo(
    () => ({
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
      getProjectBySlug,
      getAchievementBySlug,
      featuredProjects,
      currentExperience,
      refresh,
      // Mutation methods
      actions: {
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
      }
    }),
    [store, getProjectBySlug, getAchievementBySlug, featuredProjects, currentExperience, refresh]
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
    // Graceful fallback to synchronous getters if rendered outside provider
    const fallbackStore = getStoreSync();
    return {
      profile: fallbackStore.profile,
      recruiter: fallbackStore.recruiter,
      projects: fallbackStore.projects || [],
      experience: fallbackStore.experience || [],
      education: fallbackStore.education || [],
      skills: fallbackStore.skills || [],
      certifications: fallbackStore.certifications || [],
      achievements: fallbackStore.achievements || [],
      gallery: fallbackStore.gallery || [],
      settings: fallbackStore.settings,
      media: fallbackStore.media || [],
      getProjectBySlug: (slug) => (fallbackStore.projects || []).find((p) => p.slug === slug) || null,
      getAchievementBySlug: (slug) => (fallbackStore.achievements || []).find((a) => a.slug === slug) || null,
      featuredProjects: (fallbackStore.projects || []).filter((p) => p.featured),
      currentExperience: (fallbackStore.experience || []).find((e) => e.current) || fallbackStore.experience?.[0] || null,
      refresh: () => {},
      actions: {}
    };
  }
  return ctx;
}

