import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ModeProvider } from "./context/ModeContext";
import { AdminAuthProvider, AdminProtectedRoute } from "./context/AdminAuthContext";

// Layouts
import RootLayout from "./layouts/RootLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import SkillsPage from "./pages/SkillsPage";
import ExperiencePage from "./pages/ExperiencePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import EducationPage from "./pages/EducationPage";
import AchievementsPage from "./pages/AchievementsPage";
import AchievementDetailPage from "./pages/AchievementDetailPage";
import CertificationsPage from "./pages/CertificationsPage";
import GalleryPage from "./pages/GalleryPage";
import ContactPage from "./pages/ContactPage";
import ResumePage from "./pages/ResumePage";
import NotFoundPage from "./pages/NotFoundPage";

// Recruiter Portal Pages
import RecruiterOverviewPage from "./pages/RecruiterOverviewPage";

// Admin CMS Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminExperiencePage from "./pages/admin/AdminExperiencePage";
import AdminEducationPage from "./pages/admin/AdminEducationPage";
import AdminSkillsPage from "./pages/admin/AdminSkillsPage";
import AdminCertificationsPage from "./pages/admin/AdminCertificationsPage";
import AdminAchievementsPage from "./pages/admin/AdminAchievementsPage";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminResumePage from "./pages/admin/AdminResumePage";
import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminRecruiterPage from "./pages/admin/AdminRecruiterPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import AdminVersionsPage from "./pages/admin/AdminVersionsPage";

import { PortfolioDataProvider } from "./context/PortfolioDataContext";

export default function App() {
  return (
    <PortfolioDataProvider>
      <AdminAuthProvider>
        <ModeProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Portfolio View */}
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="experience" element={<ExperiencePage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:slug" element={<ProjectDetailPage />} />
                <Route path="education" element={<EducationPage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="achievements/:slug" element={<AchievementDetailPage />} />
                <Route path="certifications" element={<CertificationsPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="resume" element={<ResumePage />} />
              </Route>

              {/* Dedicated Recruiter Portal */}
              <Route path="/recruiter" element={<RecruiterLayout />}>
                <Route index element={<Navigate to="/recruiter/overview" replace />} />
                <Route path="overview" element={<RecruiterOverviewPage />} />
              </Route>

              {/* Admin CMS Authentication */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin CMS Operations */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="experience" element={<AdminExperiencePage />} />
                <Route path="education" element={<AdminEducationPage />} />
                <Route path="skills" element={<AdminSkillsPage />} />
                <Route path="certifications" element={<AdminCertificationsPage />} />
                <Route path="achievements" element={<AdminAchievementsPage />} />
                <Route path="gallery" element={<AdminGalleryPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="resume" element={<AdminResumePage />} />
                <Route path="home" element={<AdminHomePage />} />
                <Route path="recruiter" element={<AdminRecruiterPage />} />
                <Route path="versions" element={<AdminVersionsPage />} />
                <Route path="audit" element={<AdminAuditPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ModeProvider>
      </AdminAuthProvider>
    </PortfolioDataProvider>
  );
}
