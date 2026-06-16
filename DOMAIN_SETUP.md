# Domain Setup — TORRA (Hostinger DNS + host nginx + Let's Encrypt)

Current state: app runs in Docker behind **host nginx** on port 80,
`server_name _` (IP-based, HTTP only). These steps add your domain + HTTPS.

Replace **YOURDOMAIN.com** and **<VPS_IP>** throughout.

---

## Step 1 — DNS (Hostinger hPanel)

hPanel → **Domains → DNS / Nameservers → DNS Zone Editor**. Add/edit:

| Type | Name | Points to / Value | TTL |
|------|------|-------------------|-----|
| A    | `@`  | `<VPS_IP>`        | 3600 |
| A    | `www`| `<VPS_IP>`        | 3600 |

- Delete any existing parking/placeholder A records for `@` and `www`.
- If the domain still uses a different registrar's nameservers, point them to
  Hostinger first (or add the A records at whoever controls DNS).
- Verify propagation (1–30 min):
  ```bash
  dig +short YOURDOMAIN.com
  dig +short www.YOURDOMAIN.com
  ```
  Both must return `<VPS_IP>` before doing Step 3 (certbot needs it).

## Step 2 — Point nginx at the domain (on the VPS)

```bash
# Copy the domain-ready config (replace YOURDOMAIN.com inside it first!)
sudo cp /opt/torra/nginx-torra-domain.conf /etc/nginx/sites-available/torra
sudo sed -i 's/YOURDOMAIN.com/realdomain.com/g' /etc/nginx/sites-available/torra

sudo ln -sf /etc/nginx/sites-available/torra /etc/nginx/sites-enabled/torra
sudo rm -f /etc/nginx/sites-enabled/default     # remove catch-all default
sudo nginx -t && sudo systemctl reload nginx
```
Now `http://YOURDOMAIN.com` should load the site.

## Step 3 — HTTPS with Let's Encrypt (free, auto-renew)

```bash
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOURDOMAIN.com -d www.YOURDOMAIN.com \
     --redirect --agree-tos -m you@email.com --no-eff-email
```
- `--redirect` makes certbot add the HTTP→HTTPS redirect automatically.
- Certbot edits the nginx file to add the `:443` SSL server block and reloads.
- Auto-renewal is installed via a systemd timer; verify:
  ```bash
  sudo certbot renew --dry-run
  ```

## Step 4 — Update the app to use the domain (CORS + email links)

Edit the production env the Docker stack uses (e.g. `/opt/torra/.env`):
```
FRONTEND_URL=https://YOURDOMAIN.com
ALLOWED_ORIGINS=https://YOURDOMAIN.com,https://www.YOURDOMAIN.com
```
Then restart the backend so it picks them up:
```bash
cd /opt/torra
docker compose restart backend
# (or: docker compose up -d to re-read env)
```
Why this matters:
- `ALLOWED_ORIGINS` → the API's CORS allowlist. Without it, browser calls from
  the HTTPS domain get blocked.
- `FRONTEND_URL` → used in password-reset email links.

## Step 5 — Firewall

Make sure 80 and 443 are open (Hostinger panel firewall + UFW if used):
```bash
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw reload
```

---

## Verify

```bash
curl -I https://YOURDOMAIN.com                 # 200, served over TLS
curl -I http://YOURDOMAIN.com                  # 301 → https
curl -I https://www.YOURDOMAIN.com             # 301 → root
curl -s https://YOURDOMAIN.com/api/health      # {"status":"healthy",...}
```
In the browser: padlock shows a valid cert; login/signup work; no CORS errors
in the console.

## Troubleshooting
- **certbot fails "challenge"** → DNS not propagated yet, or port 80 blocked.
  Re-run after `dig` returns the right IP.
- **CORS errors after going HTTPS** → `ALLOWED_ORIGINS` not updated / backend not
  restarted (Step 4).
- **502 Bad Gateway** → a Docker container is down or on a different port than
  the nginx upstream (frontend `127.0.0.1:3000`, backend `127.0.0.1:5001`).
  Check `docker compose ps` and the published ports.
- **Mixed-content warnings** → the frontend calls relative `/api` paths, so this
  shouldn't happen; if it does, something hardcoded `http://`.
