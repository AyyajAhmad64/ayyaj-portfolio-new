-- ============================================================
-- AYYAJ KALANDAR SHAIKH — PERSONAL DEVELOPER PLATFORM
-- Row Level Security (RLS) Policies, Admin Authorization & Storage
-- Migration: 20260914000002_rls_and_storage.sql
-- ============================================================

-- 1. ADMIN AUTHORIZATION FUNCTION (SECURITY DEFINER)
-- Prevents ordinary authenticated users from having CMS write access.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    -- Return false if unauthenticated
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 1. Check if user is active in public.admin_users table
    IF EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Fallback check for designated portfolio owner email in JWT
    IF LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ayyajahmad64@gmail.com' THEN
        RETURN TRUE;
    END IF;

    -- 3. Check auth.users app_metadata for admin role
    IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- 2. AUTO-PROVISION OWNER INTO admin_users TABLE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF LOWER(NEW.email) = 'ayyajahmad64@gmail.com' THEN
        INSERT INTO public.admin_users (id, email, role, is_active)
        VALUES (NEW.id, LOWER(NEW.email), 'superadmin', true)
        ON CONFLICT (id) DO UPDATE SET is_active = true, updated_at = now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
    AFTER INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- 3. SERVER-SIDE CONTACT FORM VALIDATION & RATE LIMITING
CREATE OR REPLACE FUNCTION public.validate_and_limit_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    recent_submissions INTEGER;
BEGIN
    -- Sanitize & trim inputs
    NEW.name := trim(NEW.name);
    NEW.email := lower(trim(NEW.email));
    NEW.message := trim(NEW.message);

    -- Enforce lengths and format
    IF length(NEW.name) < 2 OR length(NEW.name) > 100 THEN
        RAISE EXCEPTION 'Name must be between 2 and 100 characters.';
    END IF;

    IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR length(NEW.email) > 150 THEN
        RAISE EXCEPTION 'A valid email address is required.';
    END IF;

    IF length(NEW.message) < 10 OR length(NEW.message) > 5000 THEN
        RAISE EXCEPTION 'Message must be between 10 and 5000 characters.';
    END IF;

    IF NEW.subject IS NOT NULL AND length(NEW.subject) > 200 THEN
        NEW.subject := substr(NEW.subject, 1, 200);
    END IF;

    -- Rate limit: Maximum 5 messages per hour per email address
    SELECT count(*) INTO recent_submissions
    FROM public.messages
    WHERE email = NEW.email
      AND created_at > (now() - INTERVAL '1 hour');

    IF recent_submissions >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded: maximum 5 messages per hour allowed.';
    END IF;

    NEW.status := 'unread';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_and_limit_message ON public.messages;
CREATE TRIGGER trg_validate_and_limit_message
    BEFORE INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.validate_and_limit_message();

-- 4. ANALYTICS ABUSE PROTECTION (allowlist + metadata size + burst guard)
CREATE OR REPLACE FUNCTION public.sanitize_analytics_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    burst_count INTEGER;
    allowed_events TEXT[] := ARRAY[
        'page_view',
        'project_view',
        'resume_view',
        'resume_download',
        'recruiter_mode_visit',
        'contact_click',
        'github_click',
        'linkedin_click'
    ];
BEGIN
    -- Reject NULL or unknown event names (not in allowlist)
    IF NEW.event_name IS NULL OR NOT (NEW.event_name = ANY(allowed_events)) THEN
        RETURN NULL;
    END IF;

    -- Truncate page_path if over limit
    IF NEW.page_path IS NOT NULL AND length(NEW.page_path) > 255 THEN
        NEW.page_path := substr(NEW.page_path, 1, 255);
    END IF;

    -- Reject excessively large metadata payloads (> 2 KB serialized)
    IF NEW.metadata IS NOT NULL AND length(NEW.metadata::TEXT) > 2048 THEN
        NEW.metadata := '{}'::jsonb;
    END IF;

    -- Global burst protection: max 120 events per minute
    SELECT count(*) INTO burst_count
    FROM public.analytics_events
    WHERE created_at > (now() - INTERVAL '1 minute');

    IF burst_count >= 120 THEN
        RETURN NULL; -- Drop excessive traffic spike silently
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sanitize_analytics_event ON public.analytics_events;
CREATE TRIGGER trg_sanitize_analytics_event
    BEFORE INSERT ON public.analytics_events
    FOR EACH ROW EXECUTE FUNCTION public.sanitize_analytics_event();

-- 5. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_private_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 6. PUBLIC READ POLICIES (INTENTIONALLY PUBLIC PUBLISHED CONTENT ONLY)
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on site_settings" ON public.site_settings;
CREATE POLICY "Allow public read on site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on recruiter_settings" ON public.recruiter_settings;
CREATE POLICY "Allow public read on recruiter_settings"
    ON public.recruiter_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on published projects" ON public.projects;
CREATE POLICY "Allow public read on published projects"
    ON public.projects FOR SELECT
    USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on project_images" ON public.project_images;
CREATE POLICY "Allow public read on project_images"
    ON public.project_images FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Allow public read on published experiences" ON public.experiences;
CREATE POLICY "Allow public read on published experiences"
    ON public.experiences FOR SELECT
    USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published education" ON public.education;
CREATE POLICY "Allow public read on published education"
    ON public.education FOR SELECT
    USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published skills" ON public.skills;
CREATE POLICY "Allow public read on published skills"
    ON public.skills FOR SELECT
    USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published certifications" ON public.certifications;
CREATE POLICY "Allow public read on published certifications"
    ON public.certifications FOR SELECT
    USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published achievements" ON public.achievements;
CREATE POLICY "Allow public read on published achievements"
    ON public.achievements FOR SELECT
    USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published gallery" ON public.gallery;
CREATE POLICY "Allow public read on published gallery"
    ON public.gallery FOR SELECT
    USING (publication_status = 'published');

-- Media: Public only sees media with visibility = 'public'
DROP POLICY IF EXISTS "Allow public read on media" ON public.media;
CREATE POLICY "Allow public read on media"
    ON public.media FOR SELECT
    USING (visibility = 'public');

-- Resume: Only active resume version is public
DROP POLICY IF EXISTS "Allow public read on active resume_versions" ON public.resume_versions;
CREATE POLICY "Allow public read on active resume_versions"
    ON public.resume_versions FOR SELECT
    USING (is_active = true);

-- Messages: Anyone can insert message (guarded by rate limit trigger)
DROP POLICY IF EXISTS "Allow public insert on messages" ON public.messages;
CREATE POLICY "Allow public insert on messages"
    ON public.messages FOR INSERT
    WITH CHECK (true);

-- Analytics: Anyone can record telemetry event (guarded by burst trigger)
DROP POLICY IF EXISTS "Allow public insert on analytics_events" ON public.analytics_events;
CREATE POLICY "Allow public insert on analytics_events"
    ON public.analytics_events FOR INSERT
    WITH CHECK (true);

-- 7. HARDENED ADMIN CMS POLICIES (REQUIRES public.is_admin() = true)
-- Ordinary authenticated accounts have NO write or private read permissions.

-- admin_users
DROP POLICY IF EXISTS "Admin full access on admin_users" ON public.admin_users;
CREATE POLICY "Admin full access on admin_users"
    ON public.admin_users FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- admin_private_profile (Residential address is strictly admin only)
DROP POLICY IF EXISTS "Admin full access on admin_private_profile" ON public.admin_private_profile;
CREATE POLICY "Admin full access on admin_private_profile"
    ON public.admin_private_profile FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- profiles
DROP POLICY IF EXISTS "Allow authenticated admin full access on profiles" ON public.profiles;
CREATE POLICY "Admin full access on profiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- site_settings
DROP POLICY IF EXISTS "Allow authenticated admin full access on site_settings" ON public.site_settings;
CREATE POLICY "Admin full access on site_settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- recruiter_settings
DROP POLICY IF EXISTS "Allow authenticated admin full access on recruiter_settings" ON public.recruiter_settings;
CREATE POLICY "Admin full access on recruiter_settings"
    ON public.recruiter_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- projects
DROP POLICY IF EXISTS "Allow authenticated admin full access on projects" ON public.projects;
CREATE POLICY "Admin full access on projects"
    ON public.projects FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- project_images
DROP POLICY IF EXISTS "Allow authenticated admin full access on project_images" ON public.project_images;
CREATE POLICY "Admin full access on project_images"
    ON public.project_images FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- experiences
DROP POLICY IF EXISTS "Allow authenticated admin full access on experiences" ON public.experiences;
CREATE POLICY "Admin full access on experiences"
    ON public.experiences FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- education
DROP POLICY IF EXISTS "Allow authenticated admin full access on education" ON public.education;
CREATE POLICY "Admin full access on education"
    ON public.education FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- skills
DROP POLICY IF EXISTS "Allow authenticated admin full access on skills" ON public.skills;
CREATE POLICY "Admin full access on skills"
    ON public.skills FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- certifications
DROP POLICY IF EXISTS "Allow authenticated admin full access on certifications" ON public.certifications;
CREATE POLICY "Admin full access on certifications"
    ON public.certifications FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- achievements
DROP POLICY IF EXISTS "Allow authenticated admin full access on achievements" ON public.achievements;
CREATE POLICY "Admin full access on achievements"
    ON public.achievements FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- gallery
DROP POLICY IF EXISTS "Allow authenticated admin full access on gallery" ON public.gallery;
CREATE POLICY "Admin full access on gallery"
    ON public.gallery FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- media
DROP POLICY IF EXISTS "Allow authenticated admin full access on media" ON public.media;
CREATE POLICY "Admin full access on media"
    ON public.media FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- resume_versions
DROP POLICY IF EXISTS "Allow authenticated admin full access on resume_versions" ON public.resume_versions;
CREATE POLICY "Admin full access on resume_versions"
    ON public.resume_versions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- messages (Admin read, update status, delete)
DROP POLICY IF EXISTS "Allow authenticated admin full access on messages" ON public.messages;
CREATE POLICY "Admin full access on messages"
    ON public.messages FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- content_versions (Admin only)
DROP POLICY IF EXISTS "Allow authenticated admin full access on content_versions" ON public.content_versions;
CREATE POLICY "Admin full access on content_versions"
    ON public.content_versions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- audit_logs (Admin only)
DROP POLICY IF EXISTS "Allow authenticated admin full access on audit_logs" ON public.audit_logs;
CREATE POLICY "Admin full access on audit_logs"
    ON public.audit_logs FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- analytics_events (Admin can read and purge telemetry)
DROP POLICY IF EXISTS "Allow authenticated admin full access on analytics_events" ON public.analytics_events;
CREATE POLICY "Admin full access on analytics_events"
    ON public.analytics_events FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 8. STORAGE BUCKETS & HARDENED STORAGE POLICIES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('portfolio-media', 'portfolio-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
    ('resume', 'resume', true, 15728640, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Public Read
DROP POLICY IF EXISTS "Allow public read on portfolio-media" ON storage.objects;
CREATE POLICY "Allow public read on portfolio-media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Allow public read on resume bucket" ON storage.objects;
CREATE POLICY "Allow public read on resume bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resume');

-- Storage Admin Write Access (STRICT: Requires public.is_admin() = true)
DROP POLICY IF EXISTS "Allow authenticated insert to portfolio-media" ON storage.objects;
CREATE POLICY "Admin insert to portfolio-media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-media' AND public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated update to portfolio-media" ON storage.objects;
CREATE POLICY "Admin update to portfolio-media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-media' AND public.is_admin())
    WITH CHECK (bucket_id = 'portfolio-media' AND public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated delete from portfolio-media" ON storage.objects;
CREATE POLICY "Admin delete from portfolio-media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-media' AND public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated insert to resume bucket" ON storage.objects;
CREATE POLICY "Admin insert to resume bucket"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'resume' AND public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated update to resume bucket" ON storage.objects;
CREATE POLICY "Admin update to resume bucket"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'resume' AND public.is_admin())
    WITH CHECK (bucket_id = 'resume' AND public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated delete from resume bucket" ON storage.objects;
CREATE POLICY "Admin delete from resume bucket"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'resume' AND public.is_admin());
