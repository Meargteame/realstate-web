#!/usr/bin/env node
/**
 * TORRA Real Estate — Production Pre-flight Checks
 * Run: node scripts/preflight.js
 *
 * Validates everything is ready before deploying to production.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'frontend');

let passed = 0;
let failed = 0;
let warnings = 0;

function check(label, fn) {
  try {
    const result = fn();
    if (result === true) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else if (result === 'warn') {
      console.log(`  ⚠️  ${label}`);
      warnings++;
    } else {
      console.log(`  ❌ ${label} — ${result}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ ${label} — ${err.message.split('\n')[0]}`);
    failed++;
  }
}

console.log('\n🚀 TORRA Real Estate — Production Pre-flight\n');

// ── 1. ENVIRONMENT ──────────────────────────────────────
console.log('📋 Environment & Secrets');

check('Backend .env exists', () => {
  if (!fs.existsSync(path.join(BACKEND, '.env'))) return '.env not found';
  return true;
});

check('JWT_SECRET is not the dev placeholder', () => {
  const env = fs.readFileSync(path.join(BACKEND, '.env'), 'utf8');
  if (env.includes('dev-only-local-secret') || env.includes('your-super-secret'))
    return 'Weak/placeholder JWT_SECRET detected';
  const m = env.match(/JWT_SECRET=(.+)/);
  if (!m || m[1].length < 32) return 'JWT_SECRET too short (< 32 chars)';
  return true;
});

check('Backend .env has ALLOWED_ORIGINS set', () => {
  const env = fs.readFileSync(path.join(BACKEND, '.env'), 'utf8');
  if (!env.includes('ALLOWED_ORIGINS=')) return 'ALLOWED_ORIGINS not set';
  if (env.includes('ALLOWED_ORIGINS=http://localhost') && process.env.NODE_ENV === 'production')
    return 'warn'; // only warn if not production
  return true;
});

check('Root docker-compose .env.example is present', () => {
  return fs.existsSync(path.join(ROOT, '.env.example'));
});

// ── 2. DOCKER FILES ─────────────────────────────────────
console.log('\n🐳 Docker');

check('backend/Dockerfile exists and uses npm ci', () => {
  const df = fs.readFileSync(path.join(BACKEND, 'Dockerfile'), 'utf8');
  if (!df.includes('npm ci')) return 'Still using npm install';
  if (df.includes('2.24.223')) return 'Hardcoded dev IP found';
  return true;
});

check('frontend/Dockerfile — no hardcoded IPs', () => {
  const df = fs.readFileSync(path.join(FRONTEND, 'Dockerfile'), 'utf8');
  if (df.includes('2.24.223') || df.includes('VITE_API_URL=http://'))
    return 'Hardcoded dev IP or VITE_API_URL found';
  return true;
});

check('backend/.dockerignore exists', () => {
  return fs.existsSync(path.join(BACKEND, '.dockerignore'));
});

check('frontend/.dockerignore exists', () => {
  return fs.existsSync(path.join(FRONTEND, '.dockerignore'));
});

check('docker-compose.yml uses healthchecks', () => {
  const dc = fs.readFileSync(path.join(ROOT, 'docker-compose.yml'), 'utf8');
  if (!dc.includes('healthcheck')) return 'No healthchecks defined';
  return true;
});

check('backend/Procfile exists (Heroku/Railway)', () => {
  return fs.existsSync(path.join(BACKEND, 'Procfile'));
});

// ── 3. BACKEND BUILD ────────────────────────────────────
console.log('\n⚙️  Backend');

check('node_modules installed', () => {
  if (!fs.existsSync(path.join(BACKEND, 'node_modules'))) return 'Run: cd backend && npm install';
  return true;
});

check('Prisma client generated', () => {
  const clientPath = path.join(BACKEND, 'node_modules', '.prisma', 'client', 'index.js');
  if (!fs.existsSync(clientPath)) return 'Run: cd backend && npx prisma generate';
  return true;
});

check('No hardcoded dev DB connection strings in source (controllers/routes/services)', () => {
  const dirs = ['controllers', 'routes', 'services', 'middleware'];
  for (const dir of dirs) {
    const dirPath = path.join(BACKEND, dir);
    if (!fs.existsSync(dirPath)) continue;
    for (const file of fs.readdirSync(dirPath)) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
      if (content.includes('postgres:root@localhost') || content.includes('password123'))
        return `Dev credentials in ${dir}/${file}`;
    }
  }
  return true;
});

// ── 4. FRONTEND BUILD ───────────────────────────────────
console.log('\n🎨 Frontend');

check('node_modules installed', () => {
  if (!fs.existsSync(path.join(FRONTEND, 'node_modules'))) return 'Run: cd frontend && npm install';
  return true;
});

check('Production build succeeds', () => {
  try {
    execSync('npx vite build', { cwd: FRONTEND, stdio: 'pipe', timeout: 300000 });
    return true;
  } catch (err) {
    return 'Build failed: ' + err.stderr?.toString().split('\n')[0] || err.message;
  }
});

check('Code-split chunks present (antd, maps, charts)', () => {
  const dist = path.join(FRONTEND, 'dist', 'assets');
  if (!fs.existsSync(dist)) return 'No dist/assets — run build first';
  const files = fs.readdirSync(dist);
  const hasAntd = files.some(f => f.startsWith('antd-'));
  const hasMaps = files.some(f => f.startsWith('maps-'));
  const hasCharts = files.some(f => f.startsWith('charts-'));
  if (!hasAntd) return 'antd chunk missing';
  if (!hasMaps) return 'warn';
  if (!hasCharts) return 'warn';
  return true;
});

// ── 5. GIT HYGIENE ──────────────────────────────────────
console.log('\n📦 Git Hygiene');

check('.gitignore blocks .env files', () => {
  const gi = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  if (!gi.includes('.env')) return '.env not in .gitignore';
  return true;
});

check('.gitignore blocks backend test/fix scripts', () => {
  const gi = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  if (!gi.includes('backend/test-*.js')) return 'test scripts not gitignored';
  return true;
});

check('pgdata/ is gitignored', () => {
  const gi = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  if (!gi.includes('pgdata')) return 'pgdata not ignored';
  return true;
});

// ── SUMMARY ─────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log(`  ✅ Passed:   ${passed}`);
console.log(`  ⚠️  Warnings: ${warnings}`);
console.log(`  ❌ Failed:   ${failed}`);
console.log('─'.repeat(50));

if (failed > 0) {
  console.log('\n❌ Not ready for production. Fix the issues above.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  Mostly ready — review warnings above.\n');
  process.exit(0);
} else {
  console.log('\n✅ All checks passed — ready for production!\n');
  process.exit(0);
}
