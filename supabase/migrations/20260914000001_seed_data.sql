-- ============================================================
-- AYYAJ KALANDAR SHAIKH — PERSONAL DEVELOPER PLATFORM
-- Supabase Initial Seed Data Migration (Idempotent & Privacy-Preserving)
-- Migration: 20260914000001_seed_data.sql
-- ============================================================

-- 1. SEED PUBLIC PROFILES (Compact Public Location Only)
INSERT INTO public.profiles (
    id,
    name,
    short_name,
    title,
    headline,
    current_position,
    education_degree,
    education_specialization,
    education_institution,
    location,
    availability,
    status,
    bio,
    about_detailed,
    snapshot,
    contact,
    primary_skills
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

-- Ensure any legacy fullAddress or address fields are stripped if previously present
UPDATE public.profiles
SET contact = contact - 'fullAddress' - 'full_address' - 'address'
WHERE contact ? 'fullAddress' OR contact ? 'full_address' OR contact ? 'address';

-- 2. SEED PRIVATE ADMIN PROFILE DETAILS (Restricted to Admin Only)
INSERT INTO public.admin_private_profile (
    id,
    profile_id,
    full_residential_address,
    address_lines,
    verification_notes
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Krishna Priyanka New Building, C101, 2nd Floor, The Legend Rd, Hinjawadi, Phase 1, Pune, Maharashtra 411057, India',
    '["Krishna Priyanka New Building,", "C101, 2nd Floor,", "The Legend Rd, Hinjawadi, Phase 1,", "Pune, Maharashtra 411057, India"]'::jsonb,
    'Verified address for background verification and legal documentation.'
) ON CONFLICT (id) DO UPDATE SET
    full_residential_address = EXCLUDED.full_residential_address,
    address_lines = EXCLUDED.address_lines,
    updated_at = now();

-- 3. SEED SITE SETTINGS (Compact Location)
INSERT INTO public.site_settings (
    id,
    site_title,
    enable_recruiter_mode,
    enable_contact_form,
    primary_accent,
    secondary_accent,
    public_location,
    show_availability_badge
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ayyaj Kalandar Shaikh | Software Developer & Cloud Computing',
    true,
    true,
    '#38bdf8',
    '#f59e0b',
    'Hinjawadi, Pune, Maharashtra, India',
    true
) ON CONFLICT (id) DO UPDATE SET
    site_title = EXCLUDED.site_title,
    public_location = EXCLUDED.public_location,
    updated_at = now();

-- 4. SEED RECRUITER SETTINGS
INSERT INTO public.recruiter_settings (
    id,
    summary,
    availability,
    target_roles,
    highlights,
    core_metrics
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
    id,
    slug,
    title,
    type,
    short_description,
    full_description,
    status,
    featured,
    thumbnail,
    live_url,
    github_url,
    category,
    tech_stack,
    features,
    problem,
    solution,
    architecture,
    challenges,
    learnings,
    sort_order,
    publication_status
) VALUES 
(
    '00000000-0000-0000-0001-000000000001',
    'nexora',
    'Nexora',
    'Modern Full-Stack E-Commerce Platform',
    'Modern e-commerce web application focused on building a responsive shopping experience with clean architecture, product browsing, cart functionality, and authentication.',
    'Modern e-commerce web application focused on building a responsive shopping experience with clean architecture, product browsing, cart functionality, and authentication.',
    'In Development',
    true,
    '/projects/nexora-thumb.png',
    NULL,
    'https://github.com/AyyajAhmad64',
    '["Full Stack", "React / JavaScript"]'::jsonb,
    '["React.js", "JavaScript", "REST APIs", "Database Design", "CSS3", "HTML5"]'::jsonb,
    '[
        "Product catalog browsing with real-time category filtering",
        "Dynamic shopping cart with item quantity adjustments and instant total calculation",
        "User authentication state handling and protected checkout routing preparation",
        "Mobile-first responsive interface tailored for seamless interaction on any device"
    ]'::jsonb,
    'Modern e-commerce storefronts frequently face issues with fragmented UI states, slow page updates during cart actions, and tight coupling between the catalog UI and business validation logic.',
    'Architected a modular component-driven interface with predictable state flow, decoupled catalog views, dynamic cart management, and seamless REST API integration points.',
    'Component-driven React frontend structured into presentational components, custom container hooks for state handling, and dedicated services for asynchronous REST API communication.',
    'Handling persistent local cart updates efficiently without re-rendering unrelated product catalog components, solved through clean React state decomposition.',
    'Mastered production-style React component structuring, client-side route protection, and optimizing component re-render boundaries for e-commerce workflows.',
    1,
    'published'
),
(
    '00000000-0000-0000-0001-000000000002',
    'silent-help',
    'Silent Help',
    'Community Support Platform',
    'CRUD platform for posting, managing, and tracking community help requests, structured into layered Controller-Service-Repository architecture for maintainability.',
    'CRUD platform for posting, managing, and tracking community help requests, structured into layered Controller-Service-Repository architecture for maintainability.',
    'Completed',
    true,
    '/projects/silent-help-thumb.png',
    NULL,
    'https://github.com/AyyajAhmad64',
    '["Full Stack", "Java / Spring Boot"]'::jsonb,
    '["Java", "Spring Boot", "Hibernate / JPA", "MySQL", "Thymeleaf", "REST APIs", "Bootstrap", "Maven"]'::jsonb,
    '[
        "Comprehensive CRUD operations for community help requests and status updates",
        "Strict layered Controller-Service-Repository architecture ensuring separation of concerns",
        "Relational persistence using MySQL with Hibernate ORM entity relationships and transactions",
        "Server-side validation and automated lifecycle management for help tickets"
    ]'::jsonb,
    'Community assistance requests can be disorganized and lack visibility without a centralized, persistent tracker where individuals can post, update, and follow up on real needs.',
    'Engineered a robust multi-tier Java backend using Spring Boot, Hibernate/JPA, and MySQL for relational persistence, paired with structured server-rendered Thymeleaf templates.',
    'Three-tier enterprise architecture: Controller layer for HTTP request validation, Service layer for business domain logic and transaction boundaries, and Repository layer interfacing with MySQL via JPA.',
    'Ensuring proper data validation and atomic transactions during concurrent request status updates, solved by utilizing Spring''s transactional management.',
    'Deepened practical mastery of Spring Boot dependency injection, JPA relationship mapping (@OneToMany, @ManyToOne), and SQL schema optimization.',
    2,
    'published'
),
(
    '00000000-0000-0000-0001-000000000003',
    'bca-notes-hub',
    'BCA Notes Hub',
    'Academic Resource Platform',
    'Centralized academic portal for students to access and manage study resources and notes, backed by relational SQL Server database persistence.',
    'Centralized academic portal for students to access and manage study resources and notes, backed by relational SQL Server database persistence.',
    'Completed',
    true,
    '/projects/bca-notes-thumb.png',
    NULL,
    'https://github.com/AyyajAhmad64',
    '["Full Stack", "ASP.NET / SQL"]'::jsonb,
    '["ASP.NET Core", "C#", "Microsoft SQL Server", "JavaScript", "Bootstrap", "HTML5", "CSS3"]'::jsonb,
    '[
        "Centralized repository for course notes, syllabi, and past academic resources",
        "SQL Server-backed relational data management with normalized subject schemas",
        "Semester and subject-based organization enabling fast resource lookups",
        "Responsive user interface optimized for student access on both desktop and mobile"
    ]'::jsonb,
    'Academic notes and subject study materials were scattered across disparate drives and messaging channels without structured semester-wise categorization.',
    'Developed a centralized academic web portal in ASP.NET Core with C# and Microsoft SQL Server to organize subject materials, syllabi, and semester reference documents.',
    'ASP.NET MVC architecture with strongly-typed view models, controller endpoints, and ADO.NET / Entity Framework database queries executed against Microsoft SQL Server.',
    'Optimizing relational schema queries for quick multi-criteria retrieval across diverse academic semesters and subjects.',
    'Strengthened enterprise .NET backend development skills, C# object-oriented programming, and Microsoft SQL Server administration.',
    3,
    'published'
),
(
    '00000000-0000-0000-0001-000000000004',
    'personal-portfolio',
    'Personal Portfolio',
    'Responsive Web Application',
    'Responsive developer portfolio web application built in React.js with modular components for project showcase, profile sections, and clean navigation.',
    'Responsive developer portfolio web application built in React.js with modular components for project showcase, profile sections, and clean navigation.',
    'Completed',
    false,
    '/projects/portfolio-thumb.png',
    NULL,
    'https://github.com/AyyajAhmad64',
    '["Full Stack", "React / JavaScript"]'::jsonb,
    '["React.js", "JavaScript (ES6+)", "HTML5", "CSS3", "Bootstrap", "Git"]'::jsonb,
    '[
        "Modular project and developer profile showcase components",
        "Fluid responsive layout tested across desktop, tablet, and mobile displays",
        "Direct contact integration with one-click clipboard copy utility",
        "Structured developer skill matrix and educational roadmap"
    ]'::jsonb,
    'Developers need an accessible, professional digital presence that clearly presents skillsets, academic credentials, and project work across all form factors.',
    'Built a modular single-page portfolio application with structured component hierarchy, accessible navigation anchors, and responsive CSS layouts.',
    'Modular React architecture featuring decoupled UI components, centralized content configuration arrays, and responsive grid layouts.',
    'Maintaining crisp visual balance, clean typography, and zero horizontal overflow across extreme screen widths down to 360px.',
    'Strengthened core understanding of frontend architecture, component reusability, and CSS layout performance without heavy animation libraries.',
    4,
    'published'
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
    id,
    company,
    role,
    location,
    employment_type,
    start_date,
    end_date,
    duration,
    current,
    description,
    technologies,
    sort_order,
    publication_status
) VALUES
(
    '00000000-0000-0000-0002-000000000001',
    'BQARLSON Software Pvt. Ltd.',
    'MERN Stack + AI Intern',
    'Remote',
    'Internship',
    'Sep 2026',
    'Present',
    'Current',
    true,
    'Working on MERN stack development and AI-related tasks, gaining practical experience in building modern web applications and integrating advanced AI capabilities into full-stack solutions.',
    '["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "AI Integration", "Git"]'::jsonb,
    1,
    'published'
),
(
    '00000000-0000-0000-0002-000000000002',
    'NullClass',
    'Web Developer',
    'Remote',
    'Internship',
    'Nov 2024',
    'Jan 2025',
    '3 mos',
    false,
    'Worked on practical web development tasks, strengthening frontend architecture, responsive styling consistency, and real-world application building skills.',
    '["JavaScript", "React.js", "HTML5", "CSS3", "Responsive Layouts", "Git"]'::jsonb,
    2,
    'published'
),
(
    '00000000-0000-0000-0002-000000000003',
    'SharpCareer Technologies',
    'Web Development Intern',
    'Remote',
    'Internship',
    'May 2024',
    'Jun 2024',
    '2 mos',
    false,
    'Developed responsive website pages and enhanced layout structures, ensuring design fidelity, typography harmony, and cross-browser consistency.',
    '["HTML5", "CSS3", "JavaScript", "UI Layouts", "Responsive Design"]'::jsonb,
    3,
    'published'
) ON CONFLICT (id) DO UPDATE SET
    company = EXCLUDED.company,
    role = EXCLUDED.role,
    description = EXCLUDED.description,
    technologies = EXCLUDED.technologies,
    updated_at = now();

-- 7. SEED EDUCATION
INSERT INTO public.education (
    id,
    institution,
    degree,
    specialization,
    location,
    start_date,
    end_date,
    year,
    status,
    current,
    description,
    highlights,
    sort_order,
    publication_status
) VALUES
(
    '00000000-0000-0000-0003-000000000001',
    'Dr. D. Y. Patil Institute of Management and Entrepreneur Development',
    'Master of Computer Applications (MCA)',
    'Cloud Computing',
    'Pune, Maharashtra, India',
    '2024',
    '2027',
    'Expected 2027',
    'In Progress',
    true,
    'Postgraduate program focused on Cloud Computing, distributed systems, software engineering, enterprise backend design with Java & Spring Boot, and modern cloud deployment architectures.',
    '[
        "Specialization in Cloud Computing infrastructure & AWS fundamentals",
        "Enterprise software design patterns and object-oriented architecture",
        "Advanced database engineering, relational query tuning, and distributed storage"
    ]'::jsonb,
    1,
    'published'
),
(
    '00000000-0000-0000-0003-000000000002',
    'Shivraj College, Gadhinglaj (Shivaji University, Kolhapur)',
    'Bachelor of Computer Applications (BCA)',
    'Computer Science & Software Development',
    'Gadhinglaj, Maharashtra, India',
    '2020',
    '2023',
    'Completed 2023',
    'Completed',
    false,
    'Comprehensive undergraduate foundation covering core computer science principles, object-oriented programming (C++, Java), relational database management, data structures, and web technologies.',
    '[
        "Strong foundation in C++, Java, and Data Structures & Algorithms",
        "Relational database design with SQL Server & MySQL",
        "Academic project development using ASP.NET Core and Web Technologies"
    ]'::jsonb,
    2,
    'published'
),
(
    '00000000-0000-0000-0003-000000000003',
    'Maharashtra State Board of Secondary and Higher Secondary Education',
    'Higher Secondary Certificate (HSC / 12th)',
    'Science Stream',
    'Maharashtra, India',
    '2018',
    '2020',
    '2020',
    'Completed',
    false,
    'Higher secondary education curriculum with rigorous coursework in physics, chemistry, mathematics, and foundational computer concepts.',
    '["Analytical thinking and mathematical problem-solving foundation"]'::jsonb,
    3,
    'published'
),
(
    '00000000-0000-0000-0003-000000000004',
    'Maharashtra State Board of Secondary and Higher Secondary Education',
    'Secondary School Certificate (SSC / 10th)',
    'General Curriculum',
    'Maharashtra, India',
    '2017',
    '2018',
    '2018',
    'Completed',
    false,
    'Secondary school education completing foundational schooling under the state educational board.',
    '["Graduated with fundamental general science and mathematics competencies"]'::jsonb,
    4,
    'published'
) ON CONFLICT (id) DO UPDATE SET
    institution = EXCLUDED.institution,
    degree = EXCLUDED.degree,
    description = EXCLUDED.description,
    highlights = EXCLUDED.highlights,
    updated_at = now();

-- 8. SEED SKILLS (IDEMPOTENT VIA ON CONFLICT (category, name))
INSERT INTO public.skills (category, category_badge, category_description, name, level, core, sort_order, publication_status) VALUES
-- CORE BACKEND
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'Java', 'Advanced', true, 1, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'Spring Boot', 'Advanced', true, 2, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'REST APIs', 'Advanced', true, 3, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'Hibernate / JPA', 'Proficient', true, 4, 'published'),
('CORE BACKEND', 'Primary Focus', 'Enterprise backend architecture, server-side development, and RESTful APIs.', 'MySQL', 'Proficient', true, 5, 'published'),

-- ADDITIONAL BACKEND
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'ASP.NET Core', 'Proficient', false, 6, 'published'),
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'C#', 'Proficient', false, 7, 'published'),
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'MVC Architecture', 'Proficient', false, 8, 'published'),
('ADDITIONAL BACKEND', 'Secondary Focus', 'Multi-framework backend capabilities and MVC web architectures.', 'CRUD Systems', 'Advanced', false, 9, 'published'),

-- FRONTEND
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'React.js', 'Proficient', true, 10, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'JavaScript (ES6+)', 'Proficient', true, 11, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'HTML5', 'Advanced', false, 12, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'CSS3', 'Advanced', false, 13, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'Bootstrap', 'Proficient', false, 14, 'published'),
('FRONTEND', 'Client-Side Engineering', 'Building responsive, modern, and accessible user interfaces.', 'Responsive Design', 'Advanced', false, 15, 'published'),

-- DATABASES
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'SQL Server (SSMS)', 'Proficient', false, 16, 'published'),
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'MySQL', 'Proficient', false, 17, 'published'),
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'MongoDB', 'Intermediate', false, 18, 'published'),
('DATABASES', 'Data Persistence', 'Relational modeling, normalization, and persistent query execution.', 'Database Design & Normalization', 'Proficient', false, 19, 'published'),

-- CLOUD & ARCHITECTURE
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'Cloud Computing Fundamentals', 'Proficient', false, 20, 'published'),
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'AWS Fundamentals', 'Intermediate', false, 21, 'published'),
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'RESTful Architecture', 'Advanced', false, 22, 'published'),
('CLOUD & ARCHITECTURE', 'Infrastructure & Scalability', 'Cloud computing fundamentals, AWS core services, and system architectures.', 'Layered (Controller-Service-Repository)', 'Advanced', false, 23, 'published'),

-- TOOLS & PLATFORMS
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Git', 'Advanced', false, 24, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'GitHub', 'Advanced', false, 25, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Postman', 'Proficient', false, 26, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Maven', 'Proficient', false, 27, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'VS Code', 'Advanced', false, 28, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'Visual Studio', 'Proficient', false, 29, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'SQL Server Management Studio', 'Proficient', false, 30, 'published'),
('TOOLS & PLATFORMS', 'Workflow & Environment', 'Developer tooling, version control, and API testing utilities.', 'MySQL Workbench', 'Proficient', false, 31, 'published'),

-- CONCEPTS
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
    id,
    title,
    issuer,
    date,
    status,
    description,
    skills,
    sort_order,
    publication_status
) VALUES
(
    '00000000-0000-0000-0004-000000000001',
    'MERN Stack + AI Practical Development Training',
    'BQARLSON Software Pvt. Ltd.',
    '2026',
    'Active',
    'Hands-on training and real-world project development focusing on React.js, Node.js, Express.js, MongoDB, and AI API integrations.',
    '["React.js", "Node.js", "Express.js", "MongoDB", "AI APIs", "REST Architecture"]'::jsonb,
    1,
    'published'
),
(
    '00000000-0000-0000-0004-000000000002',
    'Full Stack Web Development Internship Credential',
    'NullClass',
    'Jan 2025',
    'Completed',
    'Industry internship certification covering modern frontend engineering, component lifecycle, API consumption, and responsive interface design.',
    '["JavaScript", "HTML5", "CSS3", "React.js", "Git Version Control"]'::jsonb,
    2,
    'published'
),
(
    '00000000-0000-0000-0004-000000000003',
    'Web Development Training & Internship Certificate',
    'SharpCareer Technologies',
    'Jun 2024',
    'Completed',
    'Web development program emphasizing responsive design patterns, semantic markup, layout systems, and clean coding practices.',
    '["HTML5", "CSS3", "JavaScript", "Responsive Design"]'::jsonb,
    3,
    'published'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    skills = EXCLUDED.skills,
    updated_at = now();

-- 10. SEED ACHIEVEMENTS
INSERT INTO public.achievements (
    id,
    slug,
    title,
    type,
    organization,
    date,
    description,
    impact,
    highlights,
    sort_order,
    publication_status
) VALUES
(
    '00000000-0000-0000-0005-000000000001',
    'mca-cloud-admission',
    'Postgraduate Selection — MCA in Cloud Computing',
    'Academic Milestone',
    'Dr. D. Y. Patil Institute of Management and Entrepreneur Development, Pune',
    '2024',
    'Secured admission to the specialized Master of Computer Applications program focused on Cloud Computing and Enterprise Software Architecture in Pune.',
    'Provides dedicated training in cloud infrastructure, enterprise software development, distributed architectures, and advanced engineering practices.',
    '[
        "Specialized cloud curriculum covering AWS, virtualization, and enterprise computing",
        "Hands-on research and applied engineering lab access in Pune",
        "Focus on scalable distributed systems and modern backend microservices"
    ]'::jsonb,
    1,
    'published'
),
(
    '00000000-0000-0000-0005-000000000002',
    'bqarlson-selection',
    'Internship Selection — MERN Stack & AI Development',
    'Industry Selection',
    'BQARLSON Software Pvt. Ltd.',
    'Sep 2026',
    'Selected as MERN Stack + AI Intern to work on real-world web applications and artificial intelligence integration workflows.',
    'Gaining active production experience building full-stack applications and combining modern AI capabilities with responsive web interfaces.',
    '[
        "Working on scalable full-stack React and Node.js solutions",
        "Practical exploration of AI-assisted features in production software",
        "Collaborating remotely with cross-functional engineering teams"
    ]'::jsonb,
    2,
    'published'
),
(
    '00000000-0000-0000-0005-000000000003',
    'bca-graduation',
    'Bachelor of Computer Applications Graduation',
    'Academic Milestone',
    'Shivraj College, Gadhinglaj (Shivaji University, Kolhapur)',
    '2023',
    'Successfully completed degree in Bachelor of Computer Applications with distinction in core software development, database design, and object-oriented programming.',
    'Solidified core engineering principles in object-oriented programming, data structures, relational databases, and enterprise software foundations.',
    '[
        "Rigorous coursework in C++, Java, DBMS, and Data Structures",
        "Capstone academic development project in ASP.NET Core & SQL Server",
        "Strong academic standing under Shivaji University, Kolhapur"
    ]'::jsonb,
    3,
    'published'
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    impact = EXCLUDED.impact,
    highlights = EXCLUDED.highlights,
    publication_status = EXCLUDED.publication_status,
    updated_at = now();

-- 11. SEED GALLERY
INSERT INTO public.gallery (
    id,
    image_url,
    title,
    caption,
    category,
    sort_order,
    publication_status
) VALUES
(
    '00000000-0000-0000-0006-000000000001',
    '/profile.jpg',
    'Ayyaj Kalandar Shaikh — Professional Developer Profile',
    'Professional portrait of software engineer and MCA Cloud Computing student Ayyaj Kalandar Shaikh.',
    'Other',
    1,
    'published'
),
(
    '00000000-0000-0000-0006-000000000002',
    '/audit-desktop.png',
    'Portfolio Desktop Interface Audit & Architecture',
    'High-resolution desktop interface architecture verification showing structured layouts, developer status panel, and typography balance.',
    'Projects',
    2,
    'published'
),
(
    '00000000-0000-0000-0006-000000000003',
    '/audit-mobile.png',
    'Mobile Viewport Responsiveness Verification',
    'Mobile viewport inspection verifying fluid layout stacking, accessible touch targets, and zero horizontal overflow on small screens.',
    'Projects',
    3,
    'published'
),
(
    '00000000-0000-0000-0006-000000000004',
    '/audit-typography.png',
    'Typography System & Hierarchy Inspection',
    'Typography review testing JetBrains Mono scale, line-height geometry, and strict WCAG color contrast fidelity.',
    'Projects',
    4,
    'published'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    caption = EXCLUDED.caption,
    category = EXCLUDED.category,
    updated_at = now();

-- 12. SEED DEFAULT ACTIVE RESUME
INSERT INTO public.resume_versions (
    id,
    title,
    file_url,
    version,
    is_active,
    notes
) VALUES (
    '00000000-0000-0000-0007-000000000001',
    'Ayyaj Kalandar Shaikh - Software Developer Resume',
    'https://drive.google.com/file/d/12KXot7lG1r8qZ54S0iEqGudwYB9a18C8/view?usp=drivesdk',
    'v2026.1',
    true,
    'Active resume pointing to primary verified Google Drive link and local PDF asset.'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    file_url = EXCLUDED.file_url,
    version = EXCLUDED.version,
    is_active = EXCLUDED.is_active;
