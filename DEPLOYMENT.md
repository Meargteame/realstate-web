# Deployment Guide — TORRA Real Estate (Hostinger VPS)

Production stack: **Caddy** (auto-HTTPS reverse proxy) → **frontend** (Nginx SPA)
+ **backend** (Node/Express) + **Postgres** + **Redis**, all via
`docker-compose.prod.yml`. Backend/DB are internal-only; Caddy is the single
public entry point on :80/:443.

---

## Prerequisites
- A Hostinger VPS (Ubuntu) with root/SSH access.
- A domain whose DNS you can edit.
- Ports 80 and 443 open.

## Deploy steps

1. **Get the code onto the VPS** (git clone or scp) into `/opt/torra`.

2. **First run on a fresh server** (installs Docker, git):
   ```bash
   cd /opt/torra && bash deploy-hostinger.sh --fresh
   ```

3. **Deploy** (creates `.env` interactively if missing, builds, launches):
   ```bash
   cd /opt/torra && bash deploy-hostinger.sh
   ```
   The script generates a strong `DB_PASSWORD` and `JWT_SECRET`, asks for your
   domain, opens the firewall, builds images, and starts the stack.

4. **Point DNS**: add A records for `yourdomain.com` and `www.yourdomain.com`
   to the VPS IP (the script prints it). Caddy auto-issues the Let's Encrypt
   cert once DNS resolves (1–15 min).

5. Site is live at `https://yourdomain.com`.

## .env (production) — required keys
```
DOMAIN=yourdomain.com
DB_USER=torra_user
DB_PASSWORD=<strong>
DB_NAME=torra_realestate
JWT_SECRET=<96-char hex>
# optional: SENDGRID_API_KEY / SMTP_*, VITE_MAPBOX_ACCESS_TOKEN
```

## Useful commands
```
docker compose -f docker-compose.prod.yml logs -f          # tail logs
docker compose -f docker-compose.prod.yml ps               # status
docker compose -f docker-compose.prod.yml up -d --build    # rebuild+restart
docker exec -it torra_postgres psql -U torra_user torra_realestate
docker exec torra_backend node prisma/seed.js              # seed demo data
docker exec torra_backend wget -qO- http://localhost:5000/api/health
```

## 🤖 Automated CI/CD Deployment (GitHub Actions)

A GitHub Actions workflow is configured in `.github/workflows/ci-cd.yml`.

### Continuous Integration (CI)
On every `push` and `pull_request` to `main` or `master`:
1. **Backend Check**: Installs dependencies, runs `npx prisma generate`, and validates Prisma schema.
2. **Frontend Check**: Installs dependencies, runs TypeScript lint check (`npm run lint`), and builds production Vite bundle (`npm run build`).
3. **Docker Check**: Builds production backend and frontend Docker images to ensure Docker build validity.

### Continuous Deployment (CD)
Automated deployment runs on push to `main` or `master` branch via SSH:
1. SSHs into your target VPS host (`SSH_HOST`).
2. Pulls the latest code into `/opt/torra`.
3. Runs `docker compose -f docker-compose.prod.yml up -d --build`.
4. Executes Prisma generate inside the backend container.

### Setting up Repository Secrets
To enable automated CD deployment, set the following secrets in GitHub (**Settings → Secrets and variables → Actions**):

| Secret Name | Description | Example / Default |
| --- | --- | --- |
| `SSH_HOST` | IP address or domain of your VPS | `192.0.2.1` or `vps.yourdomain.com` |
| `SSH_USER` | SSH username | `root` |
| `SSH_KEY` | SSH Private Key (RSA or Ed25519) | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `SSH_PASSWORD` | SSH Password (if not using SSH key) | `your_vps_password` |
| `TARGET_DIR` | Directory on VPS where app is cloned | `/opt/torra` |

---

## ⚠️ Fixes applied this session (were blockers)

1. **Prisma config not in the image.** The schema's datasource has no inline URL
   (Prisma 7 forbids it); the URL lived only in `prisma.config.ts`, which the
   Docker image didn't ship and which needs `tsx`/`typescript` (dev-only).
   → Converted to **`prisma.config.js`** (CommonJS, loads with just `dotenv`),
   and the Dockerfile now copies it in both stages.

2. **Prisma CLI was a devDependency.** The compose start command runs
   `npx prisma generate && npx prisma db push`, but `npm ci --omit=dev` excluded
   the `prisma` CLI → would fail / try a runtime download as non-root.
   → Moved `prisma` to **dependencies**; regenerated `package-lock.json`.
   Verified `npm ci --omit=dev` now includes the CLI.

Both verified: `prisma validate` + `db push` work with the JS config; frontend
`npm run build` succeeds; backend boots in `NODE_ENV=production`.

## ⚠️ Operational notes / risks

- **`db push --accept-data-loss` runs on every backend container start**
  (in `docker-compose.prod.yml`). This keeps the DB in sync with the schema but
  can DROP columns/tables if the schema diverges. For a real production app,
  switch to versioned migrations: replace the compose command with
  `npx prisma migrate deploy` and commit a `prisma/migrations/` history.
- **Redis** is enabled in prod (`REDIS_ENABLED=true`) — caching is live there.
- **Frontend Nginx also proxies `/api`** internally, but Caddy routes `/api`
  straight to the backend, so that Nginx proxy block is redundant (harmless).
- **Seed data**: the deploy script offers to run `prisma/seed.js`. The DB ships
  empty otherwise — marketing pages (stats, trending cities, featured) will show
  graceful fallbacks until there are listings/agents.
- **Email**: unset SMTP/SendGrid → emails are logged, not sent (dev-mode
  transport). Set SMTP_* or SENDGRID_API_KEY in `.env` for real delivery.
