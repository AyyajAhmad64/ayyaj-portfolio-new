-- ============================================================
-- AYYAJ KALANDAR SHAIKH — PERSONAL DEVELOPER PLATFORM
-- Supabase PostgreSQL Hardened Database Schema Migration
-- Migration: 20260914000000_initial_schema.sql
-- ============================================================

-- Enable pgcrypto extension for UUID generation if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 0. ADMIN USERS TABLE (Role-Based Authorization)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1. PUBLIC PROFILES TABLE (Safe Public Data - No Private Residential Address)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    title TEXT NOT NULL,
    headline TEXT,
    current_position TEXT,
    education_degree TEXT,
    education_specialization TEXT,
    education_institution TEXT,
    location TEXT NOT NULL DEFAULT 'Hinjawadi, Pune, Maharashtra, India',
    availability TEXT,
    status TEXT,
    bio TEXT,
    about_detailed JSONB DEFAULT '[]'::jsonb,
    snapshot JSONB DEFAULT '{}'::jsonb,
    contact JSONB DEFAULT '{}'::jsonb,
    primary_skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRIVATE ADMIN PROFILE DETAILS (Restricted to Admin Only)
CREATE TABLE IF NOT EXISTS public.admin_private_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_residential_address TEXT NOT NULL,
    address_lines JSONB DEFAULT '[]'::jsonb,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type TEXT,
    short_description TEXT,
    full_description TEXT,
    status TEXT DEFAULT 'In Development',
    featured BOOLEAN DEFAULT false,
    thumbnail TEXT,
    live_url TEXT,
    github_url TEXT,
    category JSONB DEFAULT '[]'::jsonb,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    problem TEXT,
    solution TEXT,
    architecture TEXT,
    challenges TEXT,
    learnings TEXT,
    sort_order INTEGER DEFAULT 0,
    publication_status TEXT DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROJECT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    alt_text TEXT,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    employment_type TEXT DEFAULT 'Internship',
    start_date TEXT,
    end_date TEXT,
    duration TEXT,
    current BOOLEAN DEFAULT false,
    description TEXT,
    technologies JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    publication_status TEXT DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. EDUCATION TABLE
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    specialization TEXT,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    year TEXT,
    status TEXT DEFAULT 'Completed',
    current BOOLEAN DEFAULT false,
    description TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    publication_status TEXT DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SKILLS TABLE (With Unique Constraint for Safe Idempotent Seeding)
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    category_badge TEXT,
    category_description TEXT,
    name TEXT NOT NULL,
    level TEXT DEFAULT 'Proficient',
    core BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    publication_status TEXT DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_skills_category_name UNIQUE (category, name)
);

-- 8. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date TEXT,
    status TEXT DEFAULT 'Active',
    credential_id TEXT,
    certificate_url TEXT,
    verification_url TEXT,
    description TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER DEFAULT 0,
    publication_status TEXT DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    type TEXT,
    organization TEXT,
    date TEXT,
    description TEXT,
    impact TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    credential TEXT,
    image TEXT,
    link TEXT,
    sort_order INTEGER DEFAULT 0,
    publication_status TEXT DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    storage_path TEXT,
    title TEXT NOT NULL,
    caption TEXT,
    category TEXT DEFAULT 'Technical',
    sort_order INTEGER DEFAULT 0,
    publication_status TEXT DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. MEDIA TABLE (With Public/Private Visibility Separation)
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    category TEXT DEFAULT 'general',
    alt_text TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. RESUME VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT,
    version TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    file_size_bytes BIGINT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. SITE SETTINGS TABLE (Compact Public Location Only)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title TEXT DEFAULT 'Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing',
    enable_recruiter_mode BOOLEAN DEFAULT true,
    enable_contact_form BOOLEAN DEFAULT true,
    primary_accent TEXT DEFAULT '#38bdf8',
    secondary_accent TEXT DEFAULT '#f59e0b',
    public_location TEXT DEFAULT 'Hinjawadi, Pune, Maharashtra, India',
    show_availability_badge BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. RECRUITER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.recruiter_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary TEXT NOT NULL,
    availability TEXT,
    target_roles JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    core_metrics JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. MESSAGES TABLE (With Strict Length Validation Constraints)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    email TEXT NOT NULL CHECK (char_length(email) >= 5 AND char_length(email) <= 150),
    subject TEXT CHECK (char_length(subject) <= 200),
    message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 5000),
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. CONTENT VERSIONS TABLE (VERSION HISTORY)
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    version_number INTEGER DEFAULT 1,
    data JSONB NOT NULL,
    changed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    actor_email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. ANALYTICS EVENTS TABLE (Restricted to known events)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL CHECK (event_name IN (
        'page_view',
        'project_view',
        'resume_view',
        'resume_download',
        'recruiter_mode_visit',
        'contact_click',
        'github_click',
        'linkedin_click'
    )),
    page_path TEXT CHECK (char_length(page_path) <= 255),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_publication_status ON public.projects(publication_status);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_experiences_publication_status ON public.experiences(publication_status);
CREATE INDEX IF NOT EXISTS idx_education_publication_status ON public.education(publication_status);
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_publication_status ON public.skills(publication_status);
CREATE INDEX IF NOT EXISTS idx_certifications_publication_status ON public.certifications(publication_status);
CREATE INDEX IF NOT EXISTS idx_achievements_slug ON public.achievements(slug);
CREATE INDEX IF NOT EXISTS idx_achievements_publication_status ON public.achievements(publication_status);
CREATE INDEX IF NOT EXISTS idx_gallery_publication_status ON public.gallery(publication_status);
CREATE INDEX IF NOT EXISTS idx_media_visibility ON public.media(visibility);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_content_versions_entity ON public.content_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
