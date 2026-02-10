
---

## 📄 AGENTS.md — BLUEPRINT FOR ZAHIDABDILLAH.DEV

````markdown
# AGENTS.md

## Project Overview
This is the personal portfolio website and admin dashboard for Zahid Abdillah — a Cloud Engineer portfolio built with Astro, using Tailwind CSS for styling, and deployed to Cloudflare Pages.  
Primary goals:
- Showcase projects, tools stack, and technical blogs
- Provide a private admin dashboard with CRUD capabilities
- Use Cloudflare Workers + D1 Database for backend services

Tech stack:
- Astro (frontend)
- Tailwind CSS (styling)
- Iconify via web component (icons)
- Cloudflare Pages (hosting)
- Cloudflare Workers (API)
- Cloudflare D1 (SQLite)
- Cloudflare Access (admin auth)

---

## Dev Environment Setup
- Node.js >=18 installed
- Dev runs via `npm run dev -- --host`
- Tailwind CSS configured manually
- Iconify used via CDN in Layout
- Use VS Code with remote tunnel for editing
- Git repository initialized and commits should be atomic

---

## Build & Preview
Build the production version:

```bash
npm run build
````

Preview the production build locally:

```bash
npm run preview
```

---

## Tailwind CSS Guidelines

* Use only utility classes
* Never use inline CSS styles
* Base styles are imported in `src/layouts/Layout.astro`
* Responsive prefixes (`sm:`, `md:`, etc.) should be consistently used

---

## Component Structure

Clear atomic component separation:

```
src/
├─ components/
│  ├─ Hero.astro
│  ├─ Tools.astro
│  ├─ Projects.astro
│  ├─ BlogList.astro
│  ├─ Navbar.astro
│  └─ Footer.astro
├─ layouts/
│  └─ Layout.astro
├─ pages/
│  ├─ index.astro
│  ├─ projects.astro
│  ├─ blog.astro
│  └─ admin.astro
```

Components:

* Hero — homepage top section
* Tools — stack icons & skills
* Projects — GitHub linked cards
* BlogList — list of blog post previews
* Navbar & Footer — consistent layout

---

## Code Style

* Astro files use structural frontmatter at top
* No redundant comments inside components
* Use descriptive class names instead of arbitrary utilities where logical
* Keep components single-purpose and small
* Accessibility best practices for interactive elements

---

## Cloudflare Integration

1. Create a Cloudflare Pages project linked to GitHub repo.
2. Define environment variables in dashboard (if needed).
3. Bind Cloudflare Workers to Pages.
4. Create D1 Database instance.
5. Migrate database schema with Workers.
6. Protect `/admin` route with Cloudflare Access (allow list email only).

---

## API & Backend Rules

* All API logic under `functions/` directory
* Endpoints follow REST naming conventions
* CRUD routes for projects and blogs:

  * `GET /api/projects`
  * `POST /api/projects`
  * `PUT /api/projects/:id`
  * `DELETE /api/projects/:id`

---

## Testing & Verification

* After code changes, run build locally before pushing:

  ```bash
  npm run build && npm run preview
  ```
* Check layout, responsive views, SEO tags
* Validate icons render correctly

````
---

## 🌀 NEXT STEPS YOU CAN DO WITH THIS

Once `AGENTS.md` is in the root of your repository:

1. Run Codex CLI in project root:
   ```bash
   codex
````

2. Ask it to *generate components and pages* per blueprint:

   * “Create Hero component”
   * “Write Projects page using Projects.astro component”
3. Ask for *Cloudflare Workers API routes*:

   * “Generate D1 CRUD API functions”
4. Ask for *dashboard UI scaffolding*
5. Ask for *Cloudflare Access integration instructions*

---