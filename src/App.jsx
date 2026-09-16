import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ModeProvider } from "./context/ModeContext";
import { AdminAuthProvider, AdminProtectedRoute } from "./context/AdminAuthContext";
import { PortfolioDataProvider } from "./context/PortfolioDataContext";

// Core Layout & Initial Page (Eagerly loaded for instant 0ms FCP on homepage)
import RootLayout from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";

// Lazy-loaded Secondary Public Pages
const AboutPage = lazy(() => import("./pages/AboutPage"));
const SkillsPage = lazy(() => import("./pages/SkillsPage"));
const ExperiencePage = lazy(() => import("./pages/ExperiencePage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const EducationPage = lazy(() => import("./pages/EducationPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const AchievementDetailPage = lazy(() => import("./pages/AchievementDetailPage"));
const CertificationsPage = lazy(() => import("./pages/CertificationsPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ResumePage = lazy(() => import("./pages/ResumePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Lazy-loaded Recruiter Portal
const RecruiterLayout = lazy(() => import("./layouts/RecruiterLayout"));
const RecruiterOverviewPage = lazy(() => import("./pages/RecruiterOverviewPage"));

// Lazy-loaded Admin CMS Pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));
const AdminProjectsPage = lazy(() => import("./pages/admin/AdminProjectsPage"));
const AdminExperiencePage = lazy(() => import("./pages/admin/AdminExperiencePage"));
const AdminEducationPage = lazy(() => import("./pages/admin/AdminEducationPage"));
const AdminSkillsPage = lazy(() => import("./pages/admin/AdminSkillsPage"));
const AdminCertificationsPage = lazy(() => import("./pages/admin/AdminCertificationsPage"));
const AdminAchievementsPage = lazy(() => import("./pages/admin/AdminAchievementsPage"));
const AdminGalleryPage = lazy(() => import("./pages/admin/AdminGalleryPage"));
const AdminMediaPage = lazy(() => import("./pages/admin/AdminMediaPage"));
const AdminResumePage = lazy(() => import("./pages/admin/AdminResumePage"));
const AdminHomePage = lazy(() => import("./pages/admin/AdminHomePage"));
const AdminRecruiterPage = lazy(() => import("./pages/admin/AdminRecruiterPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));
const AdminAuditPage = lazy(() => import("./pages/admin/AdminAuditPage"));
const AdminVersionsPage = lazy(() => import("./pages/admin/AdminVersionsPage"));
const AdminJarvisPage = lazy(() => import("./pages/admin/AdminJarvisPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminSeoPage = lazy(() => import("./pages/admin/AdminSeoPage"));

// Sleek, accessible loading indicator for asynchronously loaded route chunks
function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--accent-cyan)",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "13px",
        letterSpacing: "0.06em",
        opacity: 0.85
      }}
      aria-live="polite"
      aria-label="Loading page content"
    >
      <span>⚡ LOADING MODULE...</span>
    </div>
  );
}

export default function App() {
  return (
    <PortfolioDataProvider>
      <AdminAuthProvider>
        <ModeProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoadingFallback />}>
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
                  <Route path="jarvis" element={<AdminJarvisPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="seo" element={<AdminSeoPage />} />
                  <Route path="versions" element={<AdminVersionsPage />} />
                  <Route path="audit" element={<AdminAuditPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ModeProvider>
      </AdminAuthProvider>
    </PortfolioDataProvider>
  );
}
