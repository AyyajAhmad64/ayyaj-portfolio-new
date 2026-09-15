# Supabase Cloud Architecture & Setup Guide
## Ayyaj Kalandar Shaikh — Personal Developer Platform

This guide provides step-by-step instructions for running migrations, configuring authentication, enforcing hardened Row Level Security (RLS), provisioning storage, and deploying the portfolio with the Supabase Cloud CMS.

---

## Table of Contents

1. [Migration Execution Guide](#1-migration-execution-guide)
2. [First Admin User Creation](#2-first-admin-user-creation)
3. [Admin Authorization Mechanics (RLS + Allowlist)](#3-admin-authorization-mechanics-rls--allowlist)
4. [Environment Variables Configuration](#4-environment-variables-configuration)
5. [Storage Buckets Configuration](#5-storage-buckets-configuration)
6. [Testing & Verification (Admin vs Anonymous Access)](#6-testing--verification-admin-vs-anonymous-access)
7. [Production Deployment Instructions](#7-production-deployment-instructions)

---

## 1. Migration Execution Guide

You can run the hardened database migrations in Supabase using either the **single all-in-one script** or the **three separate migrations in order**.

### Recommended: All-In-One Migration

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left navigation, click **SQL Editor**.
3. Click **New query**.
4. Open [`supabase/migrations/combined_all_migrations.sql`](./supabase/migrations/combined_all_migrations.sql), copy the entire contents, and paste them into the SQL Editor.
5. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
6. The query will execute idempotently:
   - Sets up all 18 tables (including `admin_users` and `admin_private_profile`).
   - Seeds all real, verified portfolio records (Nexora, Silent Help, BCA Notes Hub, BQARLSON & NullClass internships, MCA, skills, certifications).
   - Seeds safe public location: `Hinjawadi, Pune, Maharashtra, India`.
   - Creates the `public.is_admin()` `SECURITY DEFINER` function and auto-provisioning triggers.
   - Enforces strict RLS policies on all tables.
   - Enforces server-side contact form validation + 5 msgs/hour rate limit.
   - Enforces analytics burst protection (120 events/minute).
   - Creates and secures the `portfolio-media` and `resume` storage buckets.

### Alternative: Three-Step Migration Sequence

If you prefer applying changes incrementally:
1. **Migration 1 (Schema):** Run [`supabase/migrations/20260914000000_initial_schema.sql`](./supabase/migrations/20260914000000_initial_schema.sql)
2. **Migration 2 (Seed Data):** Run [`supabase/migrations/20260914000001_seed_data.sql`](./supabase/migrations/20260914000001_seed_data.sql)
3. **Migration 3 (RLS & Storage):** Run [`supabase/migrations/20260914000002_rls_and_storage.sql`](./supabase/migrations/20260914000002_rls_and_storage.sql)

---

## 2. First Admin User Creation

To access the CMS dashboard (`/admin`), your user account must be registered in Supabase Auth and recognized by the authorization system.

### Option A: Automatic Provisioning via Email (Recommended)

1. In the Supabase Dashboard, go to **Authentication** → **Users**.
2. Click **Add User** → **Create User**.
3. Enter:
   - **Email:** `ayyajahmad64@gmail.com`
   - **Password:** Enter a strong password (minimum 12 characters).
   - **Auto Confirm User?**: **Checked** (bypasses email confirmation requirement).
4. Click **Create User**.
5. The trigger `on_auth_user_created_admin` will automatically detect `ayyajahmad64@gmail.com` and insert a record into `public.admin_users` with `role = 'superadmin'` and `is_active = true`.

### Option B: Manual SQL Assignment (For any custom email)

If you created an account with a different email address:
1. Copy the User UUID from **Authentication** → **Users**.
2. In the **SQL Editor**, run:
```sql
INSERT INTO public.admin_users (id, email, role, is_active)
VALUES ('<PASTE-USER-UUID-HERE>', 'your_email@example.com', 'superadmin', true)
ON CONFLICT (id) DO UPDATE SET is_active = true, updated_at = now();
```

---

## 3. Admin Authorization Mechanics (RLS + Allowlist)

### Security Model Overview

Unlike vulnerable setups that grant write access to `TO authenticated USING (true)`, this portfolio uses **Role-Based Admin Verification** via `public.is_admin()`.

```
                    ┌────────────────────────────┐
                    │ Client Request             │
                    └─────────────┬──────────────┘
                                  │
                   RLS Check on INSERT/UPDATE/DELETE
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │  public.is_admin()         │
                    │  (SECURITY DEFINER)        │
                    └─────────────┬──────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
 1. Check `admin_users`    2. Check JWT email       3. Check app_metadata
    where id = auth.uid()     = 'ayyajahmad64@'        role = 'admin'
    and is_active = true
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                        True: Proceed (CMS Write)
                        False: Denied (HTTP 403 / RLS Error)
```

### Key Security Principles:
1. **Zero Anonymous Write Access:** Unauthenticated users can only `INSERT` into `messages` (contact form) and `analytics_events`.
2. **Zero Write Access for Normal Authenticated Users:** If a random visitor signs up through Supabase Auth, they do **not** obtain write access to CMS tables. Only users verified by `public.is_admin()` can perform mutations.
3. **Sensitive Address Isolation:**
   - Public tables (`profiles`, `site_settings`) only store the public city/region: `"Hinjawadi, Pune, Maharashtra, India"`.
   - The residential premises address is stored exclusively in `admin_private_profile`, which has **NO public read policy** and can only be queried by active admins.
4. **Media Visibility Enforcement:**
   - Public users can only read media rows where `visibility = 'public'`.
   - Admin users can view and manage both public and private media assets.
5. **Rate-Limiting & Spam Prevention Triggers:**
   - `trg_validate_and_limit_message`: Validates email syntax, requires 10-5000 chars for messages, and limits each sender email to **max 5 messages per hour**.
   - `trg_sanitize_analytics_event`: Throttles burst event logging to **max 120 events/minute**, preventing table exhaustion attacks.

---

## 4. Environment Variables Configuration

Create or update `.env` in the project root:

```env
# Application Metadata
VITE_APP_TITLE=Ayyaj Kalandar Shaikh — Personal Developer Platform

# Supabase API Credentials
# (Found in Supabase Dashboard → Project Settings → API)
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-public-anon-key>

# Admin Login Quick Helper
VITE_ADMIN_EMAIL=ayyajahmad64@gmail.com
```

> [!CAUTION]
> **Never** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend environment variables. Only use the public `anon` key. The `anon` key is strictly bounded by the database Row Level Security policies.

---

## 5. Storage Buckets Configuration

The migrations automatically create and configure the required storage buckets via the Supabase Storage API:

1. **`portfolio-media` (Public Bucket):**
   - Stores project screenshots, thumbnails, profile images, and gallery photos.
   - **Public Access:** Any visitor can view/download images.
   - **Upload / Update / Delete:** Restricted exclusively to verified admins via `public.is_admin()`.

2. **`resume` (Public Bucket):**
   - Stores PDF resume versions.
   - **Public Access:** Any visitor or recruiter can download the active resume.
   - **Upload / Update / Delete:** Restricted exclusively to verified admins via `public.is_admin()`.

### Verification in Supabase Dashboard:
- Go to **Storage** → **Buckets**.
- Ensure `portfolio-media` and `resume` are listed.
- If you need to create them manually, click **New Bucket**, set the names to `portfolio-media` and `resume`, and toggle **Public Bucket** ON.
- Storage policies in `supabase/migrations/20260914000002_rls_and_storage.sql` automatically attach to these buckets.

---

## 6. Testing & Verification (Admin vs Anonymous Access)

### Automated Build Check
Before testing, verify the application compiles cleanly without errors:
```bash
npm run build
```
Exit code must be `0`.

### Local Development Server
Start the local server:
```bash
npm run dev
```
Open `http://localhost:3000`.

### Verification Checklist:

| Test Case | Method | Expected Result |
| :--- | :--- | :--- |
| **Anonymous Public Read** | Browse `/projects`, `/skills`, `/experience`, `/education`, `/certifications`, `/gallery` without logging in. | All published records render smoothly without errors or login prompts. |
| **Anonymous CMS Write Rejection** | Open browser console and execute:<br>`await supabase.from('projects').insert({ title: 'Hacked', slug: 'hacked' })` | Operation fails with `403 Forbidden` / `new row violates row-level security policy`. |
| **Private Address Inaccessibility** | Execute:<br>`await supabase.from('admin_private_profile').select('*')` | Returns `data: []` (empty array) — zero rows exposed. |
| **Contact Form Rate Limiting** | Submit 6 messages rapidly via `/contact` with the same email. | The 6th attempt is blocked with: `Rate limit exceeded: maximum 5 messages per hour allowed`. |
| **Admin Authentication** | Navigate to `/admin/login`. Enter `ayyajahmad64@gmail.com` and password. | Successfully navigates to `/admin` dashboard. Session persists across tabs. |
| **Admin CMS Write** | Edit a project or profile field in `/admin` and click **Save Changes**. | Record updates immediately in Supabase PostgreSQL; audit log entry recorded. |
| **Media Upload** | In `/admin/projects`, upload a new screenshot. | File is stored in `portfolio-media` bucket and image preview appears. |

---

## 7. Production Deployment Instructions

### Deploying to Netlify / Vercel

1. **Set Environment Variables in the Hosting Provider:**
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anon key
   - `VITE_APP_TITLE`: `Ayyaj Kalandar Shaikh — Personal Developer Platform`
   - `VITE_ADMIN_EMAIL`: `ayyajahmad64@gmail.com`

2. **Configure CORS & Site URL in Supabase:**
   - Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**.
   - Set **Site URL** to your production domain (e.g. `https://ayyajahmad.dev` or `https://ayyaj-portfolio.netlify.app`).
   - In **Redirect URLs**, add your production domain and local dev URL:
     - `https://your-domain.netlify.app/**`
     - `http://localhost:3000/**`

3. **Verify SPA Routing:**
   - The file `public/_redirects` contains:
     ```
     /*    /index.html   200
     ```
     This ensures all deep links (`/projects`, `/recruiter/overview`, `/admin/*`) load correctly on page refresh without 404 errors.

4. **Verify Robots & Privacy:**
   - `public/robots.txt` disallows crawlers from indexing `/admin/*`.
   - No private residential addresses are compiled into public bundles.

---

*Compiled and verified for Supabase Production Deployment — September 2026.*
