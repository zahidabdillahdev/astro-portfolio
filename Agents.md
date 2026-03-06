# zahidabdillah.dev - Digital Marketing Portfolio
> Status: Fully Operational & Enterprise-Ready 🚀
> Stack: Astro 5 · Cloudflare Pages · Workers · D1 · R2 · Hono · Zero Trust

---

## 🛠️ Architecture Final Recap

- **Frontend:** Astro 5 (Static) pulling dynamic data from API during build.
- **Backend:** Hono API on Cloudflare Workers.
- **Database:** Cloudflare D1 (Serverless SQL).
- **Storage:** Cloudflare R2 (Object Storage for Avatar, Resume, and Certificates).
- **Security:** Cloudflare Access (Zero Trust) protecting `/admin/*`. No manual login page needed.
- **Status Monitoring:** Integrated Official Cloudflare Status API in Admin Dashboard.

---

## 🚧 Final Pre-Launch Checklist

### 1. External Integrations (Mandatory)
- [ ] **Cloudflare Access Setup:** Create a Self-hosted application for `zahidabdillah.dev/admin*` allowing only `muhammadzahidabdillah@gmail.com`.
- [ ] **Deploy Hook:** Add a Deploy Hook in Cloudflare Pages and set it via:
  ```bash
  npx wrangler secret put PAGES_DEPLOY_HOOK_URL
  ```
- [ ] **Custom Domain:** Map `zahidabdillah.dev` to Pages and configure the API route mapping: `zahidabdillah.dev/api/*` -> `portfolio-api` Worker.

### 2. Content & Data Population
- [ ] **Professional Profile:** Fill in name, professional title, and summary via Admin.
- [ ] **Asset Uploads:** 
    - [ ] Upload Profile Photo (R2).
    - [ ] Upload Resume/CV (R2).
    - [ ] Upload Certifications (PDF/Images to R2).
- [ ] **Experience & Projects:** Input your career history and key marketing case studies.

---

## 📝 Key Notes for Developer

- **No Manual Login:** Cloudflare Access is the sole entry point for Admin. The API verifies identity via `Cf-Access-Jwt-Assertion`.
- **Dynamic Build:** The website is static for speed but fetches the latest DB content during every build/deployment.
- **R2 Folders:** 
    - `/profile`: Avatar photos.
    - `/documents`: Resume files.
    - `/certifications`: Certificate documents.
- **Mobile Admin:** The Admin Dashboard is now fully responsive with a toggleable sidebar and scrollable modals.

---

## 🚀 Deployment Commands Reference

```bash
# Push to GitHub (Triggers Pages Build)
git push origin main

# Update Backend API
cd workers/api && npx wrangler deploy

# Local Testing (Both Frontend & Backend)
npm run dev & npx wrangler dev workers/api/index.ts --port 8787
```
