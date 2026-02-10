
---

## 📄 AGENTS.md — ZAHIDABDILLAH.DEV

Professional summary of the current project state and operating conventions.

## Project Summary
Personal portfolio website + private admin dashboard for Zahid Abdillah (Cloud Engineer).  
The public site reads **published** data in real time via public read-only endpoints.  
The admin dashboard (protected by Cloudflare Access) manages CRUD for Projects, Blogs, Tools, and Profile Assets.

## Tech Stack
- Astro (frontend)
- Tailwind CSS v4 (utility-only, CSS-first)
- Iconify web component (icons via CDN)
- Cloudflare Pages (hosting)
- Cloudflare Workers / Pages Functions (API)
- Cloudflare D1 (SQLite)
- Cloudflare R2 (object storage)
- Cloudflare Zero Trust (Access)

## Dev Environment
- Node.js >=18
- Local dev: `npm run dev -- --host` (VS Code Remote Tunnel)
- Base styles: `src/layouts/Layout.astro` → `src/styles/global.css`
- No inline styles, utility classes only

## Cloudflare Resources (current)
- D1 database: `astro-db` (binding: `DB`)
- R2 bucket: `astro-r2` (binding: `STORAGE`)
- Access: `/admin*` protected via Zero Trust policy (email allow list)

## API Surface (current)
**Private (Access-protected):**
- `GET/POST /api/projects`
- `PUT/DELETE /api/projects/:id`
- `GET/POST /api/blogs`
- `PUT/DELETE /api/blogs/:id`
- `GET/POST /api/tools`
- `PUT/DELETE /api/tools/:id`
- `GET/PUT /api/profile-assets`
- `POST /api/uploads/:type` (`avatar`, `photo`, `resume`)

**Public (read-only, no Access):**
- `GET /public/projects` (published only)
- `GET /public/blogs` (published only)
- `GET /public/tools` (published only)
- `GET /public/profile-assets`
- `GET /public/media/*` (R2 file proxy)

## Data Model Notes
- Projects: `name`, `summary`, `href`, `status`
- Blogs: `title`, `summary`, `slug`, `content`, `reading_time`, `date`, `author`, `status`
- Tools: `name`, `icon`, `status`
- Profile Assets: `avatar_key`, `photo_key`, `resume_key`, `summary`

## UI Notes
- Public pages show placeholders when no published data is available.
- Admin UI supports full CRUD + inline edit.
- Blog editor includes Markdown preview.

## Auth
- `/admin` and `/api/*` guarded by `functions/_middleware.ts`.
- Access validation via `cf-access-jwt-assertion` and `/cdn-cgi/access/get-identity`.

## Build & Verification
```bash
npm run build
npm run preview
```

## Conventions
- Keep Astro components small and single-purpose.
- Avoid redundant comments.
- Prefer descriptive class groupings and consistent spacing.
- Public site reads from public endpoints only (never from `/api/*`).
