# Astro Portfolio

Portfolio website and admin dashboard for a digital marketing profile, built with Astro and deployed on Cloudflare.

## Overview

This repository contains:

- A public portfolio frontend rendered with Astro.
- A lightweight admin dashboard for managing profile, projects, experience, education, skills, and certifications.
- A Cloudflare Worker API backed by D1 for structured data and R2 for uploaded assets.
- Cloudflare Access middleware to protect admin API routes in production.

## Stack

- Astro 5
- Tailwind CSS 4
- Cloudflare Pages
- Cloudflare Workers
- Cloudflare D1
- Cloudflare R2
- Hono
- Wrangler

## Architecture

The app is split into two delivery layers:

- `src/`: Astro site, public portfolio pages, and admin UI.
- `workers/api/`: Hono-based API for CRUD operations and file-related workflows.

Data flow:

1. Public pages fetch portfolio data from the Worker API.
2. Admin pages send authenticated requests to `/api/admin/*`.
3. Structured content is stored in D1.
4. Media assets such as avatars, thumbnails, and documents are stored in R2.

## Project Structure

```text
.
├── migrations/           # D1 schema migrations
├── public/               # Static assets
├── src/
│   ├── components/       # Frontend and admin UI components
│   ├── data/             # Fallback/static CV data types and defaults
│   ├── layouts/          # Astro layouts
│   └── pages/            # Public pages and admin routes
├── workers/
│   └── api/              # Worker API and middleware
├── astro.config.mjs      # Astro config
└── wrangler.toml         # Cloudflare Pages config
```

## Content Model

The primary D1 tables created by the initial migration are:

- `profile`
- `work_experience`
- `education`
- `skills`
- `projects`
- `certifications`

See [migrations/0001_init.sql](/home/ubuntu/astro-portfolio/migrations/0001_init.sql) for the current schema.

## Local Development

### Requirements

- Node.js 20+
- npm
- Cloudflare account access
- Wrangler authentication

### Install dependencies

```bash
npm install
```

### Start the Astro app

```bash
npm run dev
```

### Apply D1 migrations

Local:

```bash
npx wrangler d1 execute <db-name> --local --file=migrations/0001_init.sql
```

Remote:

```bash
npx wrangler d1 execute <db-name> --remote --file=migrations/0001_init.sql
```

Replace `<db-name>` with your own D1 database binding target. Do not hardcode account-specific IDs into documentation or examples.

## Configuration

Important config files:

- [astro.config.mjs](/home/ubuntu/astro-portfolio/astro.config.mjs)
- [wrangler.toml](/home/ubuntu/astro-portfolio/wrangler.toml)
- [workers/api/wrangler.toml](/home/ubuntu/astro-portfolio/workers/api/wrangler.toml)

Expected runtime bindings include:

- `DB` for D1
- `STORAGE` for R2
- `ENVIRONMENT`
- `ASSETS_URL`
- `PAGES_DEPLOY_HOOK_URL` as a secret for deploy triggers

Set secrets through Wrangler CLI, not in source control.

Example:

```bash
npx wrangler secret put PAGES_DEPLOY_HOOK_URL
```

## Admin Access

The admin API is protected by Cloudflare Access middleware in production. Public endpoints remain readable for frontend rendering, while `/api/admin/*` requires valid Access context.

Before testing protected admin routes against a deployed environment, make sure your Cloudflare Access policy is configured correctly.

## Build and Verification

Available scripts:

```bash
npm run dev
npm run build
```

Recommended checks before pushing:

```bash
npm run build
```

## Deployment

Typical deployment flow:

1. Build the Astro site.
2. Deploy the frontend through Cloudflare Pages.
3. Deploy or update the Worker API.
4. Run D1 migrations if the schema changed.
5. Verify R2 bindings and deploy hook secret configuration.

## Security Notes

- Do not commit API keys, tokens, deploy hooks, or Cloudflare secrets.
- Prefer Wrangler secrets for sensitive values.
- Avoid documenting account-specific IDs, internal admin URLs, or private bucket details in public docs.
- Review `wrangler.toml` files before publishing the repository if you want to remove environment-specific identifiers.

## License

This project is personal and all rights are reserved unless stated otherwise by the repository owner.
