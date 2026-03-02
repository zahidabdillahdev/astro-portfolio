# CLAUDE.md — zahidabdillah.dev
> Digital Marketing Portfolio · Zahid Abdillah
> Stack: Astro 5.16 · TypeScript (strict) · Tailwind v4 · Cloudflare Pages · Workers · D1 · R2 · Hono · Vanilla JS

---

## Architecture

```
[zahidabdillah.dev]           [zahidabdillah.dev/api/*]      [Cloudflare]
  Astro static pages  ◄────    Workers API (Hono)         ──►  D1 database
  /admin/* pages               CRUD endpoints                   R2 storage
       │
       └── Protected by Cloudflare Access
           Google OAuth → only muhammadzahidabdillah@gmail.com
```

**Auth: Cloudflare Access — NOT JWT**
- `/admin/*` protected by Cloudflare Access policy
- No login page, no JWT, no localStorage
- Workers verifies via `Cf-Access-Jwt-Assertion` header (injected by Cloudflare automatically)

**Deploy flow:** admin saves → D1 updated → admin clicks "Rebuild" → Pages deploy hook fires → static rebuild

---

## Completed

```
[x] chore: init project from ZhukDI/cv template
[x] chore: install base dependencies
[x] chore: configure wrangler and cloudflare login
[x] chore: create d1 database portfolio-db
[x] chore: create r2 bucket portfolio-assets
[x] chore: add wrangler.toml
[x] chore: install @astrojs/cloudflare and hono
```

---

## Template Structure — DO NOT DELETE

```
src/
├── assets/avatar.jpeg          ← replace with Zahid's photo
├── components/
│   ├── Education.astro         ← KEEP
│   ├── EducationItem.astro     ← KEEP
│   ├── Header.astro            ← KEEP
│   ├── PrintInstruction.astro  ← KEEP
│   ├── Skills.astro            ← KEEP
│   ├── Summary.astro           ← KEEP
│   ├── WorkExperience.astro    ← KEEP
│   ├── WorkItem.astro          ← KEEP
│   ├── common/Badge.astro      ← KEEP — reuse for tags
│   ├── common/LinkButton.astro ← KEEP — reuse for project links
│   └── icons/                  ← KEEP all
├── data/cv.ts                  ← EXTEND only, never replace interfaces
├── layouts/Layout.astro        ← KEEP
├── pages/index.astro           ← KEEP + append new sections at bottom
├── pages/404.astro             ← KEEP
├── pages/robots.txt.ts         ← KEEP
└── styles/global.css           ← KEEP — Tailwind v4, no tailwind.config.js
```

**New files to create:**
```
src/components/Projects.astro
src/components/ProjectItem.astro
src/components/Certifications.astro
src/components/CertificationItem.astro
src/components/Testimonials.astro
src/components/Contact.astro
src/components/admin/AdminLayout.astro
src/pages/admin/index.astro
src/pages/admin/profile.astro
src/pages/admin/projects.astro
src/pages/admin/certifications.astro
src/pages/admin/experience.astro
src/pages/admin/skills.astro
src/pages/admin/testimonials.astro
src/pages/admin/messages.astro
workers/api/index.ts
workers/api/middleware/cloudflare-access.ts
migrations/0001_init.sql
```

---

## Phase 1: Update Configs

### astro.config.mjs

```js
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  vite: { plugins: [tailwindcss()] },
  site: 'https://zahidabdillah.dev',
  integrations: [sitemap()]
})
```

### wrangler.toml

```toml
name = "astro-portfolio"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "portfolio-db"
database_id = "0a74d547-f67f-47d6-93a2-7820d72896fa"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "portfolio-assets"
preview_bucket_name = "portfolio-assets-preview"

[vars]
ENVIRONMENT = "production"
ASSETS_URL = "https://assets.zahidabdillah.dev"

# secrets (CLI only, never commit):
# npx wrangler secret put PAGES_DEPLOY_HOOK_URL
```

---

## Phase 2: Extend src/data/cv.ts

Add optional fields to existing interfaces and append new interfaces. **Never delete or rename anything existing.**

```ts
// add to CV interface:
projects?: Project[]
certifications?: Certification[]
testimonials?: Testimonial[]

// add to Contact interface:
resumeUrl?: string
instagramUrl?: string

// add to Work interface:
logoUrl?: string

// new interfaces:
interface Project {
  title: string; slug: string; description: string; category: string
  client?: string; thumbnailUrl?: string
  linkType: 'notion' | 'gdrive' | 'pdf' | 'url'; linkUrl: string
  results?: Record<string, string>; tags?: string[]
  isFeatured?: boolean; orderIndex?: number
}

interface Certification {
  title: string; issuer: string; issueDate: string; expiryDate?: string
  credentialId?: string; credentialUrl?: string
  certificateUrl?: string; thumbnailUrl?: string; orderIndex?: number
}

interface Testimonial {
  clientName: string; clientRole?: string; clientCompany?: string
  clientAvatarUrl?: string; content: string
  rating?: number; isFeatured?: boolean; orderIndex?: number
}
```

Replace CV_DATA with Zahid's actual data. Use `https://assets.zahidabdillah.dev/` for all asset URLs.

---

## Phase 3: New Frontend Components

Build `Projects`, `Certifications`, `Testimonials`, `Contact` components matching the template's existing visual style (same font, spacing, border, color palette from `global.css`). Reuse `Badge.astro` for tags and `LinkButton.astro` for project/cert links.

Add new sections to `src/pages/index.astro` **after** the Skills section, guarded by existence checks:
```astro
{CV_DATA.projects?.length && <Projects projects={CV_DATA.projects} />}
{CV_DATA.certifications?.length && <Certifications certifications={CV_DATA.certifications} />}
{CV_DATA.testimonials?.length && <Testimonials testimonials={CV_DATA.testimonials} />}
<Contact />
```

Contact component POSTs to `/api/contact`. Show success message on submit, no page reload.

---

## Phase 4: D1 Schema — migrations/0001_init.sql

```sql
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  full_name TEXT DEFAULT '', title TEXT DEFAULT '',
  about TEXT DEFAULT '', summary TEXT DEFAULT '',
  email TEXT DEFAULT '', tel TEXT DEFAULT '',
  location TEXT DEFAULT '', location_link TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '', resume_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '', instagram_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL, company_link TEXT DEFAULT '',
  role TEXT NOT NULL, description TEXT DEFAULT '',
  start_date TEXT NOT NULL, end_date TEXT DEFAULT NULL,
  is_current INTEGER DEFAULT 0,
  achievements TEXT DEFAULT '[]', badges TEXT DEFAULT '[]',
  logo_url TEXT DEFAULT '', order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school TEXT NOT NULL, degree TEXT DEFAULT '',
  start_year TEXT NOT NULL, end_year TEXT DEFAULT NULL,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, category TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '', category TEXT DEFAULT '',
  client TEXT DEFAULT '', thumbnail_url TEXT DEFAULT '',
  link_type TEXT DEFAULT 'url', link_url TEXT DEFAULT '',
  results TEXT DEFAULT '{}', tags TEXT DEFAULT '[]',
  is_featured INTEGER DEFAULT 0, order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, issuer TEXT DEFAULT '',
  issue_date TEXT DEFAULT '', expiry_date TEXT DEFAULT '',
  credential_id TEXT DEFAULT '', credential_url TEXT DEFAULT '',
  certificate_url TEXT DEFAULT '', thumbnail_url TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL, client_role TEXT DEFAULT '',
  client_company TEXT DEFAULT '', client_avatar_url TEXT DEFAULT '',
  content TEXT NOT NULL, rating INTEGER DEFAULT 5,
  is_featured INTEGER DEFAULT 0, order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT DEFAULT '', email TEXT DEFAULT '',
  subject TEXT DEFAULT '', message TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Phase 5: Workers API — workers/api/index.ts

Use Hono. Export `Env` interface with `DB: D1Database`, `STORAGE: R2Bucket`, `ENVIRONMENT: string`, `ASSETS_URL: string`, `PAGES_DEPLOY_HOOK_URL: string`.

**Public routes (no auth):**
- `GET /api/profile` — profile row
- `GET /api/projects` — ordered by featured, then order_index; parse `results` and `tags` JSON
- `GET /api/certifications`
- `GET /api/experience` — parse `achievements` and `badges` JSON
- `GET /api/skills`
- `GET /api/testimonials`
- `POST /api/contact` — insert to contact_submissions

**Admin routes (all under `/api/admin/*`, protected by cfAccessMiddleware):**
- `PUT /api/admin/profile`
- `POST/PUT/DELETE /api/admin/projects/:id`
- `POST/PUT/DELETE /api/admin/certifications/:id`
- `POST/PUT/DELETE /api/admin/experience/:id`
- `POST/PUT/DELETE /api/admin/skills/:id`
- `POST/PUT/DELETE /api/admin/testimonials/:id`
- `GET /api/admin/messages`
- `PUT /api/admin/messages/:id/status`
- `POST /api/admin/upload` — multipart, put to R2, return `{ url: ASSETS_URL + path }`
- `POST /api/admin/deploy` — POST to PAGES_DEPLOY_HOOK_URL

**Cloudflare Access middleware** (`workers/api/middleware/cloudflare-access.ts`): check `Cf-Access-Jwt-Assertion` header exists when `ENVIRONMENT === 'production'`, else return 401.

**JSON columns:** always `JSON.stringify()` on write, `JSON.parse()` on read for `results`, `tags`, `achievements`, `badges`.

---

## Phase 6: Admin Panel

**No login page.** Cloudflare Access intercepts `/admin/*` and redirects to Google.

Every admin page must have `export const prerender = false` at the top.

**AdminLayout** (`src/components/admin/AdminLayout.astro`): fixed left sidebar (216px), nav links for all 8 sections, active state = black bg, "← View Site" link, logout link to `https://zahidabdillah.cloudflareaccess.com/cdn-cgi/access/logout`.

**Design system — match ZhukDI/cv exactly:**
- Font: system font stack (same as template)
- Colors: `#000` text, `#fff` bg, `#e5e7eb` borders, `#9ca3af` muted, `#6b7280` secondary
- Buttons: black bg + white text, hover `#333`
- Inputs: `border: 1px solid #d1d5db`, `outline: none`, focus `border-color: #000`
- Use inline styles (no Tailwind in admin)

**Each admin page** has: section header + "+ Add New" button, table listing items, modal for add/edit, delete with `confirm()`. After save → call `/api/admin/deploy` to trigger rebuild.

**Vanilla JS helpers** (reuse across pages):
- `api(method, url, body?)` — fetch wrapper returning JSON
- `uploadFile(file, path)` — multipart POST to `/api/admin/upload`, returns URL
- `triggerDeploy()` — POST to `/api/admin/deploy`

---

## Phase 7: Deploy

```bash
# set secret
npx wrangler secret put PAGES_DEPLOY_HOOK_URL

# deploy workers
npx wrangler deploy workers/api/index.ts

# deploy pages (or connect to GitHub for auto-deploy)
npm run build && npx wrangler pages deploy dist
```

Cloudflare Dashboard:
- Pages → custom domain: `zahidabdillah.dev`
- Workers → route: `zahidabdillah.dev/api/*`
- R2 → custom domain: `assets.zahidabdillah.dev`
- Zero Trust → Access → Application → Self-hosted → `zahidabdillah.dev/admin*` → allow `muhammadzahidabdillah@gmail.com` via Google

---

## Execution Checklist

```
[x] chore: init project from ZhukDI/cv template
[x] chore: install base dependencies
[x] chore: configure wrangler and cloudflare login
[x] chore: create d1 database portfolio-db
[x] chore: create r2 bucket portfolio-assets
[x] chore: add wrangler.toml
[x] chore: install @astrojs/cloudflare and hono

[ ] 1.  Update astro.config.mjs
        git commit -m "chore: add cloudflare adapter to astro config"

[ ] 2.  Update wrangler.toml with ASSETS_URL var
        git commit -m "chore: add assets_url var to wrangler.toml"

[ ] 3.  Extend src/data/cv.ts with new interfaces + Zahid's data
        git commit -m "feat: extend cv.ts with portfolio data model"

[ ] 4.  Create Projects.astro + ProjectItem.astro
        git commit -m "feat: add projects and project-item components"

[ ] 5.  Create Certifications.astro + CertificationItem.astro
        git commit -m "feat: add certifications components"

[ ] 6.  Create Testimonials.astro
        git commit -m "feat: add testimonials component"

[ ] 7.  Create Contact.astro
        git commit -m "feat: add contact form component"

[ ] 8.  Update src/pages/index.astro — append new sections
        git commit -m "feat: render new sections on index page"

[ ] 9.  Create migrations/0001_init.sql
        git commit -m "chore: add initial d1 migration schema"

[ ] 10. Run local migration (no commit)
        npx wrangler d1 execute portfolio-db --local --file=migrations/0001_init.sql

[ ] 11. Create workers/api/middleware/cloudflare-access.ts
        git commit -m "feat: add cloudflare access middleware"

[ ] 12. Create workers/api/index.ts
        git commit -m "feat: add workers api with hono router"

[ ] 13. Create src/components/admin/AdminLayout.astro
        git commit -m "feat: add admin layout with sidebar nav"

[ ] 14. Create src/pages/admin/index.astro
        git commit -m "feat: add admin dashboard page"

[ ] 15. Create src/pages/admin/projects.astro
        git commit -m "feat: add admin projects crud page"

[ ] 16. Create src/pages/admin/certifications.astro
        git commit -m "feat: add admin certifications crud page"

[ ] 17. Create src/pages/admin/experience.astro
        git commit -m "feat: add admin experience crud page"

[ ] 18. Create src/pages/admin/skills.astro
        git commit -m "feat: add admin skills crud page"

[ ] 19. Create src/pages/admin/testimonials.astro
        git commit -m "feat: add admin testimonials crud page"

[ ] 20. Create src/pages/admin/messages.astro
        git commit -m "feat: add admin messages inbox page"

[ ] 21. Create src/pages/admin/profile.astro
        git commit -m "feat: add admin profile editor page"

[ ] 22. Run production migration (no commit)
        npx wrangler d1 execute portfolio-db --file=migrations/0001_init.sql

[ ] 23. Deploy Workers API
        git commit -m "chore: deploy workers api to cloudflare"

[ ] 24. Connect Pages to GitHub + build config (dashboard)

[ ] 25. Set custom domains: zahidabdillah.dev + assets.zahidabdillah.dev

[ ] 26. Configure Cloudflare Access for /admin*

[ ] 27. Set PAGES_DEPLOY_HOOK_URL secret + wire to admin
        git commit -m "chore: wire pages deploy hook to admin"

[ ] 28. Verify full deploy and admin flow
        git commit -m "chore: verify full deploy and admin flow"

[ ] 29. Upload real assets to R2
        git commit -m "chore: populate r2 with profile assets"
```

---

## Commands Reference

```bash
# dev
npm run dev
npx wrangler dev workers/api/index.ts --port 8787

# d1
npx wrangler d1 execute portfolio-db --local --file=migrations/0001_init.sql
npx wrangler d1 execute portfolio-db --file=migrations/0001_init.sql
npx wrangler d1 execute portfolio-db --local --command "SELECT * FROM projects"

# r2
npx wrangler r2 object put portfolio-assets/profile/avatar.jpg --file=./avatar.jpg
npx wrangler r2 object list portfolio-assets

# deploy
npm run build && npx wrangler pages deploy dist
npx wrangler deploy workers/api/index.ts
npx wrangler tail
```

---

## Rules for Claude Code

1. Preserve all existing `src/` files — only extend `cv.ts` and append to `index.astro`.
2. No `tailwind.config.js` — Tailwind v4 config is in `global.css` via `@theme`.
3. Never delete or rename existing `cv.ts` interfaces — add optional fields only.
4. No login page, no JWT, no localStorage — Cloudflare Access handles auth.
5. `export const prerender = false` required on every admin page.
6. Admin uses inline styles only. Colors: black/white/gray. Match template design exactly.
7. JSON columns (`results`, `tags`, `achievements`, `badges`): stringify on write, parse on read.
8. All asset URLs use `https://assets.zahidabdillah.dev/`.
9. No `<form action>` tags — use `div` + `button onclick` for admin submissions.
10. Commit after each checklist item using the exact message provided.