-- ============================================================
-- AYYAJ KALANDAR SHAIKH — PERSONAL DEVELOPER PLATFORM
-- Migration: 20260917000000_featured_and_gallery_sort.sql
-- Purpose:
--   1. Add featured_items JSONB column to public.site_settings
--   2. Ensure sort_order indexing on gallery table
--   3. Idempotently seed bundled public gallery items into gallery table
-- ============================================================

-- 1. ADD FEATURED_ITEMS COLUMN TO SITE_SETTINGS
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS featured_items JSONB DEFAULT '[]'::jsonb;

-- 2. ENSURE SORT_ORDER INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON public.gallery (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON public.projects (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_certifications_sort_order ON public.certifications (sort_order ASC);

-- 3. IDEMPOTENT INITIAL SEED FOR GALLERY ITEMS
-- Matches bundled items from src/data/gallery.js
INSERT INTO public.gallery (id, image_url, title, caption, category, sort_order, publication_status)
VALUES
  (
    '00000000-0000-0000-0000-000000000081',
    '/profile.jpg',
    'Ayyaj Kalandar Shaikh — Professional Developer Profile',
    'Professional portrait of software engineer and MCA Cloud Computing student Ayyaj Kalandar Shaikh.',
    'Other',
    1,
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000082',
    '/audit-desktop.png',
    'Portfolio Desktop Interface Audit & Architecture',
    'High-resolution desktop interface architecture verification showing structured layouts, developer status panel, and typography balance.',
    'Projects',
    2,
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000083',
    '/audit-mobile.png',
    'Mobile Viewport Responsiveness Verification',
    'Mobile viewport inspection verifying fluid layout stacking, accessible touch targets, and zero horizontal overflow on small screens.',
    'Projects',
    3,
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000084',
    '/audit-typography.png',
    'Typography System & Hierarchy Inspection',
    'Typography review testing JetBrains Mono scale, line-height geometry, and strict WCAG color contrast fidelity.',
    'Projects',
    4,
    'published'
  )
ON CONFLICT (id) DO NOTHING;

