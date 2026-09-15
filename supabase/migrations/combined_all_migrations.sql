-- ============================================================
-- AYYAJ KALANDAR SHAIKH — PERSONAL DEVELOPER PLATFORM
-- Hardened Combined Supabase Database Migration
-- (Schema, Idempotent Seed Data, RLS Policies, Admin Authorization, Storage)
-- Safe to re-run multiple times without data duplication.
-- ============================================================

-- ------------------------------------------------------------
-- PART 1: EXTENSIONS & TABLES DEFINITION
-- ------------------------------------------------------------
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

-- 7. SKILLS TABLE (With Unique Constraint for Idempotent Inserts)
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

-- 11. MEDIA TABLE (With Public/Private Separation)
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

-- 13. SITE SETTINGS TABLE (Compact Location Only)
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

-- 15. MESSAGES TABLE (With String Length Constraints)
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

-- 18. ANALYTICS EVENTS TABLE (Restricted to known events only)
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

-- INDEXES
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

-- ------------------------------------------------------------
-- PART 2: IDEMPOTENT SEED DATA
-- ------------------------------------------------------------

-- 1. SEED PROFILES
INSERT INTO public.profiles (
    id, name, short_name, title, headline, current_position,
    education_degree, education_specialization, education_institution,
    location, availability, status, bio, about_detailed,
    snapshot, contact, primary_skills
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ayyaj Kalandar Shaikh',
    'Ayyaj Shaikh',
    'Software Developer & Full Stack Engineer',
    'Java • Spring Boot • React.js • ASP.NET Core • Cloud Computing',
    'MERN Stack + AI Intern @ BQARLSON Software Pvt. Ltd.',
    'Master of Computer Applications (MCA)',
    'Cloud Computing',
    'Dr. D. Y. Patil Institute of Management and Entrepreneur Development, Pune',
    'Hinjawadi, Pune, Maharashtra, India',
    'Available for Software Engineering & Cloud opportunities',
    'Available for Opportunities',
    'Building reliable full-stack applications with Java, Spring Boot, React.js, and modern cloud technologies.',
    '[
        "I am pursuing an MCA in Cloud Computing with a strong technical focus on software engineering, database design, and end-to-end web architecture. My engineering approach emphasizes clean layered architecture (Controller-Service-Repository), type safety, relational integrity, and responsive frontend design.",
        "In addition to core backend workflows, I actively build full-stack projects and work with Cloud and AWS fundamentals. I enjoy solving complex architectural challenges, developing resilient RESTful APIs, and implementing accessible, performant user interfaces."
    ]'::jsonb,
    '{
        "currentPosition": "MERN Stack + AI Intern",
        "primaryFocus": "Full Stack Development",
        "backend": "Java / Spring Boot",
        "frontend": "React.js",
        "cloud": "Cloud Computing / AWS Fundamentals",
        "databases": "MySQL / SQL Server / MongoDB",
        "location": "Hinjawadi, Pune, India"
    }'::jsonb,
    '{
        "email": "ayyajahmad64@gmail.com",
        "phone": "+91 84324 85204",
        "phoneRaw": "+918432485204",
        "whatsapp": "https://wa.me/918432485204",
        "whatsappHandle": "@ayyajahmad",
        "linkedin": "https://www.linkedin.com/in/ayyajahmad86",
        "linkedinHandle": "/in/ayyajahmad86",
        "github": "https://github.com/AyyajAhmad64",
        "githubHandle": "AyyajAhmad64",
        "locationString": "Hinjawadi, Pune, Maharashtra, India",
        "resumeDrive": "https://drive.google.com/file/d/12KXot7lG1r8qZ54S0iEqGudwYB9a18C8/view?usp=drivesdk",
        "resumePdf": "Ayyaj Kalandar Shaikh - Resume.pdf"
    }'::jsonb,
    '["Java", "Spring Boot", "React.js", "JavaScript", "ASP.NET Core", "MySQL", "SQL Server", "MongoDB", "AWS", "Git"]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    title = EXCLUDED.title,
    headline = EXCLUDED.headline,
    current_position = EXCLUDED.current_position,
    education_degree = EXCLUDED.education_degree,
    education_specialization = EXCLUDED.education_specialization,
    education_institution = EXCLUDED.education_institution,
    location = EXCLUDED.location,
    availability = EXCLUDED.availability,
    status = EXCLUDED.status,
    bio = EXCLUDED.bio,
    about_detailed = EXCLUDED.about_detailed,
    snapshot = EXCLUDED.snapshot,
    contact = EXCLUDED.contact,
    primary_skills = EXCLUDED.primary_skills,
    updated_at = now();

-- Purge any legacy address keys from profiles.contact that may have been seeded previously
UPDATE public.profiles
SET contact = contact - 'fullAddress' - 'full_address' - 'address'
WHERE contact ? 'fullAddress' OR contact ? 'full_address' OR contact ? 'address';

-- 2. SEED PRIVATE ADMIN PROFILE DETAILS
INSERT INTO public.admin_private_profile (
    id, profile_id, full_residential_address, address_lines, verification_notes
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Krishna Priyanka New Building, C101, 2nd Floor, The Legend Rd, Hinjawadi, Phase 1, Pune, Maharashtra 411057, India',
    '["Krishna Priyanka New Building,", "C101, 2nd Floor,", "The Legend Rd, Hinjawadi, Phase 1,", "Pune, Maharashtra 411057, India"]'::jsonb,
    'Verified address for background verification and legal documentation. ADMIN-ONLY — never exposed publicly.'
) ON CONFLICT (id) DO UPDATE SET
    full_residential_address = EXCLUDED.full_residential_address,
    address_lines = EXCLUDED.address_lines,
    updated_at = now();

-- 3. SEED SITE SETTINGS
INSERT INTO public.site_settings (
    id, site_title, enable_recruiter_mode, enable_contact_form, primary_accent, secondary_accent,
    public_location, show_availability_badge
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing',
    true, true, '#38bdf8', '#f59e0b',
    'Hinjawadi, Pune, Maharashtra, India', true
) ON CONFLICT (id) DO UPDATE SET
    site_title = EXCLUDED.site_title,
    public_location = EXCLUDED.public_location,
    updated_at = now();

-- 4. SEED RECRUITER SETTINGS
INSERT INTO public.recruiter_settings (
    id, summary, availability, target_roles, highlights, core_metrics
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Software Developer and MCA Cloud Computing student with practical experience in enterprise Java, Spring Boot, React.js, and relational SQL persistence. Currently contributing as a MERN Stack + AI Intern at BQARLSON Software Pvt. Ltd., specializing in robust layered architectures, REST API contracts, and scalable web solutions.',
    'Immediate / Notice-free for Software Developer & Engineering roles',
    '["Full Stack Developer", "Software Developer", "Java Backend Developer", "Cloud Engineer"]'::jsonb,
    '[
        "Enterprise Java & Spring Boot backend engineering with strict Controller-Service-Repository separation",
        "Modern React.js frontend architecture with decoupled state management and component hierarchies",
        "Relational persistence, normalization & query optimization in MySQL and Microsoft SQL Server",
        "Production exposure to MERN stack workflows, REST APIs, and practical AI integrations"
    ]'::jsonb,
    '[
        {"label": "DEGREE", "value": "MCA (Cloud Computing)", "note": "Expected 2027"},
        {"label": "UNDERGRAD", "value": "BCA (Computer Applications)", "note": "Completed 2023"},
        {"label": "EXPERIENCE", "value": "3 Internships", "note": "MERN+AI, Web Dev"},
        {"label": "PRIMARY STACK", "value": "Java, Spring Boot, React, SQL", "note": "Enterprise & Modern Web"}
    ]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    summary = EXCLUDED.summary,
    availability = EXCLUDED.availability,
    target_roles = EXCLUDED.target_roles,
    highlights = EXCLUDED.highlights,
    core_metrics = EXCLUDED.core_metrics,
    updated_at = now();

-- 5. SEED PROJECTS
INSERT INTO public.projects (
    id, slug, title, type, short_description, full_description, status, featured,
    thumbnail, live_url, github_url, category, tech_stack, features, problem,
    solution, architecture, challenges, learnings, sort_order, publication_status
) VALUES 
(
    '00000000-0000-0000-0001-000000000001', 'nexora', 'Nexora', 'Modern Full-Stack E-Commerce Platform',
    'Modern e-commerce web application focused on building a responsive shopping experience with clean architecture, product browsing, cart functionality, and authentication.',
    'Modern e-commerce web application focused on building a responsive shopping experience with clean architecture, product browsing, cart functionality, and authentication.',
    'In Development', true, '/projects/nexora-thumb.png', NULL, 'https://github.com/AyyajAhmad64',
    '["Full Stack", "React / JavaScript"]'::jsonb,
    '["React.js", "JavaScript", "REST APIs", "Database Design", "CSS3", "HTML5"]'::jsonb,
    '["Product catalog browsing with real-time category filtering", "Dynamic shopping cart with item quantity adjustments and instant total calculation", "User authentication state handling and protected checkout routing preparation", "Mobile-first responsive interface tailored for seamless interaction on any device"]'::jsonb,
    'Modern e-commerce storefronts frequently face issues with fragmented UI states, slow page updates during cart actions, and tight coupling between the catalog UI and business validation logic.',
    'Architected a modular component-driven interface with predictable state flow, decoupled catalog views, dynamic cart management, and seamless REST API integration points.',
    'Component-driven React frontend structured into presentational components, custom container hooks for state handling, and dedicated services for asynchronous REST API communication.',
    'Handling persistent local cart updates efficiently without re-rendering unrelated product catalog components, solved through clean React state decomposition.',
    'Mastered production-style React component structuring, client-side route protection, and optimizing component re-render boundaries for e-commerce workflows.',
    1, 'published'
),
(
    '00000000-0000-0000-0001-000000000002', 'silent-help', 'Silent Help', 'Community Support Platform',
    'CRUD platform for posting, managing, and tracking community help requests, structured into layered Controller-Service-Repository architecture for maintainability.',
    'CRUD platform for posting, managing, and tracking community help requests, structured into layered Controller-Service-Repository architecture for maintainability.',
    'Completed', true, '/projects/silent-help-thumb.png', NULL, 'https://github.com/AyyajAhmad64',
    '["Full Stack", "Java / Spring Boot"]'::jsonb,
    '["Java", "Spring Boot", "Hibernate / JPA", "MySQL", "Thymeleaf", "REST APIs", "Bootstrap", "Maven"]'::jsonb,
    '["Comprehensive CRUD operations for community help requests and status updates", "Strict layered Controller-Service-Repository architecture ensuring separation of concerns", "Relational persistence using MySQL with Hibernate ORM entity relationships and transactions", "Server-side validation and automated lifecycle management for help tickets"]'::jsonb,
    'Community assistance requests can be disorganized and lack visibility without a centralized, persistent tracker where individuals can post, update, and follow up on real needs.',
    'Engineered a robust multi-tier Java backend using Spring Boot, Hibernate/JPA, and MySQL for relational persistence, paired with structured server-rendered Thymeleaf templates.',
    'Three-tier enterprise architecture: Controller layer for HTTP request validation, Service layer for business domain logic and transaction boundaries, and Repository layer interfacing with MySQL via JPA.',
    'Ensuring proper data validation and atomic transactions during concurrent request status updates, solved by utilizing Spring''s transactional management.',
    'Deepened practical mastery of Spring Boot dependency injection, JPA relationship mapping (@OneToMany, @ManyToOne), and SQL schema optimization.',
    2, 'published'
),
(
    '00000000-0000-0000-0001-000000000003', 'bca-notes-hub', 'BCA Notes Hub', 'Academic Resource Platform',
    'Centralized academic portal for students to access and manage study resources and notes, backed by relational SQL Server database persistence.',
    'Centralized academic portal for students to access and manage study resources and notes, backed by relational SQL Server database persistence.',
    'Completed', true, '/projects/bca-notes-thumb.png', NULL, 'https://github.com/AyyajAhmad64',
    '["Full Stack", "ASP.NET / SQL"]'::jsonb,
    '["ASP.NET Core", "C#", "Microsoft SQL Server", "JavaScript", "Bootstrap", "HTML5", "CSS3"]'::jsonb,
    '["Centralized repository for course notes, syllabi, and past academic resources", "SQL Server-backed relational data management with normalized subject schemas", "Semester and subject-based organization enabling fast resource lookups", "Responsive user interface optimized for student access on both desktop and mobile"]'::jsonb,
    'Academic notes and subject study materials were scattered across disparate drives and messaging channels without structured semester-wise categorization.',
    'Developed a centralized academic web portal in ASP.NET Core with C# and Microsoft SQL Server to organize subject materials, syllabi, and semester reference documents.',
    'ASP.NET MVC architecture with strongly-typed view models, controller endpoints, and ADO.NET / Entity Framework database queries executed against Microsoft SQL Server.',
    'Optimizing relational schema queries for quick multi-criteria retrieval across diverse academic semesters and subjects.',
    'Strengthened enterprise .NET backend development skills, C# object-oriented programming, and Microsoft SQL Server administration.',
    3, 'published'
),
(
    '00000000-0000-0000-0001-000000000004', 'personal-portfolio', 'Personal Portfolio', 'Responsive Web Application',
    'Responsive developer portfolio web application built in React.js with modular components for project showcase, profile sections, and clean navigation.',
    'Responsive developer portfolio web application built in React.js with modular components for project showcase, profile sections, and clean navigation.',
    'Completed', false, '/projects/portfolio-thumb.png', NULL, 'https://github.com/AyyajAhmad64',
    '["Full Stack", "React / JavaScript"]'::jsonb,
    '["React.js", "JavaScript (ES6+)", "HTML5", "CSS3", "Bootstrap", "Git"]'::jsonb,
    '["Modular project and developer profile showcase components", "Fluid responsive layout tested across desktop, tablet, and mobile displays", "Direct contact integration with one-click clipboard copy utility", "Structured developer skill matrix and educational roadmap"]'::jsonb,
    'Developers need an accessible, professional digital presence that clearly presents skillsets, academic credentials, and project work across all form factors.',
    'Built a modular single-page portfolio application with structured component hierarchy, accessible navigation anchors, and responsive CSS layouts.',
    'Modular React architecture featuring decoupled UI components, centralized content configuration arrays, and responsive grid layouts.',
    'Maintaining crisp visual balance, clean typography, and zero horizontal overflow across extreme screen widths down to 360px.',
    'Strengthened core understanding of frontend architecture, component reusability, and CSS layout performance without heavy animation libraries.',
    4, 'published'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    tech_stack = EXCLUDED.tech_stack,
    features = EXCLUDED.features,
    problem = EXCLUDED.problem,
    solution = EXCLUDED.solution,
    architecture = EXCLUDED.architecture,
    challenges = EXCLUDED.challenges,
    learnings = EXCLUDED.learnings,
    publication_status = EXCLUDED.publication_status,
    updated_at = now();

-- 6. SEED EXPERIENCES
INSERT INTO public.experiences (
    id, company, role, location, employment_type, start_date, end_date, duration,
    current, description, technologies, sort_order, publication_status
) VALUES
(
    '00000000-0000-0000-0002-000000000001', 'BQARLSON Software Pvt. Ltd.', 'MERN Stack + AI Intern', 'Remote',
    'Internship', 'Sep 2026', 'Present', 'Current', true,
    'Working on MERN stack development and AI-related tasks, gaining practical experience in building modern web applications and integrating advanced AI capabilities into full-stack solutions.',
    '["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "AI Integration", "Git"]'::jsonb,
    1, 'published'
),
(
    '00000000-0000-0000-0002-000000000002', 'NullClass', 'Web Developer', 'Remote',
    'Internship', 'Nov 2024', 'Jan 2025', '3 mos', false,
    'Worked on practical web development tasks, strengthening frontend architecture, responsive styling consistency, and real-world application building skills.',
    '["JavaScript", "React.js", "HTML5", "CSS3", "Responsive Layouts", "Git"]'::jsonb,
    2, 'published'
),
(
    '00000000-0000-0000-0002-000000000003', 'SharpCareer Technologies', 'Web Development Intern', 'Remote',
    'Internship', 'May 2024', 'Jun 2024', '2 mos', false,
    'Developed responsive website pages and enhanced layout structures, ensuring design fidelity, typography harmony, and cross-browser consistency.',
    '["HTML5", "CSS3", "JavaScript", "UI Layouts", "Responsive Design"]'::jsonb,
    3, 'published'
) ON CONFLICT (id) DO UPDATE SET
    company = EXCLUDED.company,
    role = EXCLUDED.role,
    description = EXCLUDED.description,
    technologies = EXCLUDED.technologies,
    updated_at = now();

-- 7. SEED EDUCATION
INSERT INTO public.education (
    id, institution, degree, specialization, location, start_date, end_date,
    year, status, current, description, highlights, sort_order, publication_status
) VALUES
(
    '00000000-0000-0000-0003-000000000001', 'Dr. D. Y. Patil Institute of Management and Entrepreneur Development',
    'Master of Computer Applications (MCA)', 'Cloud Computing', 'Pune, Maharashtra, India', '2024', '2027',
    'Expected 2027', 'In Progress', true,
    'Postgraduate program focused on Cloud Computing, distributed systems, software engineering, enterprise backend design with Java & Spring Boot, and modern cloud deployment architectures.',
    '["Specialization in Cloud Computing infrastructure & AWS fundamentals", "Enterprise software design patterns and object-oriented architecture", "Advanced database engineering, relational query tuning, and distributed storage"]'::jsonb,
    1, 'published'
),
(
    '00000000-0000-0000-0003-000000000002', 'Shivraj College, Gadhinglaj (Shivaji University, Kolhapur)',
    'Bachelor of Computer Applications (BCA)', 'Computer Science & Software Development', 'Gadhinglaj, Maharashtra, India', '2020', '2023',
    'Completed 2023', 'Completed', false,
    'Comprehensive undergraduate foundation covering core computer science principles, object-oriented programming (C++, Java), relational database management, data structures, and web technologies.',
    '["Strong foundation in C++, Java, and Data Structures & Algorithms", "Relational database design with SQL Server & MySQL", "Academic project development using ASP.NET Core and Web Technologies"]'::jsonb,
    2, 'published'
),
(
    '00000000-0000-0000-0003-000000000003', 'Maharashtra State Board of Secondary and Higher Secondary Education',
    'Higher Secondary Certificate (HSC / 12th)', 'Science Stream', 'Maharashtra, India', '2018', '2020',
    '2020', 'Completed', false,
    'Higher secondary education curriculum with rigorous coursework in physics, chemistry, mathematics, and foundational computer concepts.',
    '["Analytical thinking and mathematical problem-solving foundation"]'::jsonb,
    3, 'published'
),
(
    '00000000-0000-0000-0003-000000000004', 'Maharashtra State Board of Secondary and Higher Secondary Education',
    'Secondary School Certificate (SSC / 10th)', 'General Curriculum', 'Maharashtra, India', '2017', '2018',
    '2018', 'Completed', false,
    'Secondary school education completing foundational schooling under the state educational board.',
    '["Graduated with fundamental general science and mathematics competencies"]'::jsonb,
    4, 'published'
) ON CONFLICT (id) DO UPDATE SET
    institution = EXCLUDED.institution,
    degree = EXCLUDED.degree,
    description = EXCLUDED.description,
    highlights = EXCLUDED.highlights,
    updated_at = now();

-- 8. SEED SKILLS (IDEMPOTENT ON (category, name))
INSERT INTO public.skills (category, category_badge, category_description, name, level, core, sort_order, publication_status) VALUES
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'Java', 'Advanced', true, 1, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'Spring Boot', 'Advanced', true, 2, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'REST APIs', 'Advanced', true, 3, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'Hibernate / JPA', 'Proficient', true, 4, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'MySQL', 'Proficient', true, 5, 'published'),
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'ASP.NET Core', 'Proficient', false, 6, 'published'),
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'C#', 'Proficient', false, 7, 'published'),
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'MVC Architecture', 'Proficient', false, 8, 'published'),
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'CRUD Systems', 'Advanced', false, 9, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'React.js', 'Proficient', true, 10, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'JavaScript (ES6+)', 'Proficient', true, 11, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'HTML5', 'Advanced', false, 12, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'CSS3', 'Advanced', false, 13, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'Bootstrap', 'Proficient', false, 14, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'Responsive Design', 'Advanced', false, 15, 'published'),
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'SQL Server (SSMS)', 'Proficient', false, 16, 'published'),
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'MySQL', 'Proficient', false, 17, 'published'),
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'MongoDB', 'Intermediate', false, 18, 'published'),
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'Database Design & Normalization', 'Proficient', false, 19, 'published'),
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'Cloud Computing Fundamentals', 'Proficient', false, 20, 'published'),
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'AWS Fundamentals', 'Intermediate', false, 21, 'published'),
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'RESTful Architecture', 'Advanced', false, 22, 'published'),
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'Layered (Controller-Service-Repository)', 'Advanced', false, 23, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Git', 'Advanced', false, 24, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'GitHub', 'Advanced', false, 25, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Postman', 'Proficient', false, 26, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Maven', 'Proficient', false, 27, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'VS Code', 'Advanced', false, 28, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Visual Studio', 'Proficient', false, 29, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'SQL Server Management Studio', 'Proficient', false, 30, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'MySQL Workbench', 'Proficient', false, 31, 'published'),
('CONCEPTS', 'Computer Science Foundation', 'Algorithmic thinking, object-oriented principles, and software methodologies.', 'Data Structures & Algorithms (DSA)', 'Proficient', false, 32, 'published'),
('CONCEPTS', 'Computer Science Foundation', 'Algorithmic thinking, object-oriented principles, and software methodologies.', 'Object-Oriented Programming (OOP)', 'Advanced', false, 33, 'published'),
('CONCEPTS', 'Computer Science Foundation', 'Algorithmic thinking, object-oriented principles, and software methodologies.', 'Model-View-Controller (MVC)', 'Advanced', false, 34, 'published'),
('CONCEPTS', 'Computer Science Foundation', 'Algorithmic thinking, object-oriented principles, and software methodologies.', 'Software Development Life Cycle (SDLC)', 'Proficient', false, 35, 'published')
ON CONFLICT (category, name) DO UPDATE SET
    level = EXCLUDED.level,
    core = EXCLUDED.core,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

-- 9. SEED CERTIFICATIONS
INSERT INTO public.certifications (
    id, title, issuer, date, status, description, skills, sort_order, publication_status
) VALUES
(
    '00000000-0000-0000-0004-000000000001', 'MERN Stack + AI Practical Development Training', 'BQARLSON Software Pvt. Ltd.',
    '2026', 'Active', 'Hands-on training and real-world project development focusing on React.js, Node.js, Express.js, MongoDB, and AI API integrations.',
    '["React.js", "Node.js", "Express.js", "MongoDB", "AI APIs", "REST Architecture"]'::jsonb, 1, 'published'
),
(
    '00000000-0000-0000-0004-000000000002', 'Full Stack Web Development Internship Credential', 'NullClass',
    'Jan 2025', 'Completed', 'Industry internship certification covering modern frontend engineering, component lifecycle, API consumption, and responsive interface design.',
    '["JavaScript", "HTML5", "CSS3", "React.js", "Git Version Control"]'::jsonb, 2, 'published'
),
(
    '00000000-0000-0000-0004-000000000003', 'Web Development Training & Internship Certificate', 'SharpCareer Technologies',
    'Jun 2024', 'Completed', 'Web development program emphasizing responsive design patterns, semantic markup, layout systems, and clean coding practices.',
    '["HTML5", "CSS3", "JavaScript", "Responsive Design"]'::jsonb, 3, 'published'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    skills = EXCLUDED.skills,
    updated_at = now();

-- 10. SEED ACHIEVEMENTS
INSERT INTO public.achievements (
    id, slug, title, type, organization, date, description, impact, highlights, sort_order, publication_status
) VALUES
(
    '00000000-0000-0000-0005-000000000001', 'mca-cloud-admission', 'Postgraduate Selection — MCA in Cloud Computing',
    'Academic Milestone', 'Dr. D. Y. Patil Institute of Management and Entrepreneur Development, Pune', '2024',
    'Secured admission to the specialized Master of Computer Applications program focused on Cloud Computing and Enterprise Software Architecture in Pune.',
    'Provides dedicated training in cloud infrastructure, enterprise software development, distributed architectures, and advanced engineering practices.',
    '["Specialized cloud curriculum covering AWS, virtualization, and enterprise computing", "Hands-on research and applied engineering lab access in Pune", "Focus on scalable distributed systems and modern backend microservices"]'::jsonb,
    1, 'published'
),
(
    '00000000-0000-0000-0005-000000000002', 'bqarlson-selection', 'Internship Selection — MERN Stack & AI Development',
    'Industry Selection', 'BQARLSON Software Pvt. Ltd.', 'Sep 2026',
    'Selected as MERN Stack + AI Intern to work on real-world web applications and artificial intelligence integration workflows.',
    'Gaining active production experience building full-stack applications and combining modern AI capabilities with responsive web interfaces.',
    '["Working on scalable full-stack React and Node.js solutions", "Practical exploration of AI-assisted features in production software", "Collaborating remotely with cross-functional engineering teams"]'::jsonb,
    2, 'published'
),
(
    '00000000-0000-0000-0005-000000000003', 'bca-graduation', 'Bachelor of Computer Applications Graduation',
    'Academic Milestone', 'Shivraj College, Gadhinglaj (Shivaji University, Kolhapur)', '2023',
    'Successfully completed degree in Bachelor of Computer Applications with distinction in core software development, database design, and object-oriented programming.',
    'Solidified core engineering principles in object-oriented programming, data structures, relational databases, and enterprise software foundations.',
    '["Rigorous coursework in C++, Java, DBMS, and Data Structures", "Capstone academic development project in ASP.NET Core & SQL Server", "Strong academic standing under Shivaji University, Kolhapur"]'::jsonb,
    3, 'published'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    impact = EXCLUDED.impact,
    highlights = EXCLUDED.highlights,
    publication_status = EXCLUDED.publication_status,
    updated_at = now();

-- 11. SEED GALLERY
INSERT INTO public.gallery (id, image_url, title, caption, category, sort_order, publication_status) VALUES
('00000000-0000-0000-0006-000000000001', '/profile.jpg', 'Ayyaj Kalandar Shaikh — Professional Developer Profile', 'Professional portrait of software engineer and MCA Cloud Computing student Ayyaj Kalandar Shaikh.', 'Other', 1, 'published'),
('00000000-0000-0000-0006-000000000002', '/audit-desktop.png', 'Portfolio Desktop Interface Audit & Architecture', 'High-resolution desktop interface architecture verification.', 'Projects', 2, 'published'),
('00000000-0000-0000-0006-000000000003', '/audit-mobile.png', 'Mobile Viewport Responsiveness Verification', 'Mobile viewport inspection verifying fluid layout stacking.', 'Projects', 3, 'published'),
('00000000-0000-0000-0006-000000000004', '/audit-typography.png', 'Typography System & Hierarchy Inspection', 'Typography review testing JetBrains Mono scale.', 'Projects', 4, 'published')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    caption = EXCLUDED.caption,
    category = EXCLUDED.category,
    updated_at = now();

-- 12. SEED DEFAULT RESUME
INSERT INTO public.resume_versions (id, title, file_url, version, is_active, notes) VALUES
('00000000-0000-0000-0007-000000000001', 'Ayyaj Kalandar Shaikh - Software Developer Resume', 'https://drive.google.com/file/d/12KXot7lG1r8qZ54S0iEqGudwYB9a18C8/view?usp=drivesdk', 'v2026.1', true, 'Active verified resume.')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    file_url = EXCLUDED.file_url,
    version = EXCLUDED.version,
    is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------
-- PART 3: ROW LEVEL SECURITY & HARDENED POLICIES
-- ------------------------------------------------------------

-- ADMIN CHECK FUNCTION (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- 1. Check registered active admin users
    IF EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    ) THEN
        RETURN TRUE;
    END IF;

    -- 2. Fallback check for designated portfolio owner in JWT
    IF LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'ayyajahmad64@gmail.com' THEN
        RETURN TRUE;
    END IF;

    -- 3. Check auth.users app_metadata
    IF (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- AUTO-PROVISION OWNER INTO admin_users TRIGGER
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

-- SERVER-SIDE CONTACT VALIDATION & RATE LIMITING
CREATE OR REPLACE FUNCTION public.validate_and_limit_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    recent_submissions INTEGER;
BEGIN
    NEW.name := trim(NEW.name);
    NEW.email := lower(trim(NEW.email));
    NEW.message := trim(NEW.message);

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

-- ANALYTICS ABUSE PROTECTION TRIGGER (with allowlist + payload size guard)
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

    -- Truncate page_path if necessary
    IF NEW.page_path IS NOT NULL AND length(NEW.page_path) > 255 THEN
        NEW.page_path := substr(NEW.page_path, 1, 255);
    END IF;

    -- Reject excessively large metadata payloads (> 2 KB serialized)
    IF NEW.metadata IS NOT NULL AND length(NEW.metadata::TEXT) > 2048 THEN
        NEW.metadata := '{}'::jsonb;
    END IF;

    -- Burst protection: max 120 events per minute across all visitors
    SELECT count(*) INTO burst_count
    FROM public.analytics_events
    WHERE created_at > (now() - INTERVAL '1 minute');

    IF burst_count >= 120 THEN
        RETURN NULL;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sanitize_analytics_event ON public.analytics_events;
CREATE TRIGGER trg_sanitize_analytics_event
    BEFORE INSERT ON public.analytics_events
    FOR EACH ROW EXECUTE FUNCTION public.sanitize_analytics_event();

-- ENABLE RLS
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

-- PUBLIC READ POLICIES
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on site_settings" ON public.site_settings;
CREATE POLICY "Allow public read on site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on recruiter_settings" ON public.recruiter_settings;
CREATE POLICY "Allow public read on recruiter_settings" ON public.recruiter_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on published projects" ON public.projects;
CREATE POLICY "Allow public read on published projects" ON public.projects FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on project_images" ON public.project_images;
CREATE POLICY "Allow public read on project_images" ON public.project_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on published experiences" ON public.experiences;
CREATE POLICY "Allow public read on published experiences" ON public.experiences FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published education" ON public.education;
CREATE POLICY "Allow public read on published education" ON public.education FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published skills" ON public.skills;
CREATE POLICY "Allow public read on published skills" ON public.skills FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published certifications" ON public.certifications;
CREATE POLICY "Allow public read on published certifications" ON public.certifications FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published achievements" ON public.achievements;
CREATE POLICY "Allow public read on published achievements" ON public.achievements FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on published gallery" ON public.gallery;
CREATE POLICY "Allow public read on published gallery" ON public.gallery FOR SELECT USING (publication_status = 'published');

DROP POLICY IF EXISTS "Allow public read on media" ON public.media;
CREATE POLICY "Allow public read on media" ON public.media FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "Allow public read on active resume_versions" ON public.resume_versions;
CREATE POLICY "Allow public read on active resume_versions" ON public.resume_versions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow public insert on messages" ON public.messages;
CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on analytics_events" ON public.analytics_events;
CREATE POLICY "Allow public insert on analytics_events" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- HARDENED ADMIN ONLY WRITE/READ POLICIES (STRICT: public.is_admin() ONLY)
DROP POLICY IF EXISTS "Admin full access on admin_users" ON public.admin_users;
CREATE POLICY "Admin full access on admin_users" ON public.admin_users FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on admin_private_profile" ON public.admin_private_profile;
CREATE POLICY "Admin full access on admin_private_profile" ON public.admin_private_profile FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on profiles" ON public.profiles;
CREATE POLICY "Admin full access on profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on site_settings" ON public.site_settings;
CREATE POLICY "Admin full access on site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on recruiter_settings" ON public.recruiter_settings;
CREATE POLICY "Admin full access on recruiter_settings" ON public.recruiter_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on projects" ON public.projects;
CREATE POLICY "Admin full access on projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on project_images" ON public.project_images;
CREATE POLICY "Admin full access on project_images" ON public.project_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on experiences" ON public.experiences;
CREATE POLICY "Admin full access on experiences" ON public.experiences FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on education" ON public.education;
CREATE POLICY "Admin full access on education" ON public.education FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on skills" ON public.skills;
CREATE POLICY "Admin full access on skills" ON public.skills FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on certifications" ON public.certifications;
CREATE POLICY "Admin full access on certifications" ON public.certifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on achievements" ON public.achievements;
CREATE POLICY "Admin full access on achievements" ON public.achievements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on gallery" ON public.gallery;
CREATE POLICY "Admin full access on gallery" ON public.gallery FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on media" ON public.media;
CREATE POLICY "Admin full access on media" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on resume_versions" ON public.resume_versions;
CREATE POLICY "Admin full access on resume_versions" ON public.resume_versions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on messages" ON public.messages;
CREATE POLICY "Admin full access on messages" ON public.messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on content_versions" ON public.content_versions;
CREATE POLICY "Admin full access on content_versions" ON public.content_versions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on audit_logs" ON public.audit_logs;
CREATE POLICY "Admin full access on audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access on analytics_events" ON public.analytics_events;
CREATE POLICY "Admin full access on analytics_events" ON public.analytics_events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- PART 4: STORAGE BUCKETS & HARDENED ACCESS
-- ------------------------------------------------------------
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
CREATE POLICY "Allow public read on portfolio-media" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Allow public read on resume bucket" ON storage.objects;
CREATE POLICY "Allow public read on resume bucket" ON storage.objects FOR SELECT USING (bucket_id = 'resume');

-- Storage Admin Write Access (STRICT: Requires public.is_admin())
DROP POLICY IF EXISTS "Admin insert to portfolio-media" ON storage.objects;
CREATE POLICY "Admin insert to portfolio-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-media' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update to portfolio-media" ON storage.objects;
CREATE POLICY "Admin update to portfolio-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-media' AND public.is_admin()) WITH CHECK (bucket_id = 'portfolio-media' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete from portfolio-media" ON storage.objects;
CREATE POLICY "Admin delete from portfolio-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-media' AND public.is_admin());

DROP POLICY IF EXISTS "Admin insert to resume bucket" ON storage.objects;
CREATE POLICY "Admin insert to resume bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resume' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update to resume bucket" ON storage.objects;
CREATE POLICY "Admin update to resume bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resume' AND public.is_admin()) WITH CHECK (bucket_id = 'resume' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete from resume bucket" ON storage.objects;
CREATE POLICY "Admin delete from resume bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resume' AND public.is_admin());
