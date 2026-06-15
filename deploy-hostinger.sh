#!/bin/bash
# ═══════════════════════════════════════════════════════════
# TORRA Real Estate — Hostinger VPS Deploy Script
# ═══════════════════════════════════════════════════════════
# USAGE (paste into Hostinger terminal):
#
#   Option A — If code is already on the server:
#     cd /opt/torra && bash deploy-hostinger.sh
#
#   Option B — Fresh server (run everything):
#     bash deploy-hostinger.sh --fresh
#
# ═══════════════════════════════════════════════════════════
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }
info() { echo -e "${CYAN}→ $1${NC}"; }

APP_DIR="/opt/torra"
COMPOSE_FILE="docker-compose.prod.yml"

echo ""
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  TORRA Real Estate — Hostinger Deploy${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ── Step 1: System prerequisites ────────────────────────────
if [ "${1:-}" = "--fresh" ]; then
    info "Installing Docker & Docker Compose..."

    # Update system
    apt-get update -qq
    apt-get upgrade -y -qq

    # Install Docker (official script)
    if ! command -v docker &>/dev/null; then
        curl -fsSL https://get.docker.com | sh
        ok "Docker installed"
    else
        ok "Docker already installed: $(docker --version)"
    fi

    # Enable Docker on boot
    systemctl enable docker 2>/dev/null || true

    # Install git
    if ! command -v git &>/dev/null; then
        apt-get install -y -qq git
        ok "Git installed"
    else
        ok "Git already installed"
    fi

    # Create app directory
    mkdir -p "$APP_DIR"
    ok "App directory: $APP_DIR"

    echo ""
    info "Now copy your project files to $APP_DIR"
    info "Then re-run: cd $APP_DIR && bash deploy-hostinger.sh"
    echo ""
    exit 0
fi

# ── Step 2: Validate environment ────────────────────────────
info "Checking prerequisites..."

command -v docker &>/dev/null || fail "Docker not found. Run: curl -fsSL https://get.docker.com | sh"
ok "Docker: $(docker --version | head -1)"

docker compose version &>/dev/null || fail "Docker Compose v2 not found"
ok "Docker Compose: $(docker compose version --short)"

[ -f "$APP_DIR/docker-compose.prod.yml" ] || [ -f "docker-compose.prod.yml" ] || \
    fail "docker-compose.prod.yml not found. Are you in the project directory?"

# Determine working directory
if [ -f "docker-compose.prod.yml" ]; then
    cd "$(pwd)"
elif [ -f "$APP_DIR/docker-compose.prod.yml" ]; then
    cd "$APP_DIR"
fi
ok "Working directory: $(pwd)"

# ── Step 3: Create/update .env ──────────────────────────────
if [ ! -f .env ]; then
    echo ""
    warn "No .env file found — let's create one."
    echo ""

    # Ask for domain
    read -rp "🌐 Your domain (e.g. torra.com): " DOMAIN
    [ -z "$DOMAIN" ] && fail "Domain is required"

    # Ask for DB password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d '=+/')
    echo -e "  Generated DB password: ${YELLOW}${DB_PASSWORD}${NC}"

    # Generate JWT secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" 2>/dev/null || openssl rand -hex 48)

    # Write .env
    cat > .env << EOF
# ═══ TORRA Production Environment ═══
# Generated: $(date -u +"%Y-%m-%d %H:%M UTC")

# Domain (no https://, no trailing slash)
DOMAIN=${DOMAIN}

# Database
DB_USER=torra_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=torra_realestate

# JWT (96-char hex secret)
JWT_SECRET=${JWT_SECRET}

# Email (optional — uncomment and fill)
# SENDGRID_API_KEY=
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASS=

# Mapbox (optional — OpenStreetMap works without a key)
# VITE_MAPBOX_ACCESS_TOKEN=
EOF
    ok ".env created at $(pwd)/.env"
    echo ""
    warn "Review .env before continuing: cat .env"
    echo ""
else
    ok ".env already exists"

    # Validate required vars
    source .env 2>/dev/null || true
    [ -z "${DOMAIN:-}" ]     && fail "DOMAIN not set in .env"
    [ -z "${JWT_SECRET:-}" ] && fail "JWT_SECRET not set in .env"
    [ -z "${DB_PASSWORD:-}" ] && fail "DB_PASSWORD not set in .env"
    ok "Environment variables validated"
fi

# ── Step 4: Firewall ────────────────────────────────────────
info "Checking firewall..."
if command -v ufw &>/dev/null; then
    ufw allow 80/tcp   2>/dev/null || true
    ufw allow 443/tcp  2>/dev/null || true
    ufw allow 22/tcp   2>/dev/null || true
    ufw --force enable 2>/dev/null || true
    ok "UFW: ports 22, 80, 443 open"
else
    warn "UFW not installed — make sure ports 80 and 443 are open in Hostinger firewall panel"
fi

# ── Step 5: Build and launch ─────────────────────────────────
echo ""
info "Building Docker images (this takes 2–5 minutes on first run)..."
echo ""

docker compose -f "$COMPOSE_FILE" build --no-cache 2>&1 | tail -5

echo ""
info "Starting services..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for healthy
echo ""
info "Waiting for services to be healthy..."
sleep 10

# ── Step 6: Health check ─────────────────────────────────────
echo ""
info "Service status:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
# Check backend health
BACKEND_HEALTH=$(docker exec torra_backend wget -qO- http://localhost:5000/api/health 2>/dev/null || echo '{"status":"unknown"}')
if echo "$BACKEND_HEALTH" | grep -q '"healthy"'; then
    ok "Backend is healthy"
else
    warn "Backend may still be starting (Prisma sync). Check again in 30s:"
    echo "  docker exec torra_backend wget -qO- http://localhost:5000/api/health"
fi

# ── Step 7: Seed (optional) ──────────────────────────────────
echo ""
read -rp "🌱 Seed the database with demo data? [y/N]: " SEED
if [[ "${SEED,,}" = "y" ]]; then
    info "Seeding database..."
    docker exec torra_backend node prisma/seed.js
    ok "Database seeded"
fi

# ── Step 8: DNS reminder ─────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  ✅ Deployment complete!${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}DNS Setup Required:${NC}"
echo -e "  Point your domain's A record to this server's IP:"
echo -e "    $(hostname -I 2>/dev/null | awk '{print $1}' || echo '<your-vps-ip>')"
echo ""
echo -e "  In Hostinger panel → DNS Zone Editor:"
echo -e "    ${DOMAIN}        → A    → $(hostname -I 2>/dev/null | awk '{print $1}' || echo '<your-vps-ip>')"
echo -e "    www.${DOMAIN}    → A    → $(hostname -I 2>/dev/null | awk '{print $1}' || echo '<your-vps-ip>')"
echo ""
echo -e "  Once DNS propagates (1–15 min), Caddy will auto-issue an SSL cert."
echo -e "  Your site will be live at: ${GREEN}https://${DOMAIN}${NC}"
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
echo -e "    View logs:     docker compose -f $COMPOSE_FILE logs -f"
echo -e "    Restart:       docker compose -f $COMPOSE_FILE restart"
echo -e "    Stop:          docker compose -f $COMPOSE_FILE down"
echo -e "    Rebuild:       docker compose -f $COMPOSE_FILE up -d --build"
echo -e "    DB shell:      docker exec -it torra_postgres psql -U torra_user torra_realestate"
echo -e "    Backend shell: docker exec -it torra_backend sh"
echo ""
